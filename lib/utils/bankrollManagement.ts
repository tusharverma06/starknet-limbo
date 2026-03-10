import { getHouseWalletBalance } from "@/lib/security/houseWallet";
import { formatEther } from "ethers";

/**
 * Bankroll management configuration
 * These limits protect the house from going broke due to variance
 */
const BANKROLL_CONFIG = {
  // Max bet as percentage of house bankroll (1% standard)
  MAX_BET_PERCENT: 0.01,

  // Max payout as percentage of house bankroll (10% recommended)
  MAX_PAYOUT_PERCENT: 0.1,

  // Minimum house balance required to accept bets (0.0001 ETH)
  MIN_HOUSE_BALANCE: BigInt("100000000000000"), // 0.0001 ETH
};

export interface BankrollLimits {
  houseBalance: bigint;
  maxBet: bigint;
  maxPayout: bigint;
  canAcceptBets: boolean;
  reason?: string;
}

export interface BetValidation {
  allowed: boolean;
  reason?: string;
  maxBet?: bigint;
  maxPayout?: bigint;
  wouldPayout?: bigint;
}

/**
 * Get current bankroll limits based on house wallet balance
 */
export async function getBankrollLimits(): Promise<BankrollLimits> {
  const houseBalance = await getHouseWalletBalance();

  // Check if house has minimum balance
  if (houseBalance < BANKROLL_CONFIG.MIN_HOUSE_BALANCE) {
    return {
      houseBalance,
      maxBet: BigInt(0),
      maxPayout: BigInt(0),
      canAcceptBets: false,
      reason: `House wallet balance too low (${formatEther(houseBalance)} ETH). Minimum required: ${formatEther(BANKROLL_CONFIG.MIN_HOUSE_BALANCE)} ETH`,
    };
  }

  // Calculate max bet (1% of bankroll)
  const maxBet =
    (houseBalance * BigInt(Math.floor(BANKROLL_CONFIG.MAX_BET_PERCENT * 10000))) /
    BigInt(10000);

  // Calculate max payout (10% of bankroll)
  const maxPayout =
    (houseBalance *
      BigInt(Math.floor(BANKROLL_CONFIG.MAX_PAYOUT_PERCENT * 10000))) /
    BigInt(10000);

  return {
    houseBalance,
    maxBet,
    maxPayout,
    canAcceptBets: true,
  };
}

/**
 * Validate if a bet is allowed given current bankroll limits
 *
 * @param betAmount Bet amount in wei
 * @param targetMultiplier Target multiplier (e.g., 1.2 for 1.2x)
 * @returns Validation result with reason if not allowed
 */
export async function validateBet(
  betAmount: bigint,
  targetMultiplier: number
): Promise<BetValidation> {
  const limits = await getBankrollLimits();

  // Check if house can accept bets at all
  if (!limits.canAcceptBets) {
    return {
      allowed: false,
      reason: limits.reason || "House wallet cannot accept bets",
    };
  }

  // Check bet amount against max bet limit
  if (betAmount > limits.maxBet) {
    return {
      allowed: false,
      reason: `Bet amount (${formatEther(betAmount)} ETH) exceeds maximum allowed bet (${formatEther(limits.maxBet)} ETH)`,
      maxBet: limits.maxBet,
    };
  }

  // Calculate potential payout (bet * multiplier)
  const potentialPayout =
    (betAmount * BigInt(Math.floor(targetMultiplier * 100))) / BigInt(100);

  // Check payout against max payout limit
  if (potentialPayout > limits.maxPayout) {
    return {
      allowed: false,
      reason: `Potential payout (${formatEther(potentialPayout)} ETH at ${targetMultiplier}x) exceeds maximum allowed payout (${formatEther(limits.maxPayout)} ETH)`,
      maxPayout: limits.maxPayout,
      wouldPayout: potentialPayout,
    };
  }

  // Also check if house has enough balance to cover the payout
  // (this is a safety check - max payout should already handle this)
  if (potentialPayout > limits.houseBalance) {
    return {
      allowed: false,
      reason: `Potential payout (${formatEther(potentialPayout)} ETH) exceeds house balance (${formatEther(limits.houseBalance)} ETH)`,
      wouldPayout: potentialPayout,
    };
  }

  // Bet is valid!
  return {
    allowed: true,
  };
}

/**
 * Calculate the maximum multiplier allowed for a given bet amount
 * This helps users understand what multipliers they can use
 *
 * @param betAmount Bet amount in wei
 * @returns Maximum allowed multiplier
 */
export async function getMaxMultiplier(betAmount: bigint): Promise<number> {
  const limits = await getBankrollLimits();

  if (!limits.canAcceptBets || betAmount === BigInt(0)) {
    return 0;
  }

  // Max multiplier = max payout / bet amount
  const maxMultiplier = Number(limits.maxPayout) / Number(betAmount);

  // Return reasonable maximum (cap at 1000x even if bankroll allows more)
  return Math.min(maxMultiplier, 1000);
}

/**
 * Get bankroll statistics for display
 */
export async function getBankrollStats() {
  const limits = await getBankrollLimits();

  return {
    houseBalance: formatEther(limits.houseBalance),
    maxBet: formatEther(limits.maxBet),
    maxPayout: formatEther(limits.maxPayout),
    canAcceptBets: limits.canAcceptBets,
    utilizationPercent:
      limits.canAcceptBets && limits.houseBalance > BigInt(0)
        ? Number((limits.maxBet * BigInt(100)) / limits.houseBalance)
        : 0,
  };
}
