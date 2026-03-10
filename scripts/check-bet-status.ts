import { prisma } from "../lib/db/prisma";

async function checkBetStatus() {
  const betId = "1773094436108-xjy8nn32jhp";

  console.log(`🔍 Checking status for bet: ${betId}\n`);

  // Get the bet
  const bet = await prisma.bet.findUnique({
    where: { id: betId },
  });

  if (!bet) {
    console.log("❌ Bet not found!");
    return;
  }

  console.log("Bet details:");
  console.log(`  Status: ${bet.status}`);
  console.log(`  Outcome: ${bet.outcome}`);
  console.log(`  Player ID (custodial wallet): ${bet.playerId}`);
  console.log(`  User ID: ${bet.userId}`);
  console.log(`  TX Hash: ${bet.txHash || "(none)"}`);
  console.log();

  // Get the user's custodial wallet
  const user = await prisma.user.findUnique({
    where: { id: bet.userId },
    include: {
      custodialWallet: true,
    },
  });

  if (!user) {
    console.log("❌ User not found!");
    return;
  }

  console.log("User's custodial wallet:");
  console.log(`  ID: ${user.custodial_wallet_id}`);
  console.log(`  Address: ${user.custodialWallet.address}`);
  console.log();

  // Get ALL wallet transactions for this custodial wallet
  console.log("ALL wallet transactions for this custodial wallet:");
  const allTransactions = await prisma.walletTransaction.findMany({
    where: {
      custodialWalletId: user.custodial_wallet_id,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  for (const tx of allTransactions) {
    console.log(`  [${tx.id}] ${tx.txType}: ${tx.status}`);
    console.log(`      Created: ${tx.createdAt.toISOString()}`);
    console.log(`      TX Hash: ${tx.txHash || "(none)"}`);
    console.log(`      Amount: ${tx.amount}`);
    console.log();
  }

  // Check specifically for transactions related to this bet
  console.log("Looking for transactions created around bet time...");
  const betTime = bet.createdAt;
  const fiveSecondsAgo = new Date(betTime.getTime() - 5000);
  const fiveSecondsAfter = new Date(betTime.getTime() + 5000);

  const relatedTx = await prisma.walletTransaction.findMany({
    where: {
      custodialWalletId: user.custodial_wallet_id,
      createdAt: {
        gte: fiveSecondsAgo,
        lte: fiveSecondsAfter,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${relatedTx.length} transactions within 5 seconds of bet:`);
  for (const tx of relatedTx) {
    console.log(`  [${tx.id}] ${tx.txType}: ${tx.status}`);
    console.log(`      TX Hash: ${tx.txHash || "(none)"}`);
    console.log(`      Block: ${tx.blockNumber?.toString() || "(none)"}`);
    console.log(`      Confirmed: ${tx.confirmedAt?.toISOString() || "(none)"}`);
    console.log();
  }
}

checkBetStatus()
  .then(() => {
    console.log("✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
