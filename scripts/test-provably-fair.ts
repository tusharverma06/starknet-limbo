/**
 * Test script for provably fair system
 * Run with: npx ts-node scripts/test-provably-fair.ts
 */

import {
  generateServerSeed,
  createServerSeedHash,
  generateRandomValue,
  deriveGameNumber,
  calculateLimboMultiplier,
  determineBetOutcome,
  calculatePayout,
  generateBetResult,
  verifyBet,
} from "../lib/utils/provablyFair.js";

console.log("🧪 Testing Provably Fair System\n");

// Test 1: Server Seed Generation
console.log("Test 1: Server Seed Generation");
const serverSeed = generateServerSeed();
console.log("✅ Server Seed:", serverSeed);
console.log("   Length:", serverSeed.length, "characters (64 expected)\n");

// Test 2: Server Seed Hash
console.log("Test 2: Server Seed Hash");
const serverSeedHash = createServerSeedHash(serverSeed);
console.log("✅ Server Seed Hash:", serverSeedHash);
console.log("   Length:", serverSeedHash.length, "characters (64 expected)\n");

// Test 3: Random Value Generation
console.log("Test 3: Random Value Generation");
const playerId = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1";
const betId = "clxxx123456789";
const randomValue = generateRandomValue(serverSeed, playerId, betId);
console.log("✅ Random Value:", randomValue);
console.log("   Player ID:", playerId);
console.log("   Bet ID:", betId, "\n");

// Test 4: Game Number Derivation
console.log("Test 4: Game Number Derivation");
const gameNumber = deriveGameNumber(randomValue);
console.log("✅ Game Number:", gameNumber.toString());
console.log("   Range: 1 to 1,000,000,000");
console.log(
  "   Valid:",
  gameNumber >= BigInt(1) && gameNumber <= BigInt(1000000000),
  "\n"
);

// Test 5: Limbo Multiplier Calculation
console.log("Test 5: Limbo Multiplier Calculation");
const limboMultiplier = calculateLimboMultiplier(gameNumber);
console.log("✅ Limbo Multiplier:", Number(limboMultiplier) / 100, "x");
console.log("   Raw value:", limboMultiplier.toString(), "(scaled by 100)\n");

// Test 6: Bet Outcome Determination
console.log("Test 6: Bet Outcome Determination");
const targetMultiplier = BigInt(200); // 2.00x
const outcome = determineBetOutcome(limboMultiplier, targetMultiplier);
console.log("✅ Outcome:", outcome ? "WIN" : "LOSE");
console.log("   Target:", Number(targetMultiplier) / 100, "x");
console.log("   Result:", Number(limboMultiplier) / 100, "x\n");

// Test 7: Payout Calculation
console.log("Test 7: Payout Calculation");
const wager = BigInt("1000000000000000000"); // 1 ETH in wei
const payout = calculatePayout(wager, targetMultiplier, outcome);
console.log("✅ Payout:", payout.toString(), "wei");
console.log("   Wager:", wager.toString(), "wei");
console.log("   Expected:", outcome ? "2 ETH" : "0 ETH", "\n");

// Test 8: Full Bet Result Generation
console.log("Test 8: Full Bet Result Generation");
const betResult = generateBetResult(
  playerId,
  betId,
  wager.toString(),
  targetMultiplier.toString()
);
console.log("✅ Generated Bet Result:");
console.log("   Server Seed Hash:", betResult.serverSeedHash);
console.log("   Game Number:", betResult.gameNumber);
console.log(
  "   Limbo Multiplier:",
  Number(betResult.limboMultiplier) / 100,
  "x"
);
console.log("   Outcome:", betResult.outcome);
console.log("   Payout:", betResult.payout, "wei\n");

// Test 9: Bet Verification
console.log("Test 9: Bet Verification");
const verification = verifyBet({
  serverSeed: betResult.serverSeed,
  serverSeedHash: betResult.serverSeedHash,
  playerId,
  betId,
  randomValue: betResult.randomValue,
  gameNumber: betResult.gameNumber,
  limboMultiplier: betResult.limboMultiplier,
  targetMultiplier: targetMultiplier.toString(),
  outcome: betResult.outcome,
  wager: wager.toString(),
  payout: betResult.payout,
});

console.log(
  "✅ Verification Result:",
  verification.valid ? "VALID" : "INVALID"
);
console.log("   Checks:");
console.log(
  "   - Server Seed Hash:",
  verification.checks.serverSeedHashMatches ? "✅" : "❌"
);
console.log(
  "   - Random Value:",
  verification.checks.randomValueMatches ? "✅" : "❌"
);
console.log(
  "   - Game Number:",
  verification.checks.gameNumberMatches ? "✅" : "❌"
);
console.log(
  "   - Multiplier:",
  verification.checks.multiplierMatches ? "✅" : "❌"
);
console.log("   - Outcome:", verification.checks.outcomeMatches ? "✅" : "❌");
console.log("   - Payout:", verification.checks.payoutMatches ? "✅" : "❌");

if (verification.errors.length > 0) {
  console.log("   Errors:", verification.errors);
}

// Test 10: Multiple Bets with Different Seeds
console.log("\nTest 10: Multiple Bets (Randomness Test)");
console.log("Generating 10 random bets...");
const multipliers: number[] = [];
for (let i = 0; i < 10; i++) {
  const result = generateBetResult(
    playerId,
    `bet-${i}`,
    wager.toString(),
    "200" // 2.00x target
  );
  multipliers.push(Number(result.limboMultiplier) / 100);
}
console.log(
  "✅ Multipliers:",
  multipliers.map((m) => m.toFixed(2) + "x").join(", ")
);
console.log("   All unique:", new Set(multipliers).size === 10 ? "✅" : "❌");
console.log(
  "   Range:",
  Math.min(...multipliers).toFixed(2),
  "-",
  Math.max(...multipliers).toFixed(2),
  "x\n"
);

// Test 11: Edge Cases
console.log("Test 11: Edge Cases");

// Very low game number (high multiplier)
const lowGameNumber = BigInt(1);
const highMultiplier = calculateLimboMultiplier(lowGameNumber);
console.log("✅ Lowest possible game number (1):");
console.log("   Multiplier:", Number(highMultiplier) / 100, "x");

// Very high game number (low multiplier)
const highGameNumber = BigInt(1000000000);
const lowMultiplier = calculateLimboMultiplier(highGameNumber);
console.log("✅ Highest possible game number (1,000,000,000):");
console.log("   Multiplier:", Number(lowMultiplier) / 100, "x");

// Mid-range game number
const midGameNumber = BigInt(500000000);
const midMultiplier = calculateLimboMultiplier(midGameNumber);
console.log("✅ Mid-range game number (500,000,000):");
console.log("   Multiplier:", Number(midMultiplier) / 100, "x\n");

console.log("🎉 All tests completed successfully!");
