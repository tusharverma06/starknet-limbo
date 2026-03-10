import { prisma } from "../lib/db/prisma";
import { generateBetResult } from "../lib/utils/provablyFair";
import { processBetDeduction } from "../lib/blockchain/processBetDeduction";
import { processPayoutTransfer } from "../lib/blockchain/processPayoutTransfer";
import { getEthValueFromUsd, getEthUsdPrice } from "../lib/utils/price";
import { parseEther, formatEther, JsonRpcProvider } from "ethers";

async function simulateBet() {
  const testAddress = "0xEC933e40B7DBA745C3048E4938DeA2dd81a08753".toLowerCase();
  const usdAmount = 0.1;
  const targetMultiplier = 1.2;

  console.log("🎲 Simulating bet...\n");
  console.log("Parameters:");
  console.log(`  Address: ${testAddress}`);
  console.log(`  Amount: $${usdAmount}`);
  console.log(`  Multiplier: ${targetMultiplier}x\n`);

  // Step 1: Find or check custodial wallet
  console.log("1️⃣ Checking for custodial wallet...");
  const user = await prisma.user.findFirst({
    where: {
      wallet_address: testAddress,
    },
    include: {
      custodialWallet: {
        include: {
          wallet: true,
        },
      },
    },
  });

  if (!user) {
    console.log("❌ User not found. This address needs to be registered first.");
    console.log("   The user must connect their wallet and create an account.");
    return;
  }

  console.log(`✅ Found user: ${user.id}`);
  console.log(`   Custodial wallet: ${user.custodialWallet.address}`);

  // Step 2: Convert USD to ETH
  console.log("\n2️⃣ Converting USD to ETH...");
  const ethAmount = await getEthValueFromUsd(usdAmount);
  const ethPrice = await getEthUsdPrice();
  console.log(`   ETH/USD price: $${ethPrice.toFixed(2)}`);
  console.log(`   Bet amount: ${ethAmount.toFixed(10)} ETH`);

  const betAmountWei = parseEther(ethAmount.toFixed(18));
  console.log(`   Bet amount (wei): ${betAmountWei.toString()}`);

  // Step 3: Check balance
  console.log("\n3️⃣ Checking custodial wallet balance...");
  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL ||
    `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  const provider = new JsonRpcProvider(rpcUrl);
  const balance = await provider.getBalance(user.custodialWallet.address);
  console.log(`   Balance: ${formatEther(balance)} ETH`);

  if (balance < betAmountWei) {
    console.log(`   ❌ Insufficient balance!`);
    console.log(`      Need: ${formatEther(betAmountWei)} ETH`);
    console.log(`      Have: ${formatEther(balance)} ETH`);
    return;
  }

  // Step 4: Generate bet result
  console.log("\n4️⃣ Generating bet result...");
  const betId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  const targetMultiplierScaled = Math.floor(targetMultiplier * 100).toString();

  const result = generateBetResult(
    user.custodialWallet.address,
    betId,
    betAmountWei.toString(),
    targetMultiplierScaled,
  );

  console.log(`   Bet ID: ${betId}`);
  console.log(`   Outcome: ${result.outcome === "win" ? "🎉 WIN" : "❌ LOSS"}`);
  console.log(`   Limbo multiplier: ${(Number(result.limboMultiplier) / 100).toFixed(2)}x`);
  console.log(`   Payout: ${formatEther(result.payout)} ETH`);

  // Step 5: Create bet record
  console.log("\n5️⃣ Creating bet record...");
  const bet = await prisma.bet.create({
    data: {
      id: betId,
      userId: user.id,
      playerId: user.custodialWallet.address,
      wager: betAmountWei.toString(),
      targetMultiplier: targetMultiplierScaled,
      serverSeedHash: result.serverSeedHash,
      serverSeed: result.serverSeed,
      randomValue: result.randomValue,
      gameNumber: result.gameNumber,
      limboMultiplier: result.limboMultiplier,
      outcome: result.outcome,
      payout: result.payout,
      payoutUsd: ((parseFloat(formatEther(result.payout)) * ethPrice).toString()),
      status: "processing",
      ethPriceUsd: ethPrice.toString(),
      wagerUsd: usdAmount.toString(),
      resolvedAt: new Date(),
    },
  });
  console.log(`   ✅ Bet record created`);

  // Step 6: Create pending transactions
  console.log("\n6️⃣ Creating pending wallet transactions...");
  await prisma.walletTransaction.create({
    data: {
      custodialWalletId: user.custodialWallet.id,
      txHash: null,
      txType: "bet_placed",
      amount: betAmountWei.toString(),
      status: "pending",
    },
  });
  console.log(`   ✅ Bet transaction created (pending)`);

  if (result.outcome === "win") {
    await prisma.walletTransaction.create({
      data: {
        custodialWalletId: user.custodialWallet.id,
        txHash: null,
        txType: "payout",
        amount: result.payout,
        status: "pending",
      },
    });
    console.log(`   ✅ Payout transaction created (pending)`);
  }

  // Step 7: Process bet deduction
  console.log("\n7️⃣ Processing bet deduction (sending to house wallet)...");
  const deductionResult = await processBetDeduction({
    betId: betId,
    userId: user.id,
    encryptedPrivateKey: user.custodialWallet.wallet!.encryptedPrivateKey,
    userWalletAddress: user.custodialWallet.address,
    betAmount: betAmountWei.toString(),
  });

  if (deductionResult.success) {
    console.log(`   ✅ Bet deduction successful!`);
    console.log(`   TX Hash: ${deductionResult.txHash}`);
  } else {
    console.log(`   ❌ Bet deduction failed: ${deductionResult.error}`);
    return;
  }

  // Step 8: Process payout if win
  if (result.outcome === "win") {
    console.log("\n8️⃣ Processing payout (sending from house wallet)...");

    // Wait a bit for the deduction to settle
    await new Promise(resolve => setTimeout(resolve, 3000));

    const payoutResult = await processPayoutTransfer({
      betId: betId,
      userId: user.id,
      userWalletAddress: user.custodialWallet.address,
      payout: result.payout,
    });

    if (payoutResult.success) {
      console.log(`   ✅ Payout successful!`);
      console.log(`   TX Hash: ${payoutResult.txHash}`);
    } else {
      console.log(`   ❌ Payout failed: ${payoutResult.error}`);
    }
  } else {
    console.log("\n8️⃣ No payout needed (bet lost)");
  }

  // Step 9: Verify final state
  console.log("\n9️⃣ Verifying final state...");

  const finalBet = await prisma.bet.findUnique({
    where: { id: betId },
  });
  console.log(`   Bet status: ${finalBet?.status}`);

  const finalTransactions = await prisma.walletTransaction.findMany({
    where: {
      custodialWalletId: user.custodialWallet.id,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  console.log(`\n   Recent transactions:`);
  for (const tx of finalTransactions) {
    console.log(`     - ${tx.txType}: ${tx.status} ${tx.txHash ? `(${tx.txHash.slice(0, 10)}...)` : "(no hash)"}`);
  }

  const newBalance = await provider.getBalance(user.custodialWallet.address);
  console.log(`\n   Final balance: ${formatEther(newBalance)} ETH`);
  console.log(`   Balance change: ${formatEther(newBalance - balance)} ETH`);

  console.log("\n✅ Simulation complete!");
}

simulateBet()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Simulation failed:", error);
    process.exit(1);
  });
