import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { TASKS } from "@/lib/utils/tasks";

/**
 * WAITLIST SYSTEM - GAME DISABLED
 *
 * This is a waitlist-only system to build attraction before launch.
 * Users can complete tasks to earn points and get on the waitlist.
 *
 * No wallet addresses or blockchain interaction until they want to play.
 * Everything is based on FID (Farcaster ID) from the miniapp user context.
 *
 * Flow:
 * 1. User opens miniapp → we get FID & Farcaster profile from context
 * 2. Find or create user based on FID
 * 3. Auto-create task instances for user (pre-filled, they just complete them)
 * 4. User clicks task → button appears in task container
 * 5. User clicks complete → we update status and award points
 */

/**
 * GET /api/tasks?fid=123&username=john&pfp=https://...
 *
 * Fetches all tasks for a user based on FID.
 * Auto-creates user and pre-fills tasks if first time.
 * No authentication needed - this is waitlist only.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fid = searchParams.get("fid");
    const username = searchParams.get("username") || "anonymous";
    const pfp = searchParams.get("pfp");

    if (!fid) {
      return NextResponse.json({ error: "fid is required" }, { status: 400 });
    }

    // Find or create user based on FID (Farcaster ID)
    let user = await prisma.user.findUnique({
      where: { farcaster_id: fid },
      include: {
        _count: {
          select: { referralsGiven: true },
        },
      },
    });

    if (!user) {
      // Create new user with Farcaster details from miniapp context
      // No wallet address yet - they'll connect when they want to play
      user = await prisma.user.create({
        data: {
          farcaster_id: fid,
          farcaster_username: username,
          farcaster_pfp: pfp,
          totalPoints: 0,
        },
        include: {
          _count: {
            select: { referralsGiven: true },
          },
        },
      });
    }

    // Get user's task instances
    let userTasks = await prisma.userTask.findMany({
      where: { userId: user.id },
    });

    // Pre-fill tasks for user if they don't have any yet
    if (userTasks.length === 0) {
      await prisma.userTask.createMany({
        data: TASKS.map((task) => ({
          userId: user.id,
          taskId: task.id,
          completed: false,
          points: task.points,
        })),
        skipDuplicates: true,
      });

      userTasks = await prisma.userTask.findMany({
        where: { userId: user.id },
      });
    }

    // Map tasks with completion status
    const tasksWithStatus = TASKS.map((task) => {
      const userTask = userTasks.find((ut) => ut.taskId === task.id);
      return {
        ...task,
        completed: userTask?.completed || false,
        completedAt: userTask?.completedAt || null,
      };
    });

    return NextResponse.json({
      tasks: tasksWithStatus,
      totalPoints: user.totalPoints || 0,
      referralCount: user._count.referralsGiven,
      user: {
        fid: user.farcaster_id,
        username: user.farcaster_username,
        pfp: user.farcaster_pfp,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json({ error: "Failed to get tasks" }, { status: 500 });
  }
}
