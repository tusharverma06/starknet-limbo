import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendToHouseWallet } from "@/lib/security/houseWallet";
import { JsonRpcProvider } from "ethers";

/**
 * POST /api/wallet/deduct-bet
 * Deduct bet amount from user's blockchain wallet (send to house)
 * This runs in background - fires immediately after bet is placed
 */
export async function POST(req: NextRequest) {
  try {
    // CRITICAL: Verify this is an internal server call
    // Only the server should call this endpoint
    const internalApiKey = req.headers.get("x-internal-api-key");
    const expectedKey = process.env.INTERNAL_API_KEY || "dev-internal-key";

    if (internalApiKey !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized - internal endpoint" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      betId,
      userId,
      encryptedPrivateKey,
      userWalletAddress,
      betAmount,
    } = body;

    // Validate inputs
    if (
      !betId ||
      !userId ||
      !encryptedPrivateKey ||
      !userWalletAddress ||
      !betAmount
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const betAmountWei = BigInt(betAmount);

    console.log(`📤 Deducting bet from user wallet: ${userWalletAddress}`);
    console.log(`   Amount: ${betAmount} wei`);
    console.log(`   Bet ID: ${betId}`);

    let betTxHash: string | null = null;

    try {
      // Send bet amount FROM user's wallet TO house wallet
      betTxHash = await sendToHouseWallet(
        encryptedPrivateKey,
        betAmountWei
      );

      console.log(`✅ Bet deduction transaction sent: ${betTxHash}`);

      // Wait for transaction confirmation
      const rpcUrl =
        process.env.NEXT_PUBLIC_RPC_URL ||
        `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
      const provider = new JsonRpcProvider(rpcUrl);

      console.log(`⏳ Waiting for bet deduction confirmation...`);
      const receipt = await provider.waitForTransaction(betTxHash, 1);

      if (!receipt || receipt.status === 0) {
        throw new Error("Bet deduction transaction failed on-chain");
      }

      console.log(`✅ Bet deduction confirmed: ${betTxHash}`);

      // Update existing pending bet transaction with tx hash
      const existingBetTx = await prisma.walletTransaction.findFirst({
        where: {
          userId: userId,
          txType: "bet_placed",
          status: "pending",
          txHash: null,
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingBetTx) {
        await prisma.walletTransaction.update({
          where: { id: existingBetTx.id },
          data: {
            txHash: betTxHash,
            status: "confirmed",
            confirmedAt: new Date(),
            blockNumber: receipt?.blockNumber ? BigInt(receipt.blockNumber) : null,
          },
        });
        console.log(`✅ Bet transaction updated in database`);
      } else {
        // Fallback: create new transaction if pending one doesn't exist
        await prisma.walletTransaction.create({
          data: {
            userId: userId,
            txHash: betTxHash,
            txType: "bet_placed",
            amount: betAmount,
            status: "confirmed",
            confirmedAt: new Date(),
            blockNumber: receipt?.blockNumber ? BigInt(receipt.blockNumber) : null,
          },
        });
        console.log(`✅ Bet transaction created in database`);
      }

      // CRITICAL: Unlock the locked balance now that blockchain confirmed
      const wallet = await prisma.wallet.findUnique({
        where: { userId: userId },
      });

      if (wallet) {
        const currentLockedBalance = BigInt(wallet.lockedBalance || "0");
        const newLockedBalance = currentLockedBalance - BigInt(betAmount);

        await prisma.wallet.update({
          where: { userId: userId },
          data: {
            lockedBalance: newLockedBalance.toString(),
          },
        });
        console.log(`🔓 Unlocked balance: ${betAmount} wei`);
      }

      // Update bet status to show blockchain deduction complete
      await prisma.bet.update({
        where: { id: betId },
        data: {
          status: "deducted", // Intermediate status: deducted but not yet paid out
        },
      });

      return NextResponse.json({
        success: true,
        txHash: betTxHash,
        message: "Bet deducted from blockchain",
      });
    } catch (error) {
      console.error(`❌ Bet deduction failed:`, error);

      // Mark bet as failed
      await prisma.bet.update({
        where: { id: betId },
        data: {
          status: "failed",
        },
      });

      // Unlock the locked balance since deduction failed
      const wallet = await prisma.wallet.findUnique({
        where: { userId: userId },
      });

      if (wallet) {
        const currentLockedBalance = BigInt(wallet.lockedBalance || "0");
        const newLockedBalance = currentLockedBalance - BigInt(betAmount);

        await prisma.wallet.update({
          where: { userId: userId },
          data: {
            lockedBalance: newLockedBalance.toString(),
          },
        });
        console.log(`🔓 Unlocked balance (deduction failed): ${betAmount} wei`);
      }

      throw error;
    }
  } catch (error) {
    console.error("Deduct bet error:", error);
    return NextResponse.json(
      {
        error: "Failed to deduct bet",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
