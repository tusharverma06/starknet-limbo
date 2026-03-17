import { NextRequest, NextResponse } from "next/server";
import { ec, Account, Signer } from "starknet";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";
import { decryptPrivateKey } from "@/lib/utils/encryption";
import { getEthValueFromUsd } from "@/lib/utils/price";
import { getStarknetProvider } from "@/lib/starknet/provider";
import { getEthBalance } from "@/lib/blockchain/starknet/getEthBalance";
import {
  isAccountDeployed,
  deployStarknetAccount,
} from "@/lib/starknet/deployWallet";

/**
 * Convert bigint → Uint256 (Starknet)
 */
function toUint256(value: bigint) {
  const mask = (BigInt(1) << BigInt(128)) - BigInt(1);
  const low = value & mask;

  const high = value >> BigInt(128);
  return { low: low.toString(), high: high.toString() };
}

/**
 * POST /api/wallet/withdraw
 * Starknet custodial withdrawal (user wallet signs tx)
 */
export async function POST(req: NextRequest) {
  try {
    // ✅ Auth
    const authResult = await requireAuth(req);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user, body: parsedBody } = authResult.data;
    const body = parsedBody || (await req.json());

    const { toAddress, usdAmount } = body;

    // ✅ Validate input
    if (!toAddress || !usdAmount) {
      return NextResponse.json(
        { error: "toAddress and usdAmount are required" },
        { status: 400 },
      );
    }

    if (
      typeof toAddress !== "string" ||
      toAddress.length !== 66 ||
      !toAddress.startsWith("0x")
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid Starknet address format. Address must be 66 characters including 0x prefix.",
        },
        { status: 400 },
      );
    }

    console.log("✅ Auth OK. User:", user.id);

    // ✅ Validate USD amount
    const usdAmountNum = parseFloat(usdAmount);
    if (isNaN(usdAmountNum) || usdAmountNum <= 0) {
      return NextResponse.json(
        { error: "Invalid USD amount" },
        { status: 400 },
      );
    }

    if (usdAmountNum < 0.01) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is $0.01" },
        { status: 400 },
      );
    }

    // ✅ Convert USD → ETH
    const ethAmount = await getEthValueFromUsd(usdAmountNum);
    if (ethAmount <= 0) {
      return NextResponse.json(
        { error: "Failed to convert USD to ETH" },
        { status: 400 },
      );
    }

    const ethAmountRounded = parseFloat(ethAmount.toFixed(18));

    // ✅ Convert to wei (BigInt)
    const withdrawAmount = BigInt(Math.floor(ethAmountRounded * 1e18));

    console.log(`💸 Withdraw: $${usdAmountNum} (~${ethAmountRounded} ETH)`);

    // ✅ Fetch user wallet
    const userWithWallet = await prisma.user.findUnique({
      where: { id: user.id },
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

    const walletAddress = userWithWallet.custodialWallet.address;

    // ✅ Decrypt private key
    const privateKey = decryptPrivateKey(
      userWithWallet.custodialWallet.wallet.encryptedPrivateKey,
    );

    // ✅ Setup Starknet account
    const provider = getStarknetProvider();

    const signer = new Signer(privateKey);

    const account = new Account({
      provider,
      address: walletAddress,
      signer,
    });

    // ✅ Check if wallet is deployed (lazy deployment)
    console.log("🔍 Checking if wallet is deployed...");
    const isDeployed = await isAccountDeployed(walletAddress);

    if (!isDeployed) {
      console.log("⚠️  Wallet not deployed yet - deploying now...");
      console.log("   Note: Deployment fees will be deducted from balance");

      try {
        const { txHash: deployTxHash } = await deployStarknetAccount(
          privateKey,
          walletAddress,
          false, // usePaymaster = false (user pays from their balance)
        );

        console.log("✅ Wallet deployed:", deployTxHash);

        // Record deployment transaction
        await prisma.walletTransaction.create({
          data: {
            custodialWalletId: userWithWallet.custodialWallet.id,
            txHash: deployTxHash,
            txType: "deploy",
            amount: "0", // Deployment fee is paid internally
            status: "confirmed",
            confirmedAt: new Date(),
          },
        });
      } catch (deployError) {
        console.error("❌ Deployment failed:", deployError);

        return NextResponse.json(
          {
            error: "Wallet deployment failed",
            message:
              "Your wallet needs to be deployed before withdrawing. Please contact support.",
          },
          { status: 500 },
        );
      }
    } else {
      console.log("✅ Wallet already deployed");
    }

    // ✅ Fetch on-chain balance
    const balance = await getEthBalance(walletAddress);

    console.log("💰 Balance:", balance.toString(), "wei");

    if (balance === BigInt(0)) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          message: "Wallet balance is 0.",
        },
        { status: 400 },
      );
    }

    if (withdrawAmount > balance) {
      const balanceInEth = (Number(balance) / 1e18).toFixed(6);

      return NextResponse.json(
        {
          error: "Insufficient balance",
          message: `Withdrawal exceeds balance (~${balanceInEth} ETH).`,
          available: balance.toString(),
          requested: withdrawAmount.toString(),
        },
        { status: 400 },
      );
    }

    // ✅ Prepare Starknet transfer
    const ETH_ADDRESS =
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

    console.log("withdrawAmount", withdrawAmount.toString());
    const { low, high } = toUint256(withdrawAmount);
    console.log("low/high", low, high);

    const calldata = [toAddress, low, high];
    console.log("calldata", calldata);

    console.log("📤 Sending Starknet tx...");

    // ✅ Execute transfer
    const tx = await account.execute({
      contractAddress: ETH_ADDRESS,
      entrypoint: "transfer",
      calldata,
    });
    console.log("tx", tx);

    const txHash = tx.transaction_hash;

    console.log("📤 Tx sent:", txHash);

    // ✅ Record pending tx
    await prisma.walletTransaction.create({
      data: {
        custodialWalletId: userWithWallet.custodialWallet.id,
        txHash,
        txType: "withdraw",
        amount: withdrawAmount.toString(),
        status: "pending",
      },
    });

    // ✅ Wait for confirmation
    try {
      await provider.waitForTransaction(txHash);

      await prisma.walletTransaction.updateMany({
        where: { txHash },
        data: {
          status: "confirmed",
          confirmedAt: new Date(),
        },
      });

      console.log("✅ Tx confirmed");
    } catch (err) {
      console.error("❌ Tx failed:", err);

      await prisma.walletTransaction.updateMany({
        where: { txHash },
        data: { status: "failed" },
      });

      throw new Error("Transaction failed on Starknet");
    }

    // ✅ Fetch updated balance
    const newBalance = await getEthBalance(walletAddress);

    return NextResponse.json({
      success: true,
      txHash,
      usdAmount: usdAmountNum,
      ethAmount: ethAmountRounded,
      to: toAddress,
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
