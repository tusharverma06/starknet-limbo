import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/wallet/bet-history
 * Get bet history for a user or player address
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const playerId = searchParams.get("playerId");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause (empty object if no filters = fetch all bets)
    const where: {
      userId?: string;
      playerId?: string;
    } = {};

    if (userId) {
      where.userId = userId;
    }
    if (playerId) {
      where.playerId = playerId.toLowerCase();
    }

    // Fetch bets
    const bets = await prisma.bet.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
      include: {
        user: {
          select: {
            farcaster_username: true,
            farcaster_pfp: true,
          },
        },
      },
    });

    // Format response
    const formattedBets = bets.map((bet) => ({
      id: bet.id,
      playerId: bet.playerId,
      playerName: bet.user.farcaster_username,
      playerPfp: bet.user.farcaster_pfp,
      wager: bet.wagerUsd || "0", // Use USD amount instead of wei
      targetMultiplier: bet.targetMultiplier,
      limboMultiplier: bet.limboMultiplier,
      outcome: bet.outcome,
      payout: bet.payoutUsd || "0", // Use USD amount instead of wei
      status: bet.status,
      txHash: bet.txHash,
      createdAt: bet.createdAt.toISOString(),
      resolvedAt: bet.resolvedAt?.toISOString() || null,
    }));

    return NextResponse.json({
      success: true,
      bets: formattedBets,
      count: formattedBets.length,
    });
  } catch (error) {
    console.error("Get bet history error:", error);
    return NextResponse.json(
      {
        error: "Failed to get bet history",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
