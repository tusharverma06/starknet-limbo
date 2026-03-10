import { prisma } from "../lib/db/prisma";
import { JsonRpcProvider } from "ethers";

async function fixPendingTransactions() {
  console.log("🔍 Checking for stuck pending transactions...");

  // Find all pending transactions
  const pendingTransactions = await prisma.walletTransaction.findMany({
    where: {
      status: "pending",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(`Found ${pendingTransactions.length} pending transactions`);

  if (pendingTransactions.length === 0) {
    console.log("✅ No pending transactions found!");
    return;
  }

  // Display them
  for (const tx of pendingTransactions) {
    console.log({
      id: tx.id,
      type: tx.txType,
      txHash: tx.txHash,
      createdAt: tx.createdAt,
      amount: tx.amount,
    });
  }

  const provider = new JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL ||
      `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  );

  let fixedCount = 0;

  for (const tx of pendingTransactions) {
    try {
      if (!tx.txHash) {
        // No txHash - mark as failed
        await prisma.walletTransaction.update({
          where: { id: tx.id },
          data: { status: "failed" },
        });
        console.log(`❌ Marked tx ${tx.id} as failed (no txHash)`);
        fixedCount++;
      } else {
        // Check blockchain
        try {
          const receipt = await provider.getTransactionReceipt(tx.txHash);

          if (receipt) {
            if (receipt.status === 1) {
              // Success
              await prisma.walletTransaction.update({
                where: { id: tx.id },
                data: {
                  status: "confirmed",
                  blockNumber: BigInt(receipt.blockNumber),
                  gasUsed: receipt.gasUsed.toString(),
                  confirmedAt: new Date(),
                },
              });
              console.log(`✅ Marked tx ${tx.id} as confirmed`);
            } else {
              // Failed
              await prisma.walletTransaction.update({
                where: { id: tx.id },
                data: { status: "failed" },
              });
              console.log(`❌ Marked tx ${tx.id} as failed (blockchain failed)`);
            }
            fixedCount++;
          } else {
            // Not found - mark as failed
            await prisma.walletTransaction.update({
              where: { id: tx.id },
              data: { status: "failed" },
            });
            console.log(`❌ Marked tx ${tx.id} as failed (not found on chain)`);
            fixedCount++;
          }
        } catch (err) {
          console.error(`⚠️ Error checking tx ${tx.txHash}:`, err);
          // Mark as failed if we can't check
          await prisma.walletTransaction.update({
            where: { id: tx.id },
            data: { status: "failed" },
          });
          console.log(`❌ Marked tx ${tx.id} as failed (RPC error)`);
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`Error processing tx ${tx.id}:`, error);
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} out of ${pendingTransactions.length} transactions`);
}

fixPendingTransactions()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
