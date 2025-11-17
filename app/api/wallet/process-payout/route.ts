import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  sendFromHouseWallet,
  getHouseWalletBalance,
} from "@/lib/security/houseWallet";
import { JsonRpcProvider } from "ethers";

/**
 * POST /api/wallet/process-payout
 * Send payout from house wallet to user (for wins)
 * This runs in background after bet result is returned
 */
export async function POST(req: NextRequest) {
  try {
    // CRITICAL: Verify this is an internal server call
    // Only the server should call this endpoint
    const internalApiKey = req.headers.get("x-internal-api-key");
    const expectedKey = process.env.INTERNAL_API_KEY;

    if (internalApiKey !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized - internal endpoint" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { betId, userId, userWalletAddress, payout } = body;

    // Validate inputs
    if (!betId || !userId || !userWalletAddress || !payout) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const payoutAmount = BigInt(payout);

    console.log(`💰 Processing payout for bet: ${betId}`);
    console.log(`   Amount: ${payout} wei`);
    console.log(`   User: ${userWalletAddress}`);

    // Check house wallet balance
    const houseBalance = await getHouseWalletBalance();
    console.log(`🏦 House wallet balance: ${houseBalance}`);

    if (houseBalance < payoutAmount) {
      console.log(`⚠️ Insufficient house balance - marking as pending payout`);
      // Mark as pending payout to be processed later
      await prisma.bet.update({
        where: { id: betId },
        data: {
          status: "pending_payout",
        },
      });
      return NextResponse.json(
        {
          error: "Insufficient house balance",
          message: "Payout will be processed when funds are available",
        },
        { status: 202 } // 202 Accepted - will process later
      );
    }

    try {
      console.log(`📤 Sending payout from house to user...`);

      const payoutTxHash = await sendFromHouseWallet(
        userWalletAddress,
        payoutAmount
      );

      console.log(`✅ Payout transaction sent: ${payoutTxHash}`);

      // Wait for transaction confirmation
      const rpcUrl =
        process.env.NEXT_PUBLIC_RPC_URL ||
        `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
      const provider = new JsonRpcProvider(rpcUrl);

      console.log(`⏳ Waiting for payout transaction confirmation...`);
      const receipt = await provider.waitForTransaction(payoutTxHash, 1);

      if (!receipt || receipt.status === 0) {
        throw new Error("Payout transaction failed on-chain");
      }

      console.log(`✅ Payout transaction confirmed: ${payoutTxHash}`);

      // Update existing pending payout transaction with tx hash
      const existingPayoutTx = await prisma.walletTransaction.findFirst({
        where: {
          userId: userId,
          txType: "payout",
          status: "pending",
          txHash: null,
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingPayoutTx) {
        await prisma.walletTransaction.update({
          where: { id: existingPayoutTx.id },
          data: {
            txHash: payoutTxHash,
            status: "confirmed",
            confirmedAt: new Date(),
            blockNumber: receipt?.blockNumber
              ? BigInt(receipt.blockNumber)
              : null,
          },
        });
        console.log(`✅ Payout transaction updated in database`);
      } else {
        // Fallback: create new transaction if pending one doesn't exist
        await prisma.walletTransaction.create({
          data: {
            userId: userId,
            txHash: payoutTxHash,
            txType: "payout",
            amount: payout,
            status: "confirmed",
            confirmedAt: new Date(),
            blockNumber: receipt?.blockNumber
              ? BigInt(receipt.blockNumber)
              : null,
          },
        });
        console.log(`✅ Payout transaction created in database`);
      }

      // Update bet status to resolved (fully complete)
      await prisma.bet.update({
        where: { id: betId },
        data: {
          status: "resolved",
          txHash: payoutTxHash,
        },
      });

      console.log(`✅ Payout complete for bet: ${betId}`);

      return NextResponse.json({
        success: true,
        txHash: payoutTxHash,
        message: "Payout sent successfully",
      });
    } catch (error) {
      console.error(`❌ Payout failed:`, error);

      // Mark as pending payout to retry later
      await prisma.bet.update({
        where: { id: betId },
        data: {
          status: "pending_payout",
        },
      });

      throw error;
    }
  } catch (error) {
    console.error("Process payout error:", error);
    return NextResponse.json(
      {
        error: "Failed to process payout",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
