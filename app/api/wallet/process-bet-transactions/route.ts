import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  sendFromHouseWallet,
  getHouseWalletBalance,
  sendToHouseWallet,
} from "@/lib/security/houseWallet";

/**
 * POST /api/wallet/process-bet-transactions
 * Process blockchain transactions for a bet (bet payment + payout if win)
 * This runs independently after bet result is returned to user
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

    console.log(
      "🔄 [BLOCKCHAIN] Starting transaction processing for bet:",
      betId
    );

    let betTxHash: string | null = null;
    let payoutTxHash: string | null = null;

    try {
      const betAmountWei = BigInt(betAmount);

      // Step 1: Send bet amount FROM user's wallet TO house wallet
      try {
        betTxHash = await sendToHouseWallet(
          encryptedPrivateKey,
          betAmountWei
        );
        console.log("✅ [BLOCKCHAIN] Bet transaction sent:", betTxHash);
        console.log(
          "⏳ [BLOCKCHAIN] Waiting for bet transaction confirmation..."
        );

        // Wait for transaction confirmation
        const { JsonRpcProvider } = await import("ethers");
        const rpcUrl =
          process.env.NEXT_PUBLIC_RPC_URL ||
          `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
        const provider = new JsonRpcProvider(rpcUrl);

        const receipt = await provider.waitForTransaction(betTxHash, 1);

        if (!receipt || receipt.status === 0) {
          throw new Error("Bet transaction failed on-chain");
        }

        console.log("✅ [BLOCKCHAIN] Bet transaction confirmed:", betTxHash);

        // Record bet transaction
        await prisma.walletTransaction.create({
          data: {
            userId: userId,
            txHash: betTxHash,
            txType: "bet_placed",
            amount: betAmount,
            status: "confirmed",
            confirmedAt: new Date(),
          },
        });
      } catch (error) {
        console.error(
          "❌ [BLOCKCHAIN] Failed to send bet to house wallet:",
          error
        );
        // Update bet status to failed
        await prisma.bet.update({
          where: { id: betId },
          data: {
            status: "failed",
          },
        });
        throw error;
      }

      // Step 2: If win, send payout FROM house wallet BACK to user
      if (outcome === "win") {
        const payoutAmount = BigInt(payout);

        console.log(
          "💰 [BLOCKCHAIN] User won! Sending payout from house wallet:",
          {
            to: userWalletAddress,
            amount: payoutAmount.toString(),
          }
        );

        // Check house wallet balance
        const houseBalance = await getHouseWalletBalance();
        console.log(
          "🏦 [BLOCKCHAIN] House wallet balance:",
          houseBalance.toString()
        );

        if (houseBalance < payoutAmount) {
          console.error(
            "❌ [BLOCKCHAIN] Insufficient house wallet balance for payout"
          );
          // Mark as pending payout to be processed later
          await prisma.bet.update({
            where: { id: betId },
            data: {
              status: "pending_payout",
            },
          });
          return NextResponse.json({
            success: true,
            message: "Bet confirmed, payout pending (insufficient house balance)",
            betTxHash,
            status: "pending_payout",
          });
        }

        try {
          payoutTxHash = await sendFromHouseWallet(
            userWalletAddress,
            payoutAmount
          );
          console.log(
            "✅ [BLOCKCHAIN] Payout transaction sent:",
            payoutTxHash
          );
          console.log(
            "⏳ [BLOCKCHAIN] Waiting for payout transaction confirmation..."
          );

          // Wait for transaction confirmation
          const { JsonRpcProvider } = await import("ethers");
          const rpcUrl =
            process.env.NEXT_PUBLIC_RPC_URL ||
            `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
          const provider = new JsonRpcProvider(rpcUrl);

          const receipt = await provider.waitForTransaction(payoutTxHash, 1);

          if (!receipt || receipt.status === 0) {
            throw new Error("Payout transaction failed on-chain");
          }

          console.log(
            "✅ [BLOCKCHAIN] Payout transaction confirmed:",
            payoutTxHash
          );

          // Record payout transaction
          await prisma.walletTransaction.create({
            data: {
              userId: userId,
              txHash: payoutTxHash,
              txType: "payout",
              amount: payout,
              status: "confirmed",
              confirmedAt: new Date(),
            },
          });
        } catch (error) {
          console.error("❌ [BLOCKCHAIN] Failed to send payout:", error);
          console.error(
            "❌ [BLOCKCHAIN] Error details:",
            error instanceof Error ? error.message : "Unknown error"
          );

          // Mark as pending payout to retry later
          await prisma.bet.update({
            where: { id: betId },
            data: {
              status: "pending_payout",
            },
          });
          throw error;
        }
      }

      // Step 3: Mark bet as fully resolved
      console.log("✅ [BLOCKCHAIN] Bet fully resolved:", {
        betId,
        outcome,
        betTxHash,
        payoutTxHash,
      });

      await prisma.bet.update({
        where: { id: betId },
        data: {
          status: outcome === "win" ? "resolved" : "complete",
          // IMPORTANT: Only save payout transaction hash (house → user)
          // For losses, txHash should be null since there's no payout to verify
          txHash: payoutTxHash,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Blockchain transactions processed successfully",
        betTxHash,
        payoutTxHash,
        status: outcome === "win" ? "resolved" : "complete",
      });
    } catch (error) {
      console.error("❌ [BLOCKCHAIN] Processing error:", error);
      return NextResponse.json(
        {
          error: "Blockchain processing failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ [BLOCKCHAIN] Request error:", error);
    return NextResponse.json(
      {
        error: "Invalid request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

// Prevent static generation for this endpoint
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Use Node.js runtime for blockchain operations
