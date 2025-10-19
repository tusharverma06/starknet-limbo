import { NextRequest, NextResponse } from "next/server";
import { JsonRpcProvider, Wallet, parseEther } from "ethers";
import { walletDb } from "@/lib/db/wallets";
import { decryptPrivateKey } from "@/lib/utils/encryption";
import { getEthValueFromUsd } from "@/lib/utils/price";
import { CHAIN } from "@/lib/contract/config";
import { estimateGas } from "@/lib/utils/gas";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

/**
 * POST /api/wallet/withdraw
 * Withdraw funds from server wallet to external address
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, toAddress, usdAmount } = body;

    // Validate inputs
    if (!userId || !toAddress || !usdAmount) {
      return NextResponse.json(
        { error: "userId, toAddress, and usdAmount are required" },
        { status: 400 }
      );
    }

    // Validate amount
    const usdAmountNum = parseFloat(usdAmount);
    if (isNaN(usdAmountNum) || usdAmountNum <= 0) {
      return NextResponse.json(
        { error: "Invalid USD amount" },
        { status: 400 }
      );
    }

    // Convert USD to ETH
    const ethAmount = await getEthValueFromUsd(usdAmountNum);
    if (ethAmount <= 0) {
      return NextResponse.json(
        { error: "Failed to convert USD to ETH" },
        { status: 400 }
      );
    }

    // Get user from database (userId is Farcaster FID)
    const user = await getOrCreateUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get or create user' },
        { status: 500 }
      );
    }

    // Get wallet from database
    const walletData = await walletDb.getWallet(user.id);
    if (!walletData) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Decrypt private key
    const privateKey = decryptPrivateKey(walletData.encryptedPrivateKey);

    // Create provider and wallet using Alchemy RPC
    const rpcUrl =
      process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || CHAIN.rpcUrls.default.http[0];
    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(privateKey, provider);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    // Round to 18 decimals to avoid parseEther precision errors
    const ethAmountRounded = parseFloat(ethAmount.toFixed(18));
    const withdrawAmount = parseEther(ethAmountRounded.toString());

    // Estimate gas using utility
    let gasEstimation;
    try {
      gasEstimation = await estimateGas(
        provider,
        wallet.address,
        toAddress,
        ethAmountRounded.toString()
      );

      console.log("⛽ Gas estimate:", gasEstimation.gasLimit);
      console.log("⛽ Gas price:", gasEstimation.gasPrice, "gwei");
      console.log("⛽ Total gas cost:", gasEstimation.totalCost, "ETH");
    } catch (error) {
      console.error("Gas estimation error:", error);
      return NextResponse.json(
        {
          error: "Failed to estimate gas",
          message:
            error instanceof Error
              ? error.message
              : "Could not estimate transaction cost",
        },
        { status: 400 }
      );
    }

    const gasCost = parseEther(gasEstimation.totalCost);

    // Check if we have enough for withdrawal + gas
    if (balance < withdrawAmount + gasCost) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          required: (withdrawAmount + gasCost).toString(),
          available: balance.toString(),
          withdrawAmount: withdrawAmount.toString(),
          gasCost: gasCost.toString(),
        },
        { status: 400 }
      );
    }

    // Send transaction
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: withdrawAmount,
    });

    console.log("📤 Withdrawal transaction sent:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();

    // Update last used timestamp
    await walletDb.updateLastUsed(user.id);

    // Update balance
    const newBalance = await provider.getBalance(wallet.address);
    await walletDb.updateBalance(user.id, newBalance.toString());

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
      { status: 500 }
    );
  }
}
