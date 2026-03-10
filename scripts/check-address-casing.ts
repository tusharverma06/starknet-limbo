import { prisma } from "../lib/db/prisma";

async function checkAddressCasing() {
  console.log("🔍 Checking custodial wallet address casing...\n");

  const custodialWallets = await prisma.custodialWallet.findMany({
    select: {
      id: true,
      address: true,
    },
  });

  for (const wallet of custodialWallets) {
    console.log("Wallet ID:", wallet.id);
    console.log("  Stored address:", wallet.address);
    console.log("  Lowercase:", wallet.address.toLowerCase());
    console.log("  Match test:", wallet.address === wallet.address.toLowerCase());
    console.log();

    // Test lookup with exact match
    const exactMatch = await prisma.custodialWallet.findUnique({
      where: { address: wallet.address },
    });
    console.log("  Exact match:", !!exactMatch);

    // Test lookup with lowercase
    const lowerMatch = await prisma.custodialWallet.findUnique({
      where: { address: wallet.address.toLowerCase() },
    });
    console.log("  Lowercase match:", !!lowerMatch);
    console.log();
  }
}

checkAddressCasing()
  .then(() => {
    console.log("✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
