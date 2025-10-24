import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  sendFromHouseWallet,
  getHouseWalletBalance,
} from "@/lib/security/houseWallet";
import { requireApiKey } from "@/lib/security/apiAuth";

/**
 * POST /api/wallet/payout
 * Process pending payouts for winning bets
 * This can be called by a background job or manually triggered
 *
 * SECURITY: Requires API key authentication via x-api-key header
 *
 * For off-chain balance management, payouts are instant.
 * This endpoint can be used for actual on-chain transfers if needed.
 */
async function payoutHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { betId, onChainPayout } = body;

    // Find bet that needs payout
    let bet;
    if (betId) {
      bet = await prisma.bet.findUnique({
        where: { id: betId },
        include: { user: true },
      });

      if (!bet) {
        return NextResponse.json({ error: "Bet not found" }, { status: 404 });
      }

      // Check if already paid out on-chain
      if (bet.txHash && bet.txHash.startsWith("0x")) {
        return NextResponse.json(
          { error: "Bet already paid out on-chain" },
          { status: 400 }
        );
      }

      // Check if it's a winning bet
      if (bet.outcome !== "win") {
        return NextResponse.json(
          { error: "Bet is not a win" },
          { status: 400 }
        );
      }
    } else {
      // Find oldest pending payout
      bet = await prisma.bet.findFirst({
        where: {
          outcome: "win",
          status: "resolved",
          txHash: null,
        },
        orderBy: { createdAt: "asc" },
        include: { user: true },
      });

      if (!bet) {
        return NextResponse.json({
          success: true,
          message: "No pending payouts",
        });
      }
    }

    console.log("💰 Processing payout for bet:", bet.id);

    // If onChainPayout is requested, send actual on-chain transaction
    if (onChainPayout) {
      const payoutAmount = BigInt(bet.payout);

      // Check house wallet balance
      const houseBalance = await getHouseWalletBalance();
      if (houseBalance < payoutAmount) {
        return NextResponse.json(
          {
            error: "Insufficient house wallet balance",
            required: payoutAmount.toString(),
            available: houseBalance.toString(),
          },
          { status: 400 }
        );
      }

      console.log("📤 Sending on-chain payout from house wallet:", {
        to: bet.playerId,
        amount: payoutAmount.toString(),
      });

      // Send payout from house wallet (securely, no key logging)
      const txHash = await sendFromHouseWallet(bet.playerId, payoutAmount);

      console.log("✅ Payout transaction sent:", txHash);

      // Update bet with transaction hash
      await prisma.bet.update({
        where: { id: bet.id },
        data: {
          txHash: txHash,
          status: "settled",
        },
      });

      // Record transaction
      await prisma.walletTransaction.create({
        data: {
          userId: bet.userId,
          txHash: txHash,
          txType: "payout",
          amount: payoutAmount.toString(),
          status: "pending", // Will be confirmed by monitoring service
        },
      });

      return NextResponse.json({
        success: true,
        betId: bet.id,
        txHash: txHash,
        payout: payoutAmount.toString(),
      });
    } else {
      // Off-chain payout (already handled in place-bet, just update status)
      // Mark as completed
      await prisma.bet.update({
        where: { id: bet.id },
        data: {
          txHash: `offchain-payout-${bet.id}`,
        },
      });

      return NextResponse.json({
        success: true,
        betId: bet.id,
        payout: bet.payout,
        message: "Off-chain payout completed (balance already updated)",
      });
    }
  } catch (error) {
    // Never log errors that might contain sensitive data
    console.error("Payout error occurred");
    return NextResponse.json(
      {
        error: "Payout failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Wrap with API key authentication
export const POST = requireApiKey(payoutHandler);

/**
 * GET /api/wallet/payout
 * Get pending payouts statistics
 *
 * SECURITY: Requires API key authentication
 */
async function getPayoutsHandler() {
  try {
    const pendingPayouts = await prisma.bet.findMany({
      where: {
        outcome: "win",
        status: "resolved",
        OR: [{ txHash: null }, { txHash: { startsWith: "offchain-" } }],
      },
      select: {
        id: true,
        payout: true,
        createdAt: true,
        playerId: true,
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    const totalPending = pendingPayouts.reduce(
      (sum, bet) => sum + BigInt(bet.payout),
      BigInt(0)
    );

    return NextResponse.json({
      count: pendingPayouts.length,
      totalPending: totalPending.toString(),
      payouts: pendingPayouts,
    });
  } catch (error) {
    console.error("Get payouts error occurred");
    return NextResponse.json(
      {
        error: "Failed to get payouts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Wrap with API key authentication
export const GET = requireApiKey(getPayoutsHandler);
