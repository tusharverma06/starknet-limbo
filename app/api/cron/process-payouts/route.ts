import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  sendFromHouseWallet,
  getHouseWalletBalance,
} from "@/lib/security/houseWallet";

/**
 * GET /api/cron/process-payouts
 * Cron job endpoint to process pending payouts every 5 minutes
 *
 * Security: Should be protected by a cron secret or IP allowlist in production
 * For Vercel: Add CRON_SECRET to environment variables and verify it
 */
export async function GET(req: NextRequest) {
  try {
    // Security: Verify cron secret (optional but recommended)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 [CRON] Starting payout processing job...");
    const startTime = Date.now();

    // Find all pending payouts
    const pendingBets = await prisma.bet.findMany({
      where: {
        status: { in: ["pending_payout", "processing"] },
        outcome: "win",
      },
      include: {
        user: {
          include: {
            custodialWallet: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Process oldest first
      },
    });

    console.log(`🔍 [CRON] Found ${pendingBets.length} pending payout(s)`);

    if (pendingBets.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending payouts to process",
        processed: 0,
        failed: 0,
        duration: Date.now() - startTime,
      });
    }

    // Check house wallet balance once upfront
    const houseBalance = await getHouseWalletBalance();
    console.log(`🏦 [CRON] House wallet balance: ${houseBalance.toString()}`);

    const results = {
      processed: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ betId: string; error: string }>,
    };

    for (const bet of pendingBets) {
      try {
        console.log(`💰 [CRON] Processing payout for bet ${bet.id}`);

        const payoutAmount = BigInt(bet.payout);
        const userWalletAddress = bet.user.custodialWallet?.address;

        if (!userWalletAddress) {
          console.error(`❌ [CRON] No custodial wallet address for bet ${bet.id}`);
          results.failed++;
          results.errors.push({
            betId: bet.id,
            error: "Custodial wallet address not found",
          });
          continue;
        }

        // Check if we have enough balance for this payout
        const currentBalance = await getHouseWalletBalance();
        if (currentBalance < payoutAmount) {
          console.warn(
            `⚠️ [CRON] Insufficient balance for bet ${bet.id}, skipping`
          );
          results.skipped++;
          results.errors.push({
            betId: bet.id,
            error: `Insufficient house balance: ${currentBalance.toString()} < ${payoutAmount.toString()}`,
          });
          continue;
        }

        // Send payout
        console.log(`📤 [CRON] Sending payout to ${userWalletAddress}`);
        const payoutTxHash = await sendFromHouseWallet(
          userWalletAddress,
          payoutAmount
        );
        console.log(`✅ [CRON] Payout transaction sent: ${payoutTxHash}`);

        // Wait for transaction confirmation
        const { JsonRpcProvider } = await import("ethers");
        const rpcUrl =
          process.env.NEXT_PUBLIC_RPC_URL ||
          `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
        const provider = new JsonRpcProvider(rpcUrl);

        console.log(`⏳ [CRON] Waiting for confirmation...`);
        const receipt = await provider.waitForTransaction(payoutTxHash, 1);

        if (!receipt || receipt.status === 0) {
          throw new Error("Transaction failed on-chain");
        }

        console.log(`✅ [CRON] Payout confirmed: ${payoutTxHash}`);

        // Record payout transaction
        await prisma.walletTransaction.create({
          data: {
            custodialWalletId: bet.user.custodial_wallet_id,
            txHash: payoutTxHash,
            txType: "payout",
            amount: bet.payout,
            status: "confirmed",
            confirmedAt: new Date(),
          },
        });

        // Update bet status
        await prisma.bet.update({
          where: { id: bet.id },
          data: {
            status: "resolved",
            txHash: payoutTxHash,
          },
        });

        results.processed++;
        console.log(`✅ [CRON] Successfully processed bet ${bet.id}`);
      } catch (error) {
        console.error(`❌ [CRON] Failed to process bet ${bet.id}:`, error);
        results.failed++;
        results.errors.push({
          betId: bet.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [CRON] Job completed in ${duration}ms:`, results);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} payout(s), ${results.failed} failed, ${results.skipped} skipped`,
      ...results,
      duration,
    });
  } catch (error) {
    console.error("❌ [CRON] Job failed:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Prevent static generation for this endpoint
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Use Node.js runtime for long-running tasks
