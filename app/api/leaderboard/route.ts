import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/leaderboard?fid=123
 *
 * Get top users by points with ranks.
 * Returns user's rank if FID is provided.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fid = searchParams.get("fid");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get top users
    const topUsers = await prisma.user.findMany({
      select: {
        farcaster_id: true,
        farcaster_username: true,
        farcaster_pfp: true,
        totalPoints: true,
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

    // Add rank to each user
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      fid: user.farcaster_id,
      username: user.farcaster_username,
      pfp: user.farcaster_pfp,
      points: user.totalPoints,
      referrals: user._count.referralsGiven,
    }));

    let userRank = null;
    if (fid) {
      const userIndex = leaderboard.findIndex((u) => u.fid === fid);
      if (userIndex !== -1) {
        userRank = userIndex + 1;
      } else {
        // User not in top 100, calculate their rank
        const usersAbove = await prisma.user.count({
          where: {
            totalPoints: {
              gt: (await prisma.user.findUnique({
                where: { farcaster_id: fid },
                select: { totalPoints: true },
              }))?.totalPoints || 0,
            },
          },
        });
        userRank = usersAbove + 1;
      }
    }

    return NextResponse.json({
      leaderboard,
      userRank,
      total: await prisma.user.count(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
