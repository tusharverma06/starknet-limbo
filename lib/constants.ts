import { baseSepolia, base } from "wagmi/chains";

// Chain Configuration
export const CHAIN = baseSepolia; // Base Sepolia (testnet) - Chain ID: 84532
// export const CHAIN = base; // Base (mainnet) - Chain ID: 8453

export const MIN_BET_USD = 0.1; // USD
export const MAX_BET_USD = 1000; // USD
export const MIN_MULTIPLIER = 1.01;
export const MAX_MULTIPLIER = 10000.0;

export const GAME_STATES = {
  IDLE: "idle",
  PLACING_BET: "placing_bet",
  RESOLVED: "resolved",
} as const;

// Off-chain provably fair settings
export const HOUSE_EDGE = 0.02; // 2% house edge
export const INSTANT_RESULT_TIME = 300; // ~300ms average response time
