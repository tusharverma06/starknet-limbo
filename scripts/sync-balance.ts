import { prisma } from "../lib/db/prisma";
import { JsonRpcProvider } from "ethers";

async function syncBalance() {
  console.log("🔄 Syncing wallet balance from blockchain...\n");

  // Get all wallets
  const wallets = await prisma.wallet.findMany({
    include: {
      custodialWallet: true,
    },
  });

  const provider = new JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL ||
      `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  );

  for (const wallet of wallets) {
    console.log(`\nWallet: ${wallet.address}`);
    console.log(`Old DB balance: ${wallet.balance}`);

    // Get actual balance from blockchain
    const actualBalance = await provider.getBalance(wallet.address);
    console.log(`Actual blockchain balance: ${actualBalance.toString()}`);

    // Update database
    await prisma.wallet.update({
      where: { custodialWalletId: wallet.custodialWalletId },
      data: {
        balance: actualBalance.toString(),
      },
    });

    console.log(`✅ Updated database balance to match blockchain`);
  }

  console.log("\n✅ All wallet balances synced!");
}

syncBalance()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
