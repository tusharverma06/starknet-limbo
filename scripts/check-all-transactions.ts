import { prisma } from "../lib/db/prisma";

async function checkAllTransactions() {
  console.log("🔍 Checking ALL wallet transactions...\n");

  const allTx = await prisma.walletTransaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
  });

  console.log(`Found ${allTx.length} recent transactions:\n`);

  for (const tx of allTx) {
    console.log({
      id: tx.id,
      type: tx.txType,
      status: tx.status,
      txHash: tx.txHash ? `${tx.txHash.slice(0, 10)}...` : null,
      amount: tx.amount.slice(0, 14) + "...",
      createdAt: tx.createdAt.toISOString(),
    });
  }

  // Check for duplicates (same type, similar time, no txHash vs with txHash)
  console.log("\n🔍 Looking for potential duplicates...");

  const withoutHash = allTx.filter(tx => !tx.txHash);
  const withHash = allTx.filter(tx => tx.txHash);

  console.log(`\nWithout txHash: ${withoutHash.length}`);
  console.log(`With txHash: ${withHash.length}`);
}

checkAllTransactions()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
