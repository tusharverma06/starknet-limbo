import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/wallet/bet-history
 * Get bet history for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: { playerId?: string } = playerId
      ? { playerId: playerId.toLowerCase() }
      : {};

    // Fetch bets
    const bets = await prisma.bet.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
      include: {
        user: {
          select: {
            wallet_address: true,
          },
        },
      },
    });

    // Format response
    const formattedBets = bets.map((bet) => ({
      id: bet.id,
      playerId: bet.playerId,
      playerName: null, // TODO: Add player name from user profile
      playerPfp: null, // TODO: Add player profile picture from user profile
      playerAddress: bet.user.wallet_address,
      wager: bet.wagerUsd || "0", // Use USD amount instead of wei
      targetMultiplier: bet.targetMultiplier ? parseInt(bet.targetMultiplier) : 0,
      limboMultiplier: bet.limboMultiplier ? parseInt(bet.limboMultiplier) : null,
      outcome: bet.outcome as "win" | "loss" | null,
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
