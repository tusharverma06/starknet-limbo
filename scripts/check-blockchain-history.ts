import { prisma } from "../lib/db/prisma";
import { JsonRpcProvider, formatEther } from "ethers";

async function checkBlockchainHistory() {
  console.log("🔍 Checking blockchain history for custodial wallet...\n");

  // Get the custodial wallet
  const wallet = await prisma.wallet.findFirst({
    include: {
      custodialWallet: {
        include: {
          users: true,
        },
      },
    },
  });

  if (!wallet) {
    console.log("❌ No wallet found!");
    return;
  }

  console.log(`Wallet address: ${wallet.address}\n`);

  const provider = new JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL ||
      `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  );

  // Get current balance from blockchain
  const balance = await provider.getBalance(wallet.address);
  console.log(`Current blockchain balance: ${formatEther(balance)} ETH\n`);

  // Get cached balance from database
  const dbBalance = wallet.balance;
  console.log(`Database cached balance: ${formatEther(dbBalance)} ETH\n`);

  // Check if they match
  const diff = BigInt(balance.toString()) - BigInt(dbBalance);
  console.log(`Difference: ${formatEther(diff)} ETH`);

  if (diff !== BigInt(0)) {
    console.log("\n⚠️ Blockchain and database balances don't match!");
    console.log("This suggests transactions happened that we're not tracking.");
  } else {
    console.log("\n✅ Balances match - database is in sync with blockchain");
  }

  // Get recent transactions from blockchain (if supported by RPC)
  console.log("\n📜 Recent transactions from database:");
  const recentTx = await prisma.walletTransaction.findMany({
    where: {
      custodialWalletId: wallet.custodialWalletId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  for (const tx of recentTx) {
    console.log({
      id: tx.id,
      type: tx.txType,
      status: tx.status,
      hasHash: !!tx.txHash,
      amount: `${formatEther(tx.amount)} ETH`,
    });
  }
}

checkBlockchainHistory()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
