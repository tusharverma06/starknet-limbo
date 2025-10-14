export const MIN_BET = 0.001; // ETH
export const MAX_BET = 1; // ETH
export const MIN_MULTIPLIER = 1.01;
export const MAX_MULTIPLIER = 10000.0;

export const GAME_STATES = {
  IDLE: 'idle',
  PLACING_BET: 'placing_bet',
  WAITING_VRF: 'waiting_vrf',
  RESOLVED: 'resolved',
} as const;

export const VRF_RESPONSE_TIME = 30000; // 30 seconds average
