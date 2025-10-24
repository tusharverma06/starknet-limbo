import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { parseEther } from "ethers";

/**
 * POST /api/wallet/log-deposit
 * Log a deposit transaction after it's confirmed on-chain
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, txHash, amount } = body;

    // Validate inputs
    if (!userId || !txHash || !amount) {
      return NextResponse.json(
        { error: "userId, txHash, and amount are required" },
        { status: 400 }
      );
    }

    // Get user from database (userId is Farcaster FID)
    const user = await getOrCreateUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Failed to get or create user" },
        { status: 500 }
      );
    }

    // Check if this transaction is already logged
    const existingTx = await prisma.walletTransaction.findFirst({
      where: {
        txHash,
        userId: user.id,
      },
    });

    if (existingTx) {
      console.log("ℹ️ Deposit transaction already logged:", txHash);
      return NextResponse.json({
        success: true,
        message: "Transaction already logged",
      });
    }

    // Convert amount to wei if it's not already
    const amountNum = parseFloat(amount);
    const amountInWei = isNaN(amountNum)
      ? amount
      : parseEther(amountNum.toString()).toString();

    // Log the deposit transaction
    await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        txHash,
        txType: "deposit",
        amount: amountInWei,
        status: "confirmed", // Already confirmed when this endpoint is called
        confirmedAt: new Date(),
      },
    });

    console.log("✅ Deposit transaction logged:", txHash);

    return NextResponse.json({
      success: true,
      txHash,
    });
  } catch (error) {
    console.error("Log deposit error:", error);
    return NextResponse.json(
      {
        error: "Failed to log deposit",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
