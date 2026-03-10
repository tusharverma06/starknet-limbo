import { prisma } from "../lib/db/prisma";
import { getHouseWalletBalance, getHouseWalletAddress } from "../lib/security/houseWallet";
import { formatEther } from "ethers";

async function testPayoutFlow() {
  console.log("🧪 Testing payout flow...\n");

  try {
    // 1. Check house wallet configuration
    console.log("1️⃣ Checking house wallet configuration...");
    const houseAddress = getHouseWalletAddress();
    console.log(`   House wallet address: ${houseAddress}`);

    const houseBalance = await getHouseWalletBalance();
    console.log(`   House wallet balance: ${formatEther(houseBalance)} ETH\n`);

    if (houseBalance === BigInt(0)) {
      console.log("⚠️ WARNING: House wallet has no funds!");
      console.log("   Payouts will fail until house wallet is funded.\n");
    }

    // 2. Check for pending/failed payouts
    console.log("2️⃣ Checking for pending/failed payout transactions...");
    const pendingPayouts = await prisma.walletTransaction.findMany({
      where: {
        txType: "payout",
        status: {
          in: ["pending", "failed"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    console.log(`   Found ${pendingPayouts.length} pending/failed payouts:\n`);
    for (const payout of pendingPayouts) {
      console.log({
        id: payout.id,
        amount: formatEther(payout.amount),
        status: payout.status,
        hasHash: !!payout.txHash,
        createdAt: payout.createdAt,
      });
    }

    // 3. Check for winning bets without payouts
    console.log("\n3️⃣ Checking for winning bets...");
    const winningBets = await prisma.bet.findMany({
      where: {
        outcome: "win",
        status: {
          in: ["processing", "pending_payout"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    console.log(`   Found ${winningBets.length} unpaid winning bets:\n`);
    for (const bet of winningBets) {
      console.log({
        betId: bet.id,
        payout: formatEther(bet.payout),
        status: bet.status,
        createdAt: bet.createdAt,
      });
    }

    // 4. Test house wallet access
    console.log("\n4️⃣ Testing house wallet access...");
    try {
      const balance = await getHouseWalletBalance();
      console.log(`   ✅ Successfully accessed house wallet`);
      console.log(`   Balance: ${formatEther(balance)} ETH`);
    } catch (error) {
      console.error(`   ❌ Failed to access house wallet:`, error);
    }

  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

testPayoutFlow()
  .then(() => {
    console.log("\n✅ Test complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
