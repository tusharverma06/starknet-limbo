/**
 * Comprehensive verification utilities for provably fair bets
 * Based on MAIN.txt requirements
 */

/**
 * Convert randomness bytes (hex string) to uniform float [0, 1)
 * This matches the Python: randomness_to_uniform_float(randomness)
 */
export function randomnessToUniformFloat(randomnessHex: string): number {
  // Remove '0x' prefix if present
  const hex = randomnessHex.startsWith("0x")
    ? randomnessHex.slice(2)
    : randomnessHex;

  // Convert hex to BigInt
  const randomBigInt = BigInt("0x" + hex);

  // Get max value for 256-bit number (2^256)
  const maxValue = BigInt(2) ** BigInt(256);

  // Convert to float by dividing: randomness / 2^256
  // This gives us a value in [0, 1)
  const floatValue = Number(randomBigInt) / Number(maxValue);

  return floatValue;
}

/**
 * Simulate limbo game result using the ACTUAL game formula
 * This matches the formula used in provablyFair.ts (gameNumber-based)
 * Returns payout in wei (same units as bet)
 */
export function simulateLimbo(params: {
  bet: bigint; // Bet amount in wei
  edge: number; // House edge (0.02 for 2%)
  randomness: string; // Hex string of random bytes (this is the randomValue/gameNumber)
  targetMultiplier: number; // Target multiplier as decimal (e.g., 1.5 for 1.5x)
}): bigint {
  // IMPORTANT: The randomness here should be the gameNumber, not the raw randomValue
  // The game uses: limboMultiplier = (1 - edge) * 1e9 / gameNumber

  // Parse gameNumber from randomness (assuming it's passed as gameNumber)
  const gameNumber = BigInt(params.randomness);

  // Calculate multiplier using the same formula as the actual game
  const edgeFactor = BigInt(Math.floor((1 - params.edge) * 10000));
  const oneHundred = BigInt(100);
  const tenThousand = BigInt(10000);
  const oneBillion = BigInt(1e9);

  const limboMultiplierScaled = (edgeFactor * oneBillion * oneHundred) / (gameNumber * tenThousand);
  const limboMultiplier = Number(limboMultiplierScaled) / 100;

  console.log("🎲 Simulation:", {
    gameNumber: gameNumber.toString(),
    limboMultiplier,
    targetMultiplier: params.targetMultiplier,
    win: limboMultiplier >= params.targetMultiplier,
  });

  // If limbo multiplier >= target, user wins
  if (limboMultiplier >= params.targetMultiplier) {
    // Payout = target_multiplier * bet
    const payout = BigInt(Math.floor(params.targetMultiplier * Number(params.bet)));
    return payout;
  } else {
    // User loses
    return BigInt(0);
  }
}

/**
 * Get simulated limbo multiplier using the ACTUAL game formula
 * Returns the multiplier value (not the payout)
 */
export function getSimulatedMultiplier(params: {
  gameNumber: string; // Changed from randomness to gameNumber for clarity
  edge: number; // 0.02 for 2%
}): number {
  // Use the same formula as the actual game (from provablyFair.ts)
  const gameNum = BigInt(params.gameNumber);
  const edgeFactor = BigInt(Math.floor((1 - params.edge) * 10000));
  const oneHundred = BigInt(100);
  const tenThousand = BigInt(10000);
  const oneBillion = BigInt(1e9);

  const limboMultiplierScaled = (edgeFactor * oneBillion * oneHundred) / (gameNum * tenThousand);
  return Number(limboMultiplierScaled) / 100;
}

/**
 * Calculate balance delta from settlement
 * Returns the change in balance (negative for loss, positive for win)
 */
export function calculateSettlementDelta(params: {
  outcome: "win" | "lose";
  wager: bigint;
  payout: bigint;
}): bigint {
  if (params.outcome === "win") {
    // Win: payout - wager (net gain)
    return params.payout - params.wager;
  } else {
    // Loss: -wager (net loss)
    return -params.wager;
  }
}

/**
 * Extract balance delta from transaction value
 * For ETH transfers, this is the transaction value
 */
export function extractTxBalanceDelta(txValue: string): bigint {
  return BigInt(txValue);
}

/**
 * Verify that settlement delta matches transaction delta
 */
export function verifyBalanceDeltas(params: {
  settlementDelta: bigint;
  txDelta: bigint;
}): boolean {
  return params.settlementDelta === params.txDelta;
}
