import { prisma } from "../lib/db/prisma";
import { processPayoutTransfer } from "../lib/blockchain/processPayoutTransfer";

async function processAllPendingPayouts() {
  console.log("🔧 Processing all pending payouts...\n");

  // Find all winning bets that need payout
  const pendingBets = await prisma.bet.findMany({
    where: {
      outcome: "win",
      status: {
        in: ["processing", "pending_payout", "deducted"],
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "asc", // Process oldest first
    },
  });

  console.log(`Found ${pendingBets.length} bets needing payout\n`);

  if (pendingBets.length === 0) {
    console.log("✅ No pending payouts!");
    return;
  }

  let successCount = 0;
  let failureCount = 0;

  for (const bet of pendingBets) {
    console.log(`\n📤 Processing bet ${bet.id}...`);
    console.log(`   User: ${bet.playerId}`);
    console.log(`   Payout: ${bet.payout} wei`);

    try {
      const result = await processPayoutTransfer({
        betId: bet.id,
        userId: bet.userId,
        userWalletAddress: bet.playerId,
        payout: bet.payout,
      });

      if (result.success) {
        console.log(`   ✅ Payout processed: ${result.txHash}`);
        successCount++;
      } else {
        console.log(`   ❌ Payout failed: ${result.error}`);
        failureCount++;
      }
    } catch (error) {
      console.error(`   ❌ Error processing payout:`, error);
      failureCount++;
    }

    // Add small delay between payouts to avoid nonce issues
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total: ${pendingBets.length}`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failureCount}`);
}

processAllPendingPayouts()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
