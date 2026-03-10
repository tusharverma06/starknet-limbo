import {
  getBankrollLimits,
  validateBet,
  getMaxMultiplier,
  getBankrollStats,
} from "../lib/utils/bankrollManagement";
import { parseEther, formatEther } from "ethers";

async function testBankrollLimits() {
  console.log("🏦 Testing Bankroll Management\n");

  // 1. Get current limits
  console.log("1️⃣ Current Bankroll Limits:");
  const limits = await getBankrollLimits();
  console.log(`   House Balance: ${formatEther(limits.houseBalance)} ETH`);
  console.log(`   Max Bet (1%): ${formatEther(limits.maxBet)} ETH`);
  console.log(`   Max Payout (10%): ${formatEther(limits.maxPayout)} ETH`);
  console.log(`   Can Accept Bets: ${limits.canAcceptBets}`);
  if (limits.reason) {
    console.log(`   Reason: ${limits.reason}`);
  }
  console.log();

  // 2. Get bankroll stats
  console.log("2️⃣ Bankroll Statistics:");
  const stats = await getBankrollStats();
  console.log(`   House Balance: ${stats.houseBalance} ETH`);
  console.log(`   Max Bet: ${stats.maxBet} ETH`);
  console.log(`   Max Payout: ${stats.maxPayout} ETH`);
  console.log(`   Risk Utilization: ${stats.utilizationPercent.toFixed(2)}%`);
  console.log();

  if (!limits.canAcceptBets) {
    console.log("❌ Cannot test bets - house wallet has insufficient balance");
    return;
  }

  // 3. Test valid bet
  console.log("3️⃣ Testing Valid Bet:");
  const validBet = parseEther("0.0001"); // Small bet
  const validMultiplier = 2.0;
  const validResult = await validateBet(validBet, validMultiplier);
  console.log(`   Bet: ${formatEther(validBet)} ETH at ${validMultiplier}x`);
  console.log(`   Potential Payout: ${formatEther(validBet * BigInt(validMultiplier * 100) / BigInt(100))} ETH`);
  console.log(`   Allowed: ${validResult.allowed ? "✅ Yes" : "❌ No"}`);
  if (validResult.reason) {
    console.log(`   Reason: ${validResult.reason}`);
  }
  console.log();

  // 4. Test bet exceeding max bet limit
  console.log("4️⃣ Testing Bet Exceeding Max Bet Limit:");
  const excessiveBet = limits.maxBet + parseEther("0.001");
  const excessiveResult = await validateBet(excessiveBet, 2.0);
  console.log(`   Bet: ${formatEther(excessiveBet)} ETH at 2.0x`);
  console.log(`   Max Bet: ${formatEther(limits.maxBet)} ETH`);
  console.log(`   Allowed: ${excessiveResult.allowed ? "✅ Yes" : "❌ No"}`);
  if (excessiveResult.reason) {
    console.log(`   Reason: ${excessiveResult.reason}`);
  }
  console.log();

  // 5. Test bet with excessive payout
  console.log("5️⃣ Testing Bet with Excessive Payout:");
  const moderateBet = parseEther("0.0005");
  const highMultiplier = 1000; // 1000x multiplier
  const potentialPayout = (moderateBet * BigInt(highMultiplier * 100)) / BigInt(100);
  const payoutResult = await validateBet(moderateBet, highMultiplier);
  console.log(`   Bet: ${formatEther(moderateBet)} ETH at ${highMultiplier}x`);
  console.log(`   Potential Payout: ${formatEther(potentialPayout)} ETH`);
  console.log(`   Max Payout: ${formatEther(limits.maxPayout)} ETH`);
  console.log(`   Allowed: ${payoutResult.allowed ? "✅ Yes" : "❌ No"}`);
  if (payoutResult.reason) {
    console.log(`   Reason: ${payoutResult.reason}`);
  }
  console.log();

  // 6. Test max multiplier calculation
  console.log("6️⃣ Testing Max Multiplier Calculation:");
  const testBet = parseEther("0.0001");
  const maxMult = await getMaxMultiplier(testBet);
  console.log(`   For bet: ${formatEther(testBet)} ETH`);
  console.log(`   Max Multiplier: ${maxMult.toFixed(2)}x`);
  console.log(`   Would payout: ${formatEther((testBet * BigInt(Math.floor(maxMult * 100))) / BigInt(100))} ETH`);
  console.log();

  // 7. Edge cases
  console.log("7️⃣ Testing Edge Cases:");

  // Test exactly max bet
  const exactMaxBet = limits.maxBet;
  const exactMaxResult = await validateBet(exactMaxBet, 2.0);
  console.log(`   a) Exactly max bet (${formatEther(exactMaxBet)} ETH):`);
  console.log(`      Allowed: ${exactMaxResult.allowed ? "✅ Yes" : "❌ No"}`);

  // Test 1 wei over max bet
  const oneWeiOver = limits.maxBet + BigInt(1);
  const oneWeiOverResult = await validateBet(oneWeiOver, 2.0);
  console.log(`   b) 1 wei over max bet:`);
  console.log(`      Allowed: ${oneWeiOverResult.allowed ? "✅ Yes" : "❌ No"}`);

  // Test payout exactly at limit
  const maxPayoutBet = limits.maxPayout / BigInt(200); // 2x multiplier = payout/2
  const maxPayoutResult = await validateBet(maxPayoutBet, 2.0);
  console.log(`   c) Payout exactly at limit:`);
  console.log(`      Bet: ${formatEther(maxPayoutBet)} ETH at 2.0x`);
  console.log(`      Payout: ${formatEther(maxPayoutBet * BigInt(200) / BigInt(100))} ETH`);
  console.log(`      Allowed: ${maxPayoutResult.allowed ? "✅ Yes" : "❌ No"}`);

  console.log();
  console.log("✅ Bankroll limit tests complete!");
}

testBankrollLimits()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
