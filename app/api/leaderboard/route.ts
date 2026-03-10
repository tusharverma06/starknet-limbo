import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/leaderboard?address=0x...
 *
 * Get top users by points with ranks.
 * Returns user's rank if address is provided.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get top users
    const topUsers = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            referralsGiven: true,
          },
        },
      },
      orderBy: {
        totalPoints: "desc",
      },
      take: limit,
    });

    // Add rank to each user - display shortened wallet address
    const leaderboard = topUsers.map((user, index) => {
      const displayName = user.wallet_address
        ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
        : "Anonymous";

      return {
        rank: index + 1,
        displayName,
        avatarUrl: null,
        email: null,
        address: user.wallet_address,
        points: user.totalPoints,
        referrals: user._count.referralsGiven,
        isCurrentUser: !!address && user.wallet_address === address.toLowerCase(),
      };
    });

    let userRank = null;
    if (address) {
      const normalizedAddress = address.toLowerCase();
      const userIndex = leaderboard.findIndex(
        (u, idx) => topUsers[idx].wallet_address === normalizedAddress
      );
      if (userIndex !== -1) {
        userRank = userIndex + 1;
      } else {
        // User not in top 100, calculate their rank
        const userData = await prisma.user.findUnique({
          where: { wallet_address: normalizedAddress },
          select: { totalPoints: true },
        });

        if (userData) {
          const usersAbove = await prisma.user.count({
            where: {
              totalPoints: {
                gt: userData.totalPoints,
              },
            },
          });
          userRank = usersAbove + 1;
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      userRank,
      total: await prisma.user.count(),
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
