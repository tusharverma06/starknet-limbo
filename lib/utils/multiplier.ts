import { HOUSE_EDGE } from "@/lib/constants";

/**
 * Get Limbo game statistics based on target multiplier
 * Matches the exact contract formula
 */
export function getLimboStats(targetMultiplier: number, edge: number = HOUSE_EDGE) {
  const winChance = (1 - edge) / targetMultiplier;
  const expectedValue = 1 - edge; // e.g., 90% for 10% edge

  return {
    winChancePercent: (winChance * 100).toFixed(2) + "%",
    winChanceDecimal: winChance,
    expectedValuePercent: (expectedValue * 100).toFixed(2) + "%",
    expectedValueDecimal: expectedValue,
  };
}

/**
 * Calculate the probability threshold (x value) needed to hit target multiplier
 * Based on contract formula: limboMultiplier = (1 - houseEdge) / x
 * This shows what random value range you need to win
 * Returns value as percentage (0-100%)
 */
export function calculateRequiredThreshold(targetMultiplier: number): number {
  const stats = getLimboStats(targetMultiplier);
  return parseFloat(stats.winChancePercent);
}

/**
 * Calculate win probability based on target multiplier
 * House edge is 2%
 * @deprecated Use getLimboStats instead
 */
export function calculateWinProbability(targetMultiplier: number): number {
  const stats = getLimboStats(targetMultiplier);
  return stats.winChanceDecimal * 100;
}

/**
 * Calculate potential payout
 * @param betAmount - Bet amount in wei (bigint)
 * @param multiplier - Target multiplier as decimal (e.g., 2.5 for 2.5x)
 * @returns Potential payout in wei (bigint)
 */
export function calculatePayout(betAmount: bigint, multiplier: number): bigint {
  // Convert multiplier to integer by multiplying by 100
  // e.g., 2.5 becomes 250, then divide by 100 at the end
  // const multiplierInt = Math.floor(multiplier * 100);
  return (betAmount * BigInt(multiplier.toString())) / BigInt(100);
}

/**
 * Validate multiplier range (1.01x to 100.00x)
 */
export function isValidMultiplier(multiplier: number): boolean {
  return multiplier >= 101 && multiplier <= 10000;
}

/**
 * Convert display multiplier (e.g., 2.00) to contract format (200)
 */
export function toContractMultiplier(displayMultiplier: number): number {
  return Math.round(displayMultiplier * 100);
}

/**
 * Convert contract multiplier (e.g., 200) to display format (2.00)
 */
export function toDisplayMultiplier(contractMultiplier: number): number {
  return contractMultiplier / 100;
}

/**
 * Multiplier presets for quick selection
 * Win chances calculated with current HOUSE_EDGE
 */
export const MULTIPLIER_PRESETS = [
  { label: '2x', value: 2.0, winChance: 45 },
  { label: '5x', value: 5.0, winChance: 18 },
  { label: '10x', value: 10.0, winChance: 9 },
  { label: '50x', value: 50.0, winChance: 1.8 },
  { label: '100x', value: 100.0, winChance: 0.9 },
  { label: '1000x', value: 1000.0, winChance: 0.09 },
];
