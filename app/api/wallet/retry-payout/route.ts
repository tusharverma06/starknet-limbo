import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  sendFromHouseWallet,
  getHouseWalletBalance,
} from "@/lib/security/houseWallet";

/**
 * POST /api/wallet/retry-payout
 * Retry pending payout transactions for bets stuck in "pending_payout" or "processing" status
 * Can be called manually or via a cron job
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { betId } = body;

    // If betId provided, retry specific bet
    // Otherwise, retry all pending payouts
    const whereClause = betId
      ? { id: betId, status: { in: ["pending_payout", "processing"] } }
      : {
          status: { in: ["pending_payout", "processing"] },
          outcome: "win", // Only retry winning bets
        };

    const pendingBets = await prisma.bet.findMany({
      where: whereClause,
      include: {
        user: true,
      },
    });

    console.log(`🔄 Found ${pendingBets.length} pending payout(s) to retry`);

    if (pendingBets.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending payouts found",
        processed: 0,
      });
    }

    const results = [];

    for (const bet of pendingBets) {
      const result = {
        betId: bet.id,
        success: false,
        error: null as string | null,
        txHash: null as string | null,
      };

      try {
        console.log(`💰 Processing payout for bet ${bet.id}`);

        const payoutAmount = BigInt(bet.payout);
        const userWalletAddress = bet.user.server_wallet_address;

        if (!userWalletAddress) {
          result.error = "User wallet address not found";
          results.push(result);
          continue;
        }

        // Check house wallet balance
        const houseBalance = await getHouseWalletBalance();
        console.log(
          `🏦 House wallet balance: ${houseBalance.toString()}, needed: ${payoutAmount.toString()}`
        );

        if (houseBalance < payoutAmount) {
          result.error = "Insufficient house wallet balance";
          results.push(result);
          console.error(
            `❌ Insufficient house wallet balance for bet ${bet.id}`
          );
          continue;
        }

        // Send payout
        console.log(`📤 Sending payout to ${userWalletAddress}`);
        const payoutTxHash = await sendFromHouseWallet(
          userWalletAddress,
          payoutAmount
        );
        console.log(`✅ Payout transaction sent: ${payoutTxHash}`);

        // Wait for transaction confirmation
        const { JsonRpcProvider } = await import("ethers");
        const rpcUrl =
          process.env.NEXT_PUBLIC_RPC_URL ||
          `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
        const provider = new JsonRpcProvider(rpcUrl);

        console.log(`⏳ Waiting for payout transaction confirmation...`);
        const receipt = await provider.waitForTransaction(payoutTxHash, 1);

        if (!receipt || receipt.status === 0) {
          throw new Error("Payout transaction failed on-chain");
        }

        console.log(`✅ Payout transaction confirmed: ${payoutTxHash}`);

        // Record payout transaction
        await prisma.walletTransaction.create({
          data: {
            userId: bet.user.id,
            txHash: payoutTxHash,
            txType: "payout",
            amount: bet.payout,
            status: "confirmed",
            confirmedAt: new Date(),
          },
        });

        // Update bet status
        await prisma.bet.update({
          where: { id: bet.id },
          data: {
            status: "resolved",
            txHash: payoutTxHash,
          },
        });

        result.success = true;
        result.txHash = payoutTxHash;
        results.push(result);

        console.log(`✅ Successfully processed payout for bet ${bet.id}`);
      } catch (error) {
        console.error(`❌ Failed to process payout for bet ${bet.id}:`, error);
        result.error = error instanceof Error ? error.message : "Unknown error";
        results.push(result);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Processed ${successCount} payout(s), ${failureCount} failed`,
      processed: successCount,
      failed: failureCount,
      results,
    });
  } catch (error) {
    console.error("Retry payout error:", error);
    return NextResponse.json(
      {
        error: "Failed to retry payouts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet/retry-payout
 * List all pending payouts without processing them
 */
export async function GET(req: NextRequest) {
  try {
    const pendingBets = await prisma.bet.findMany({
      where: {
        status: { in: ["pending_payout", "processing"] },
        outcome: "win",
      },
      include: {
        user: {
          select: {
            id: true,
            wallet_address: true,
            server_wallet_address: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: pendingBets.length,
      bets: pendingBets.map((bet) => ({
        id: bet.id,
        userId: bet.userId,
        wager: bet.wager,
        payout: bet.payout,
        status: bet.status,
        createdAt: bet.createdAt,
        userWalletAddress: bet.user.wallet_address,
        custodialWalletAddress: bet.user.server_wallet_address,
      })),
    });
  } catch (error) {
    console.error("List pending payouts error:", error);
    return NextResponse.json(
      {
        error: "Failed to list pending payouts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
