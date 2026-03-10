import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { JsonRpcProvider } from "ethers";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * POST /api/wallet/cleanup-transactions
 * Clean up stuck pending transactions
 * - Marks old pending transactions (>5 min) with no txHash as failed
 * - Checks blockchain status for pending transactions with txHash
 */
export async function POST(req: NextRequest) {
  try {
    // Allow either JWT auth or internal API key
    const internalApiKey = req.headers.get("x-internal-api-key");
    const expectedKey = process.env.INTERNAL_API_KEY || "dev-internal-key";

    // Try internal API key first
    if (internalApiKey !== expectedKey) {
      // If no valid internal key, require JWT authentication
      const authResult = await requireAuth(req);
      if ("error" in authResult) {
        return authResult.error;
      }
      console.log("🔑 Cleanup authorized via JWT for user:", authResult.data.user.id);
    } else {
      console.log("🔑 Cleanup authorized via internal API key");
    }

    console.log("🧹 Starting transaction cleanup...");

    // Threshold: 5 minutes ago
    const thresholdTime = new Date(Date.now() - 5 * 60 * 1000);

    // Find all pending transactions older than threshold
    const stuckTransactions = await prisma.walletTransaction.findMany({
      where: {
        status: "pending",
        createdAt: {
          lt: thresholdTime,
        },
      },
    });

    console.log(`Found ${stuckTransactions.length} stuck pending transactions`);

    const provider = new JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL ||
        `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    );

    let updatedCount = 0;
    let failedCount = 0;
    let confirmedCount = 0;

    for (const tx of stuckTransactions) {
      try {
        if (!tx.txHash) {
          // No txHash means transaction never made it to blockchain - mark as failed
          await prisma.walletTransaction.update({
            where: { id: tx.id },
            data: { status: "failed" },
          });
          failedCount++;
          console.log(
            `❌ Marked transaction ${tx.id} as failed (no txHash)`,
          );
        } else {
          // Has txHash - check blockchain status
          try {
            const receipt = await provider.getTransactionReceipt(tx.txHash);

            if (receipt) {
              // Transaction was mined
              if (receipt.status === 1) {
                // Successful
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
                console.log(
                  `✅ Marked transaction ${tx.id} as confirmed (found on blockchain)`,
                );
              } else {
                // Transaction failed on blockchain
                await prisma.walletTransaction.update({
                  where: { id: tx.id },
                  data: { status: "failed" },
                });
                failedCount++;
                console.log(
                  `❌ Marked transaction ${tx.id} as failed (failed on blockchain)`,
                );
              }
            } else {
              // Transaction not found on blockchain (likely dropped) - mark as failed
              await prisma.walletTransaction.update({
                where: { id: tx.id },
                data: { status: "failed" },
              });
              failedCount++;
              console.log(
                `❌ Marked transaction ${tx.id} as failed (not found on blockchain)`,
              );
            }
          } catch (rpcError) {
            console.error(
              `⚠️ Error checking blockchain for tx ${tx.txHash}:`,
              rpcError,
            );
            // Mark as failed if we can't verify
            await prisma.walletTransaction.update({
              where: { id: tx.id },
              data: { status: "failed" },
            });
            failedCount++;
          }
        }
        updatedCount++;
      } catch (error) {
        console.error(`Error processing transaction ${tx.id}:`, error);
      }
    }

    console.log("✅ Cleanup complete:", {
      total: stuckTransactions.length,
      updated: updatedCount,
      confirmed: confirmedCount,
      failed: failedCount,
    });

    return NextResponse.json({
      success: true,
      message: "Transaction cleanup complete",
      stats: {
        total: stuckTransactions.length,
        updated: updatedCount,
        confirmed: confirmedCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error("Transaction cleanup error:", error);
    return NextResponse.json(
      {
        error: "Failed to cleanup transactions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
