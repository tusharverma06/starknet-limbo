import { prisma } from "../lib/db/prisma";

async function restoreFailedTransactions() {
  console.log("🔄 Restoring incorrectly marked 'failed' transactions back to 'pending'...\n");

  // Find all failed transactions with no txHash (these were marked by our cleanup script)
  const failedTx = await prisma.walletTransaction.findMany({
    where: {
      status: "failed",
      txHash: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(`Found ${failedTx.length} failed transactions with no txHash\n`);

  if (failedTx.length === 0) {
    console.log("✅ No transactions to restore!");
    return;
  }

  let restoredCount = 0;

  for (const tx of failedTx) {
    try {
      await prisma.walletTransaction.update({
        where: { id: tx.id },
        data: { status: "pending" },
      });
      console.log(`🔄 Restored tx ${tx.id} (${tx.txType}) back to pending`);
      restoredCount++;
    } catch (error) {
      console.error(`❌ Failed to restore tx ${tx.id}:`, error);
    }
  }

  console.log(`\n✅ Restored ${restoredCount} out of ${failedTx.length} transactions`);
}

restoreFailedTransactions()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
