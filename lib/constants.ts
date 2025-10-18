export const MIN_BET_USD = 0.1; // USD (No contract minimum, but small bets may not be economical)
export const MAX_BET_USD = 1000; // USD
export const MIN_MULTIPLIER = 1.01;
export const MAX_MULTIPLIER = 10000.0;

export const GAME_STATES = {
  IDLE: "idle",
  PLACING_BET: "placing_bet",
  WAITING_VRF: "waiting_vrf",
  RESOLVED: "resolved",
} as const;

export const VRF_RESPONSE_TIME = 2000; // 30 seconds average
