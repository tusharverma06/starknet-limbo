import { prisma } from "../lib/db/prisma";
import { sendFromHouseWallet, getHouseWalletBalance } from "../lib/security/houseWallet";
import { JsonRpcProvider, formatEther } from "ethers";

async function manuallyProcessPayout() {
  console.log("🔧 Manually processing pending payout...\n");

  // Find a pending payout transaction
  const pendingPayout = await prisma.walletTransaction.findFirst({
    where: {
      txType: "payout",
      status: {
        in: ["pending", "failed"],
      },
      txHash: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!pendingPayout) {
    console.log("❌ No pending payout found");
    return;
  }

  console.log("Found pending payout:", {
    id: pendingPayout.id,
    amount: formatEther(pendingPayout.amount),
    custodialWalletId: pendingPayout.custodialWalletId,
  });

  // Get the custodial wallet address
  const custodialWallet = await prisma.custodialWallet.findUnique({
    where: { id: pendingPayout.custodialWalletId },
  });

  if (!custodialWallet) {
    console.log("❌ Custodial wallet not found");
    return;
  }

  const userAddress = custodialWallet.address;
  const payoutAmount = BigInt(pendingPayout.amount);

  console.log(`\n📤 Processing payout:`);
  console.log(`   To: ${userAddress}`);
  console.log(`   Amount: ${formatEther(payoutAmount)} ETH\n`);

  // Check house wallet balance
  const houseBalance = await getHouseWalletBalance();
  console.log(`House balance: ${formatEther(houseBalance)} ETH`);

  if (houseBalance < payoutAmount) {
    console.log("❌ Insufficient house balance");
    return;
  }

  try {
    // Send payout
    console.log("🚀 Sending payout transaction...");
    const txHash = await sendFromHouseWallet(userAddress, payoutAmount);
    console.log(`✅ Transaction sent: ${txHash}\n`);

    // Wait for confirmation
    const provider = new JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL ||
        `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    );

    console.log("⏳ Waiting for confirmation...");
    const receipt = await provider.waitForTransaction(txHash, 1);

    if (!receipt || receipt.status === 0) {
      console.log("❌ Transaction failed on-chain");
      return;
    }

    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}\n`);

    // Update database
    await prisma.walletTransaction.update({
      where: { id: pendingPayout.id },
      data: {
        txHash: txHash,
        status: "confirmed",
        blockNumber: BigInt(receipt.blockNumber),
        confirmedAt: new Date(),
      },
    });

    console.log("✅ Database updated");

  } catch (error) {
    console.error("❌ Payout failed:", error);
  }
}

manuallyProcessPayout()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
