import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/wallet/bet-history
 * Get bet history for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(req);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult.data;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    // Get bets for authenticated user only
    const where = {
      userId: user.id,
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
