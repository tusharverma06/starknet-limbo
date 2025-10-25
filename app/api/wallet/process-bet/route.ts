import { NextRequest, NextResponse } from "next/server";
import { processBlockchainTransactions } from "@/lib/blockchain/processBetTransactions";

/**
 * POST /api/wallet/process-bet
 * Process blockchain transactions for a bet in the background
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      betId,
      userId,
      encryptedPrivateKey,
      userWalletAddress,
      betAmount,
      outcome,
      payout,
    } = body;

    // Validate inputs
    if (
      !betId ||
      !userId ||
      !encryptedPrivateKey ||
      !userWalletAddress ||
      !betAmount ||
      !outcome ||
      !payout
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Process blockchain transactions
    await processBlockchainTransactions({
      betId,
      userId,
      encryptedPrivateKey,
      userWalletAddress,
      betAmount,
      outcome,
      payout,
    });

    return NextResponse.json({
      success: true,
      message: "Bet processed successfully",
    });
  } catch (error) {
    console.error("Process bet error:", error);
    return NextResponse.json(
      {
        error: "Failed to process bet",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
