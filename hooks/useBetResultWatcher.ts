"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { LIMBO_GAME_ABI } from "@/lib/contract/abi";
import { CONTRACT_ADDRESS, CHAIN } from "@/lib/contract/config";

interface BetResult {
  requestId: bigint;
  player: string;
  betAmount: bigint;
  targetMultiplier: bigint;
  limboMultiplier: bigint;
  vrfRandomWord: bigint;
  win: boolean;
  payout: bigint;
  timestamp: bigint;
}

interface UseBetResultWatcherReturn {
  result: BetResult | null;
  isWaiting: boolean;
  error: string | null;
  watchForResult: (requestId: string) => Promise<BetResult | null>;
  cancelWatch: () => void;
}

/**
 * Hook to watch for a specific bet result from the BetResolved event
 * This polls for the event after bet placement
 */
export function useBetResultWatcher(): UseBetResultWatcherReturn {
  const [result, setResult] = useState<BetResult | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startBlockRef = useRef<number | null>(null);

  /**
   * Cancel watching for result
   */
  const cancelWatch = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsWaiting(false);
  }, []);

  /**
   * Watch for BetResolved event for a specific requestId
   */
  const watchForResult = useCallback(
    async (requestId: string): Promise<BetResult | null> => {
      console.log("👀 Watching for bet result, requestId:", requestId);

      // Setup
      setResult(null);
      setError(null);
      setIsWaiting(true);

      try {
        const rpcUrl =
          process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL ||
          CHAIN.rpcUrls.default.http[0];
        const provider = new JsonRpcProvider(rpcUrl);
        const contract = new Contract(
          CONTRACT_ADDRESS,
          LIMBO_GAME_ABI,
          provider
        );

        // Get current block number
        const currentBlock = await provider.getBlockNumber();
        startBlockRef.current = currentBlock;

        console.log(
          "📍 Starting from block:",
          currentBlock,
          "Request ID:",
          requestId
        );

        // Poll for the event
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 60; // 60 attempts = 2 minutes (poll every 2 seconds)

          pollingIntervalRef.current = setInterval(async () => {
            attempts++;

            try {
              console.log(
                `🔍 Polling attempt ${attempts}/${maxAttempts} for requestId:`,
                requestId
              );

              // Query BetResolved events
              const filter = contract.filters.BetResolved(requestId);
              const events = await contract.queryFilter(
                filter,
                startBlockRef.current,
                "latest"
              );

              if (events.length > 0) {
                console.log("✅ Found BetResolved event!", events[0]);

                const event = events[0];
                const args = event.args;

                const betResult: BetResult = {
                  requestId: args[0],
                  player: args[1],
                  betAmount: args[2],
                  targetMultiplier: args[3],
                  limboMultiplier: args[4],
                  vrfRandomWord: args[5],
                  win: args[6],
                  payout: args[7],
                  timestamp: args[8],
                };

                setResult(betResult);
                setIsWaiting(false);
                cancelWatch();
                resolve(betResult);
              } else if (attempts >= maxAttempts) {
                // Timeout after max attempts
                const timeoutError = "Bet result timeout - VRF may be delayed";
                console.error("❌", timeoutError);
                setError(timeoutError);
                setIsWaiting(false);
                cancelWatch();
                reject(new Error(timeoutError));
              }
            } catch (pollError) {
              console.error("Error polling for bet result:", pollError);
              // Don't stop polling on individual errors, keep trying
            }
          }, 2000); // Poll every 2 seconds
        });
      } catch (err: any) {
        console.error("Error setting up bet result watcher:", err);
        setError(err.message || "Failed to watch for bet result");
        setIsWaiting(false);
        return null;
      }
    },
    [cancelWatch]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelWatch();
    };
  }, [cancelWatch]);

  return {
    result,
    isWaiting,
    error,
    watchForResult,
    cancelWatch,
  };
}
