import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { parseEther } from "ethers";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * POST /api/wallet/log-deposit
 * Log a deposit transaction after it's confirmed on-chain
 * Requires authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(req);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult.data;
    const body = await req.json();
    const { txHash, amount } = body;

    // Validate inputs
    if (!txHash || !amount) {
      return NextResponse.json(
        { error: "txHash and amount are required" },
        { status: 400 }
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
    let amountInWei: string;

    if (isNaN(amountNum)) {
      amountInWei = amount;
    } else {
      // parseEther only supports up to 18 decimals
      // Round to 18 decimals to avoid "too many decimals" error
      const roundedAmount = Math.floor(amountNum * 1e18) / 1e18;
      amountInWei = parseEther(roundedAmount.toString()).toString();
    }

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
