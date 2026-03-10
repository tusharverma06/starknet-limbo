import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { JsonRpcProvider } from "ethers";

/**
 * GET /api/cron/cleanup-transactions
 * Cron job to automatically cleanup stuck pending transactions
 * Should run every 5-10 minutes via Vercel Cron or similar
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🧹 [CRON] Starting automatic transaction cleanup...");

    // Threshold: 3 minutes ago (aggressive cleanup)
    const thresholdTime = new Date(Date.now() - 3 * 60 * 1000);

    // Find all pending transactions older than threshold
    const stuckTransactions = await prisma.walletTransaction.findMany({
      where: {
        status: "pending",
        createdAt: {
          lt: thresholdTime,
        },
      },
    });

    console.log(`[CRON] Found ${stuckTransactions.length} stuck transactions`);

    if (stuckTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No stuck transactions found",
        cleaned: 0,
      });
    }

    const provider = new JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL ||
        `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    );

    let failedCount = 0;
    let confirmedCount = 0;

    for (const tx of stuckTransactions) {
      try {
        if (!tx.txHash) {
          // No txHash means transaction never made it to blockchain
          await prisma.walletTransaction.update({
            where: { id: tx.id },
            data: { status: "failed" },
          });
          failedCount++;
          console.log(`[CRON] ❌ Marked tx ${tx.id} as failed (no txHash)`);
        } else {
          // Check blockchain status
          try {
            const receipt = await provider.getTransactionReceipt(tx.txHash);

            if (receipt) {
              if (receipt.status === 1) {
                // Transaction succeeded
                await prisma.walletTransaction.update({
                  where: { id: tx.id },
                  data: {
                    status: "confirmed",
                    blockNumber: BigInt(receipt.blockNumber),
                    gasUsed: receipt.gasUsed.toString(),
                    confirmedAt: new Date(),
                  },
                });
                confirmedCount++;
                console.log(`[CRON] ✅ Marked tx ${tx.id} as confirmed`);
              } else {
                // Transaction failed on blockchain
                await prisma.walletTransaction.update({
                  where: { id: tx.id },
                  data: { status: "failed" },
                });
                failedCount++;
                console.log(`[CRON] ❌ Marked tx ${tx.id} as failed (blockchain failure)`);
              }
            } else {
              // Transaction not found on blockchain
              await prisma.walletTransaction.update({
                where: { id: tx.id },
                data: { status: "failed" },
              });
              failedCount++;
              console.log(`[CRON] ❌ Marked tx ${tx.id} as failed (not on chain)`);
            }
          } catch (rpcError) {
            console.error(`[CRON] ⚠️ RPC error for tx ${tx.txHash}:`, rpcError);
            // Mark as failed if we can't verify
            await prisma.walletTransaction.update({
              where: { id: tx.id },
              data: { status: "failed" },
            });
            failedCount++;
          }
        }
      } catch (error) {
        console.error(`[CRON] Error processing tx ${tx.id}:`, error);
      }
    }

    const result = {
      success: true,
      message: "Cleanup complete",
      stats: {
        total: stuckTransactions.length,
        confirmed: confirmedCount,
        failed: failedCount,
      },
    };

    console.log("[CRON] ✅ Cleanup complete:", result.stats);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CRON] Transaction cleanup error:", error);
    return NextResponse.json(
      {
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
