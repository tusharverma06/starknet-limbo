import { createHash, randomBytes } from "crypto";
import { HOUSE_EDGE } from "@/lib/constants";

/**
 * Generate a secure random server seed
 * @returns 32-byte hex string
 */
export function generateServerSeed(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate a client seed (can be user-provided or random)
 * @returns 32-byte hex string
 */
export function generateClientSeed(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Create SHA256 hash of a string
 * @param input - String to hash
 * @returns Hex string of hash
 */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Create server seed hash (commitment)
 * @param serverSeed - The server seed to hash
 * @returns SHA256 hash of server seed
 */
export function createServerSeedHash(serverSeed: string): string {
  return sha256(serverSeed);
}

/**
 * Generate random value from seeds and bet ID
 * @param serverSeed - Server seed
 * @param playerId - Player wallet address
 * @param betId - Bet ID
 * @returns SHA256 hash of combined inputs
 */
export function generateRandomValue(
  serverSeed: string,
  playerId: string,
  betId: string
): string {
  const combined = serverSeed + playerId.toLowerCase() + betId;
  return sha256(combined);
}

/**
 * Derive game number from random value
 * @param randomValue - Hex string from generateRandomValue
 * @returns BigInt game number (1 to 1,000,000,000)
 */
export function deriveGameNumber(randomValue: string): bigint {
  // Convert hex to BigInt
  const randomBigInt = BigInt("0x" + randomValue);
  // Modulo 1 billion and add 1 to get range [1, 1e9]
  const gameNumber = (randomBigInt % BigInt(1e9)) + BigInt(1);
  return gameNumber;
}

/**
 * Calculate limbo multiplier from game number
 * @param gameNumber - Game number (1 to 1,000,000,000)
 * @param houseEdge - House edge as decimal (e.g., 0.02 for 2%) - defaults to HOUSE_EDGE constant
 * @returns Multiplier as BigInt (scaled by 100, e.g., 150 = 1.50x)
 */
export function calculateLimboMultiplier(
  gameNumber: bigint,
  houseEdge: number = HOUSE_EDGE
): bigint {
  // Formula: (1 - houseEdge) / (gameNumber / 1e9)
  // Simplified: (1 - houseEdge) * 1e9 / gameNumber

  const edgeFactor = BigInt(Math.floor((1 - houseEdge) * 10000)); // Scale to avoid decimals
  const oneHundred = BigInt(100);
  const tenThousand = BigInt(10000);
  const oneBillion = BigInt(1e9);

  // Calculate: edgeFactor * 1e9 * 100 / (gameNumber * 10000)
  // This gives us multiplier * 100 (so 150 = 1.50x)
  const multiplier =
    (edgeFactor * oneBillion * oneHundred) / (gameNumber * tenThousand);

  return multiplier;
}

/**
 * Determine if bet is a win
 * @param limboMultiplier - Result multiplier (x100)
 * @param targetMultiplier - Target multiplier (x100)
 * @returns true if win, false if lose
 */
export function determineBetOutcome(
  limboMultiplier: bigint,
  targetMultiplier: bigint
): boolean {
  return limboMultiplier >= targetMultiplier;
}

/**
 * Calculate payout for a winning bet
 * @param wager - Bet amount in wei
 * @param targetMultiplier - Target multiplier (x100)
 * @param win - Whether the bet won
 * @returns Payout in wei (0 if lost)
 */
export function calculatePayout(
  wager: bigint,
  targetMultiplier: bigint,
  win: boolean
): bigint {
  if (!win) {
    return BigInt(0);
  }

  // Payout = wager * (targetMultiplier / 100)
  return (wager * targetMultiplier) / BigInt(100);
}

/**
 * Verify a bet's provably fair properties
 * @param bet - Bet data to verify
 * @returns Verification result with details
 */
export interface BetVerification {
  valid: boolean;
  checks: {
    serverSeedHashMatches: boolean;
    randomValueMatches: boolean;
    gameNumberMatches: boolean;
    multiplierMatches: boolean;
    outcomeMatches: boolean;
    payoutMatches: boolean;
  };
  errors: string[];
}

export function verifyBet(bet: {
  serverSeed: string;
  serverSeedHash: string;
  playerId: string;
  betId: string;
  randomValue: string;
  gameNumber: string;
  limboMultiplier: string;
  targetMultiplier: string;
  outcome: string;
  wager: string;
  payout: string;
}): BetVerification {
  const errors: string[] = [];
  const checks = {
    serverSeedHashMatches: false,
    randomValueMatches: false,
    gameNumberMatches: false,
    multiplierMatches: false,
    outcomeMatches: false,
    payoutMatches: false,
  };

  // Check 1: Verify server seed hash
  const expectedHash = createServerSeedHash(bet.serverSeed);
  checks.serverSeedHashMatches = expectedHash === bet.serverSeedHash;
  if (!checks.serverSeedHashMatches) {
    errors.push(
      `Server seed hash mismatch. Expected: ${expectedHash}, Got: ${bet.serverSeedHash}`
    );
  }

  // Check 2: Verify random value
  const expectedRandomValue = generateRandomValue(
    bet.serverSeed,
    bet.playerId,
    bet.betId
  );
  checks.randomValueMatches = expectedRandomValue === bet.randomValue;
  if (!checks.randomValueMatches) {
    errors.push(
      `Random value mismatch. Expected: ${expectedRandomValue}, Got: ${bet.randomValue}`
    );
  }

  // Check 3: Verify game number
  const expectedGameNumber = deriveGameNumber(bet.randomValue);
  checks.gameNumberMatches = expectedGameNumber.toString() === bet.gameNumber;
  if (!checks.gameNumberMatches) {
    errors.push(
      `Game number mismatch. Expected: ${expectedGameNumber}, Got: ${bet.gameNumber}`
    );
  }

  // Check 4: Verify limbo multiplier
  const expectedMultiplier = calculateLimboMultiplier(BigInt(bet.gameNumber));
  checks.multiplierMatches =
    expectedMultiplier.toString() === bet.limboMultiplier;
  if (!checks.multiplierMatches) {
    errors.push(
      `Multiplier mismatch. Expected: ${expectedMultiplier}, Got: ${bet.limboMultiplier}`
    );
  }

  // Check 5: Verify outcome
  const expectedOutcome = determineBetOutcome(
    BigInt(bet.limboMultiplier),
    BigInt(bet.targetMultiplier)
  );
  const outcomeString = expectedOutcome ? "win" : "lose";
  checks.outcomeMatches = outcomeString === bet.outcome;
  if (!checks.outcomeMatches) {
    errors.push(
      `Outcome mismatch. Expected: ${outcomeString}, Got: ${bet.outcome}`
    );
  }

  // Check 6: Verify payout
  // IMPORTANT: Use the actual bet outcome (not recalculated) for payout verification
  // This ensures we verify the payout is correct for what the bet actually was
  const actualOutcomeWin = bet.outcome === "win";
  const expectedPayout = calculatePayout(
    BigInt(bet.wager),
    BigInt(bet.targetMultiplier),
    actualOutcomeWin
  );
  checks.payoutMatches = expectedPayout.toString() === bet.payout;
  if (!checks.payoutMatches) {
    errors.push(
      `Payout mismatch. Expected: ${expectedPayout} (for ${bet.outcome}), Got: ${bet.payout}`
    );
  }

  return {
    valid: errors.length === 0,
    checks,
    errors,
  };
}

/**
 * Complete bet result generation
 * Generates all values needed for a provably fair bet
 */
export interface BetResult {
  serverSeed: string;
  serverSeedHash: string;
  randomValue: string;
  gameNumber: string;
  limboMultiplier: string;
  outcome: "win" | "lose";
  payout: string;
}

export function generateBetResult(
  playerId: string,
  betId: string,
  wager: string,
  targetMultiplier: string,
  serverSeed?: string
): BetResult {
  // Generate server seed if not provided
  const seed = serverSeed || generateServerSeed();

  // Step 1: Create commitment
  const serverSeedHash = createServerSeedHash(seed);

  // Step 2: Generate random value
  const randomValue = generateRandomValue(seed, playerId, betId);

  // Step 3: Derive game number
  const gameNumber = deriveGameNumber(randomValue);

  // Step 4: Calculate multiplier
  const limboMultiplier = calculateLimboMultiplier(gameNumber);

  // Step 5: Determine outcome
  const win = determineBetOutcome(limboMultiplier, BigInt(targetMultiplier));

  // Step 6: Calculate payout
  const payout = calculatePayout(BigInt(wager), BigInt(targetMultiplier), win);

  return {
    serverSeed: seed,
    serverSeedHash,
    randomValue,
    gameNumber: gameNumber.toString(),
    limboMultiplier: limboMultiplier.toString(),
    outcome: win ? "win" : "lose",
    payout: payout.toString(),
  };
}
