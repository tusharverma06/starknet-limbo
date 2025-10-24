import { create } from "zustand";
import { GAME_STATES } from "@/lib/constants";

interface GameState {
  state: keyof typeof GAME_STATES;
  betAmount: string;
  targetMultiplier: number;
  lastWin: boolean | null;
  lastPayout: bigint | null;

  // Optimistic balance tracking
  optimisticBalanceUsd: number | null;

  setState: (state: keyof typeof GAME_STATES) => void;
  setBetAmount: (amount: string) => void;
  setTargetMultiplier: (multiplier: number) => void;
  setLastResult: (win: boolean, payout: bigint) => void;
  reset: () => void;

  // Balance management
  setOptimisticBalance: (balanceUsd: number) => void;
  deductBet: (betAmountUsd: number) => void;
  addPayout: (payoutUsd: number) => void;
  clearOptimisticBalance: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  state: "IDLE",
  betAmount: "0.01",
  targetMultiplier: 2.0,
  lastWin: null,
  lastPayout: null,
  optimisticBalanceUsd: null,

  setState: (state) => set({ state }),
  setBetAmount: (betAmount) => set({ betAmount }),
  setTargetMultiplier: (targetMultiplier) => set({ targetMultiplier }),
  setLastResult: (win, payout) => set({ lastWin: win, lastPayout: payout }),
  reset: () =>
    set({
      state: "IDLE",
      lastWin: null,
      lastPayout: null,
    }),

  // Optimistic balance management
  setOptimisticBalance: (balanceUsd) =>
    set({ optimisticBalanceUsd: balanceUsd }),
  deductBet: (betAmountUsd) =>
    set((state) => ({
      optimisticBalanceUsd:
        state.optimisticBalanceUsd !== null
          ? Math.max(0, state.optimisticBalanceUsd - betAmountUsd)
          : null,
    })),
  addPayout: (payoutUsd) =>
    set((state) => ({
      optimisticBalanceUsd:
        state.optimisticBalanceUsd !== null
          ? state.optimisticBalanceUsd + payoutUsd
          : null,
    })),
  clearOptimisticBalance: () => set({ optimisticBalanceUsd: null }),
}));
