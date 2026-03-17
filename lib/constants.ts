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
