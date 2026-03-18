import { base } from "wagmi/chains";

// Chain Configuration
export const CHAIN = base; // Base (mainnet) - Chain ID: 8453

export const MIN_BET_USD = 0.1; // USD
export const MAX_BET_USD = 10; // USD - Temporary limit (was 1000)
export const MIN_MULTIPLIER = 1.01;
export const MAX_MULTIPLIER = 5; // Temporary limit (was 10000)

export const GAME_STATES = {
  IDLE: "idle",
  PLACING_BET: "placing_bet",
  RESOLVED: "resolved",
} as const;

// Off-chain provably fair settings
export const HOUSE_EDGE = 0.10; // 10% house edge
export const INSTANT_RESULT_TIME = 300; // ~300ms average response time

// Custodial wallet deployment sponsorship
export const SPONSORED_DEPLOYMENT_STRK = "3000000000000000000"; // 3 STRK in wei (~$0.12 at $0.04/STRK)
// Breakdown: ~0.002 STRK for deployment, ~2.998 STRK remaining for future withdrawals

// Rate Limiting & Anti-Abuse
export const RATE_LIMITS = {
  // Per-user rate limits
  PER_USER_PER_MINUTE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // Max 10 bets per minute
    maxAmount: 50, // Max $50 total bet amount per minute
  },
  PER_USER_PER_HOUR: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100, // Max 100 bets per hour
    maxAmount: 200, // Max $200 total bet amount per hour
  },
  PER_USER_PER_DAY: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 500, // Max 500 bets per day
    maxAmount: 1000, // Max $1000 total bet amount per day
  },
  // IP-based rate limits (for anonymous/unauthenticated requests)
  PER_IP_PER_MINUTE: {
    windowMs: 60 * 1000,
    maxRequests: 20, // Slightly higher for multiple users behind same IP
    maxAmount: 100,
  },
} as const;
