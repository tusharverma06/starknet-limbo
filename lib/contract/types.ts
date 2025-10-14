export interface PendingBet {
  requestId: bigint;
  player: string;
  amount: bigint;
  targetMultiplier: number;
  timestamp: number;
  txHash: string;
}

export interface ResolvedBet {
  requestId: bigint;
  player: string;
  amount: bigint;
  targetMultiplier: number;
  limboMultiplier: bigint;
  win: boolean;
  payout: bigint;
  timestamp: number;
  txHash: string;
}

export interface GameState {
  isPlaying: boolean;
  currentBet: PendingBet | null;
  lastResult: ResolvedBet | null;
}

export interface User {
  address: `0x${string}`;
  totalBets: number;
  totalWagered: bigint;
  totalWon: bigint;
  winCount: number;
  lossCount: number;
  lastBetTimestamp: number;
}

export interface Bet {
  id: string;
  player: `0x${string}`;
  betAmount: bigint;
  targetMultiplier: bigint;
  limboMultiplier: bigint;
  win: boolean;
  payout: bigint;
  timestamp: number;
}

export interface UserWithBets extends User {
  bets: Bet[];
}

