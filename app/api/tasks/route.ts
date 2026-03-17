import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { TASKS } from "@/lib/utils/tasks";

/**
 * TASK SYSTEM
 *
 * Users can complete tasks to earn points.
 * Everything is based on wallet address.
 *
 * Flow:
 * 1. User connects wallet
 * 2. Find or create user based on wallet address
 * 3. Auto-create task instances for user (pre-filled, they just complete them)
 * 4. User clicks task → button appears in task container
 * 5. User clicks complete → we update status and award points
 */

/**
 * GET /api/tasks?address=0x...
 *
 * Fetches all tasks for a user based on wallet address.
 * Auto-creates user and pre-fills tasks if first time.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 });
    }

    // Find or create user based on wallet address
    let user = await prisma.user.findUnique({
      where: { wallet_address: address.toLowerCase() },
      include: {
        _count: {
          select: { referralsGiven: true },
        },
      },
    });

    if (!user) {
      // Create new user with custodial wallet
      // Detect if wallet is Starknet (>42 chars) or EVM (42 chars)
      const isStarknetAddress = address.toLowerCase().length > 42;

      let custodialWallet;
      if (isStarknetAddress) {
        const { starknetWalletDb } = await import("@/lib/db/starknetWallets");
        custodialWallet = await starknetWalletDb.createCustodialWallet("mainnet");
      } else {
        const { walletDb } = await import("@/lib/db/wallets");
        custodialWallet = await walletDb.createCustodialWallet();
      }

      user = await prisma.user.create({
        data: {
          wallet_address: address.toLowerCase(),
          custodial_wallet_id: custodialWallet.custodialWalletId,
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
        address: user.wallet_address,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json({ error: "Failed to get tasks" }, { status: 500 });
  }
}
