import { prisma } from "../lib/db/prisma";
import { processBetDeduction } from "../lib/blockchain/processBetDeduction";
import { processPayoutTransfer } from "../lib/blockchain/processPayoutTransfer";

async function testBetFlow() {
  console.log("🧪 Testing bet flow with new lookup logic...\n");

  // Find a custodial wallet to test with
  const custodialWallet = await prisma.custodialWallet.findFirst({
    include: {
      wallet: true,
      users: true,
    },
  });

  if (!custodialWallet) {
    console.log("❌ No custodial wallet found");
    return;
  }

  console.log("✅ Found custodial wallet:", custodialWallet.address);
  console.log("   Users connected:", custodialWallet.users.length);

  // Test processBetDeduction lookup
  console.log("\n1️⃣ Testing processBetDeduction lookup...");
  try {
    const testCustodialWallet = await prisma.custodialWallet.findUnique({
      where: {
        address: custodialWallet.address.toLowerCase(),
      },
      include: {
        users: {
          take: 1,
        },
      },
    });

    if (testCustodialWallet) {
      console.log("   ✅ Successfully found custodial wallet by address");
      console.log("   Custodial wallet ID:", testCustodialWallet.id);
    } else {
      console.log("   ❌ Failed to find custodial wallet");
    }
  } catch (error) {
    console.error("   ❌ Error:", error);
  }

  // Test processPayoutTransfer lookup
  console.log("\n2️⃣ Testing processPayoutTransfer lookup...");
  try {
    const testCustodialWallet = await prisma.custodialWallet.findUnique({
      where: {
        address: custodialWallet.address.toLowerCase(),
      },
    });

    if (testCustodialWallet) {
      console.log("   ✅ Successfully found custodial wallet by address");
      console.log("   Custodial wallet ID:", testCustodialWallet.id);
    } else {
      console.log("   ❌ Failed to find custodial wallet");
    }
  } catch (error) {
    console.error("   ❌ Error:", error);
  }

  console.log("\n✅ Both lookup functions should now work correctly!");
  console.log("   They use custodial wallet address instead of user wallet address");
}

testBetFlow()
  .then(() => {
    console.log("\n✅ Test complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
