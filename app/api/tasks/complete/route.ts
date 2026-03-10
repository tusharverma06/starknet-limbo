import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { TASKS } from "@/lib/utils/tasks";

/**
 * POST /api/tasks/complete
 *
 * Simple task completion based on wallet address.
 * User clicks task → button appears → clicks complete → status updated.
 *
 * Request: { address: "0x...", taskId: "twitter_follow" }
 * Response: { success: true, points: 100, totalPoints: 250 }
 */
export async function POST(req: NextRequest) {
  try {
    const { address, taskId } = await req.json();

    if (!address || !taskId) {
      return NextResponse.json(
        { error: "address and taskId are required" },
        { status: 400 }
      );
    }

    // Find user by wallet address
    const user = await prisma.user.findUnique({
      where: { wallet_address: address.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please fetch tasks first." },
        { status: 404 }
      );
    }

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

    // Update task status and award points in a transaction
    await prisma.$transaction(async (tx) => {
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

      // Increment user's total points
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
    console.error("Complete task error:", error);
    return NextResponse.json(
      { error: "Failed to complete task" },
      { status: 500 }
    );
  }
}
