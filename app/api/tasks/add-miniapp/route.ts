import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { TASKS } from "@/lib/utils/tasks";

/**
 * POST /api/tasks/add-miniapp
 *
 * Special task: Add to Farcaster miniapp.
 * Saves notification token for future use and completes the task.
 *
 * Request: { fid: "123", url: "...", token: "..." }
 */
export async function POST(req: NextRequest) {
  try {
    const { fid, url, token } = await req.json();

    if (!fid || !url || !token) {
      return NextResponse.json(
        { error: "fid, url, and token are required" },
        { status: 400 }
      );
    }

    // Find user by FID
    const user = await prisma.user.findUnique({
      where: { farcaster_id: fid },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please fetch tasks first." },
        { status: 404 }
      );
    }

    const taskId = "add_miniapp";

    // Find task definition
    const taskDef = TASKS.find((t) => t.id === taskId);
    if (!taskDef) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Check if task is already completed
    const existingTask = await prisma.userTask.findUnique({
      where: {
        userId_taskId: {
          userId: user.id,
          taskId,
        },
      },
    });

    if (existingTask?.completed) {
      return NextResponse.json(
        { error: "Task already completed" },
        { status: 400 }
      );
    }

    // Save notification data and complete task
    await prisma.$transaction(async (tx) => {
      // Save Farcaster notification data for future use
      await tx.user.update({
        where: { id: user.id },
        data: {
          farcasterNotificationData: JSON.stringify({ url, token }),
        },
      });

      // Mark task as completed
      await tx.userTask.update({
        where: {
          userId_taskId: {
            userId: user.id,
            taskId,
          },
        },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });

      // Award points
      await tx.user.update({
        where: { id: user.id },
        data: {
          totalPoints: {
            increment: taskDef.points,
          },
        },
      });
    });

    // Get updated total points
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { totalPoints: true },
    });

    return NextResponse.json({
      success: true,
      points: taskDef.points,
      totalPoints: updatedUser?.totalPoints || 0,
    });
  } catch (error) {
    console.error("Add miniapp task error:", error);
    return NextResponse.json(
      { error: "Failed to complete task" },
      { status: 500 }
    );
  }
}
