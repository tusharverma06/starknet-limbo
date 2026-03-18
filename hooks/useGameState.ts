import { create } from "zustand";
import { GAME_STATES } from "@/lib/constants";

interface GameState {
  state: keyof typeof GAME_STATES;
  betAmount: string;
  targetMultiplier: number;
  lastWin: boolean | null;
  lastPayout: bigint | null;

  setState: (state: keyof typeof GAME_STATES) => void;
  setBetAmount: (amount: string) => void;
  setTargetMultiplier: (multiplier: number) => void;
  setLastResult: (win: boolean, payout: bigint) => void;
  reset: () => void;
}

export const useGameState = create<GameState>((set) => ({
  state: "IDLE",
  betAmount: "0",
  targetMultiplier: 2.0,
  lastWin: null,
  lastPayout: null,

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
}));
