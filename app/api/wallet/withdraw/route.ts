import { NextRequest, NextResponse } from "next/server";
import { JsonRpcProvider, Wallet, parseEther } from "ethers";
import { walletDb } from "@/lib/db/wallets";
import { decryptPrivateKey } from "@/lib/utils/encryption";
import { getEthValueFromUsd } from "@/lib/utils/price";
import { CHAIN } from "@/lib/constants";
import { estimateGas } from "@/lib/utils/gas";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * POST /api/wallet/withdraw
 * Withdraw funds from custodial wallet to external address
 * Requires JWT authentication (session cookie)
 */
export async function POST(req: NextRequest) {
  try {
    // Require JWT authentication
    const authResult = await requireAuth(req);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user, body: parsedBody } = authResult.data;

    // Use body from auth if available, otherwise parse it
    const body = parsedBody || (await req.json());
    const { toAddress, usdAmount } = body;

    // Validate inputs
    if (!toAddress || !usdAmount) {
      return NextResponse.json(
        { error: "toAddress and usdAmount are required" },
        { status: 400 },
      );
    }

    // Validate recipient address format
    if (
      typeof toAddress !== "string" ||
      toAddress.length !== 42 ||
      !toAddress.startsWith("0x")
    ) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 },
      );
    }

    console.log(
      "✅ JWT authentication valid, processing withdrawal for user:",
      user.id,
    );

    // Validate amount
    const usdAmountNum = parseFloat(usdAmount);
    if (isNaN(usdAmountNum) || usdAmountNum <= 0) {
      return NextResponse.json(
        { error: "Invalid USD amount" },
        { status: 400 },
      );
    }

    // Check minimum amount
    if (usdAmountNum < 0.01) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is $0.01" },
        { status: 400 },
      );
    }

    // Convert USD to ETH
    const ethAmount = await getEthValueFromUsd(usdAmountNum);
    if (ethAmount <= 0) {
      return NextResponse.json(
        { error: "Failed to convert USD to ETH" },
        { status: 400 },
      );
    }

    console.log(
      `💸 Processing withdrawal: $${usdAmountNum} (~${ethAmount} ETH) to ${toAddress}`,
    );

    // Get user with custodial wallet
    const userWithWallet = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        custodial_wallet_id: true,
        custodialWallet: {
          select: {
            id: true,
            address: true,
            wallet: true,
          },
        },
      },
    });

    if (!userWithWallet?.custodialWallet?.wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Decrypt private key
    const privateKey = decryptPrivateKey(
      userWithWallet.custodialWallet.wallet.encryptedPrivateKey,
    );

    // Create provider and wallet using Alchemy RPC
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL || CHAIN.rpcUrls.default.http[0];
    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(privateKey, provider);

    // Check balance first
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Current balance:", balance.toString(), "wei");

    // Round to 18 decimals to avoid parseEther precision errors
    const ethAmountRounded = parseFloat(ethAmount.toFixed(18));
    const withdrawAmount = parseEther(ethAmountRounded.toString());

    console.log("📤 Withdraw amount:", withdrawAmount.toString(), "wei");

    // Check if balance is zero
    if (balance === BigInt(0)) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          message: "Your wallet balance is 0. Please fund your wallet first.",
        },
        { status: 400 },
      );
    }

    // Check if withdrawal amount exceeds balance (before considering gas)
    if (withdrawAmount > balance) {
      const balanceInEth = (Number(balance) / 1e18).toFixed(6);
      return NextResponse.json(
        {
          error: "Insufficient balance",
          message: `Withdrawal amount ($${usdAmountNum.toFixed(
            2,
          )}) exceeds your balance (~${balanceInEth} ETH). Please reduce the amount.`,
          available: balance.toString(),
          requested: withdrawAmount.toString(),
        },
        { status: 400 },
      );
    }

    // Estimate gas using utility with fallback
    let gasEstimation;
    let gasCost: bigint;

    try {
      gasEstimation = await estimateGas(
        provider,
        wallet.address,
        toAddress,
        ethAmountRounded.toString(),
      );

      console.log("⛽ Gas estimate:", gasEstimation.gasLimit);
      console.log("⛽ Gas price:", gasEstimation.gasPrice, "gwei");
      console.log("⛽ Total gas cost:", gasEstimation.totalCost, "ETH");

      gasCost = parseEther(gasEstimation.totalCost);
    } catch (error) {
      console.error("Gas estimation error:", error);
      // Use fallback gas estimation: 21000 gas limit * current gas price
      try {
        const feeData = await provider.getFeeData();
        if (!feeData.gasPrice) {
          throw new Error("Could not get gas price");
        }
        gasCost = BigInt(21000) * feeData.gasPrice;
        console.log(
          "⛽ Using fallback gas estimate:",
          gasCost.toString(),
          "wei",
        );
      } catch (fallbackError) {
        console.error("Fallback gas estimation failed:", fallbackError);
        return NextResponse.json(
          {
            error: "Gas estimation failed",
            message:
              "Could not estimate transaction cost. The network may be experiencing issues. Please try again later.",
          },
          { status: 500 },
        );
      }
    }

    // Check if we have enough for withdrawal + gas
    const totalRequired = withdrawAmount + gasCost;
    if (balance < totalRequired) {
      const balanceInEth = (Number(balance) / 1e18).toFixed(6);
      const requiredInEth = (Number(totalRequired) / 1e18).toFixed(6);
      const gasCostInEth = (Number(gasCost) / 1e18).toFixed(6);

      return NextResponse.json(
        {
          error: "Insufficient balance for gas",
          message: `Your balance (~${balanceInEth} ETH) is not enough to cover the withdrawal and gas fees (~${gasCostInEth} ETH gas). Total needed: ~${requiredInEth} ETH. Please reduce the withdrawal amount or add more funds.`,
          available: balance.toString(),
          withdrawAmount: withdrawAmount.toString(),
          gasCost: gasCost.toString(),
          totalRequired: totalRequired.toString(),
        },
        { status: 400 },
      );
    }

    // Send transaction
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: withdrawAmount,
    });

    console.log("📤 Withdrawal transaction sent:", tx.hash);

    // Record pending transaction
    await prisma.walletTransaction.create({
      data: {
        custodialWalletId: userWithWallet.custodialWallet.id,
        txHash: tx.hash,
        txType: "withdraw",
        amount: withdrawAmount.toString(),
        status: "pending",
      },
    });
    console.log("📝 Withdrawal transaction recorded");

    // Wait for confirmation with timeout
    let receipt;
    try {
      receipt = await tx.wait();

      // Update transaction status to confirmed
      await prisma.walletTransaction.updateMany({
        where: { txHash: tx.hash },
        data: {
          status: "confirmed",
          blockNumber: BigInt(receipt?.blockNumber || 0),
          gasUsed: receipt?.gasUsed?.toString() || "0",
          confirmedAt: new Date(),
        },
      });
      console.log("✅ Withdrawal confirmed in database");
    } catch (confirmError) {
      console.error("❌ Withdrawal confirmation failed:", confirmError);

      // Mark transaction as failed
      await prisma.walletTransaction.updateMany({
        where: { txHash: tx.hash },
        data: {
          status: "failed",
        },
      });

      throw new Error("Transaction failed to confirm on blockchain");
    }

    // Update balance
    const newBalance = await provider.getBalance(wallet.address);

    console.log("✅ Withdrawal confirmed:", receipt?.hash);

    return NextResponse.json({
      success: true,
      txHash: receipt?.hash,
      usdAmount: usdAmountNum,
      ethAmount: ethAmountRounded,
      to: toAddress,
      blockNumber: receipt?.blockNumber,
      newBalance: newBalance.toString(),
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      {
        error: "Withdrawal failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
