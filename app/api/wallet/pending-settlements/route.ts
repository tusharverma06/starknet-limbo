import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyRequest } from "@/lib/auth/quickAuthMiddleware";

/**
 * GET /api/wallet/pending-settlements
 * Get pending bet settlements for the current user
 * Uses Quick Auth JWT tokens for authentication
 *
 * Note: With instant house wallet payouts, this will typically return 0 pending bets.
 * Only bets with status "pending" are truly unresolved.
 */
export async function GET(req: NextRequest) {
  try {
    // Verify Quick Auth token
    const authResult = await verifyRequest(req);
    if (!authResult.success || !authResult.fid) {
      return authResult.response;
    }

    // Get user from database by Farcaster ID
    const user = await prisma.user.findUnique({
      where: { farcaster_id: authResult.fid.toString() },
      select: { id: true },
    });

    if (!user?.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all pending bets for this user (truly unresolved bets)
    const pendingBets = await prisma.bet.findMany({
      where: {
        userId: user.id,
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        wager: true,
        payout: true,
        limboMultiplier: true,
        targetMultiplier: true,
        outcome: true,
        createdAt: true,
        resolvedAt: true,
      },
    });

    // Calculate total locked amount (bet amounts only, payouts are instant)
    const totalLocked = pendingBets.reduce(
      (sum, bet) => sum + BigInt(bet.wager),
      BigInt(0)
    );

    return NextResponse.json({
      success: true,
      pendingCount: pendingBets.length,
      totalLocked: totalLocked.toString(),
      note: "Payouts are instant from house wallet - no settlement delays",
      bets: pendingBets.map((bet) => ({
        id: bet.id,
        wager: bet.wager,
        payout: bet.payout,
        multiplier: bet.limboMultiplier,
        targetMultiplier: bet.targetMultiplier,
        outcome: bet.outcome,
        createdAt: bet.createdAt.toISOString(),
        resolvedAt: bet.resolvedAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Pending settlements error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
