import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/leaderboard?fid=123
 *
 * Get top users by points with ranks.
 * Returns user's rank if FID is provided.
 * Fetches missing PFPs from Neynar API.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fid = searchParams.get("fid");
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

    // Find users with missing PFPs and fetch them from Neynar
    const usersWithoutPfp = topUsers.filter(
      (user) => !user.farcaster_pfp && user.farcaster_id
    );

    if (usersWithoutPfp.length > 0 && process.env.NEYNAR_API_KEY) {
      try {
        // Batch fetch PFPs from Neynar (up to 100 FIDs at once)
        const fidsToFetch = usersWithoutPfp
          .map((u) => u.farcaster_id)
          .filter((id) => !id.startsWith("temp-")) // Skip temporary users
          .slice(0, 100); // Neynar API limit

        if (fidsToFetch.length > 0) {
          const neynarResponse = await fetch(
            `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fidsToFetch.join(
              ","
            )}`,
            {
              method: "GET",
              headers: {
                "x-api-key": process.env.NEYNAR_API_KEY,
                cache: "no-store",
              },
            }
          );

          if (neynarResponse.ok) {
            const neynarData = await neynarResponse.json();
            const neynarUsers = neynarData.users || [];

            // Update users in database with PFPs and usernames
            const updatePromises = neynarUsers.map((neynarUser: any) => {
              const updateData: {
                farcaster_pfp?: string;
                farcaster_username?: string;
              } = {};

              if (neynarUser.pfp_url) {
                updateData.farcaster_pfp = neynarUser.pfp_url;
              }

              if (neynarUser.username) {
                updateData.farcaster_username = neynarUser.username;
              }

              if (Object.keys(updateData).length > 0) {
                return prisma.user.update({
                  where: { farcaster_id: String(neynarUser.fid) },
                  data: updateData,
                });
              }
              return Promise.resolve(null);
            });

            await Promise.all(updatePromises);

            // Update the topUsers array with fresh PFP and username data
            neynarUsers.forEach((neynarUser: any) => {
              const userIndex = topUsers.findIndex(
                (u) => u.farcaster_id === String(neynarUser.fid)
              );
              if (userIndex !== -1) {
                if (neynarUser.pfp_url) {
                  topUsers[userIndex].farcaster_pfp = neynarUser.pfp_url;
                }
                if (neynarUser.username) {
                  topUsers[userIndex].farcaster_username = neynarUser.username;
                }
              }
            });
          }
        }
      } catch (error) {
        // Log error but don't fail the request
        console.error("Error fetching PFPs from Neynar:", error);
      }
    }

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
        const userData = await prisma.user.findUnique({
          where: { farcaster_id: fid },
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
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
