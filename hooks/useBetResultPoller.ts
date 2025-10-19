import { useState, useEffect, useRef, useCallback } from "react";
import { PonderAPI, type Bet } from "@/lib/graphql/ponder";

interface ResolvedBet {
  requestId: bigint;
  player: string;
  amount: bigint;
  targetMultiplier: number;
  limboMultiplier: bigint;
  win: boolean;
  payout: bigint;
  timestamp: number;
  txHash: `0x${string}`;
}

interface UseBetResultPollerReturn {
  latestBet: ResolvedBet | null;
  resolvedBets: ResolvedBet[];
  isPolling: boolean;
  startPolling: () => void;
  stopPolling: () => void;
  clearLatestBet: () => void;
  clearAll: () => void;
}

/**
 * Hook for polling bet results from Ponder GraphQL API
 * Replaces the old contract event polling with instant results
 */
export function useBetResultPoller(
  userAddress: string | undefined
): UseBetResultPollerReturn {
  const [latestBet, setLatestBet] = useState<ResolvedBet | null>(null);
  const [resolvedBets, setResolvedBets] = useState<ResolvedBet[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [lastPollTimestamp, setLastPollTimestamp] = useState(Date.now());

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processedBetIds = useRef<Set<string>>(new Set());

  /**
   * Convert Ponder bet to ResolvedBet format
   */
  const convertPonderBet = useCallback((bet: Bet): ResolvedBet => {
    return {
      requestId: BigInt(bet.id), // Use bet ID as request ID
      player: bet.player,
      amount: BigInt(bet.betAmount),
      targetMultiplier: Number(bet.targetMultiplier) / 100,
      limboMultiplier: BigInt(bet.limboMultiplier || "0"),
      win: bet.win || false,
      payout: BigInt(bet.payout || "0"),
      timestamp: bet.placedAt * 1000, // Convert to milliseconds
      txHash: `0x${bet.id.slice(0, 64)}` as `0x${string}`, // Generate mock tx hash from ID
    };
  }, []);

  /**
   * Poll for new bets from Ponder
   */
  const pollForNewBets = useCallback(async () => {
    if (!userAddress) return;

    try {
      // Get recent bets for this user
      const recentBets = await PonderAPI.getUserBets(userAddress, 10);

      // Filter for new bets (not processed yet)
      const newBets = recentBets.filter(
        (bet) =>
          !processedBetIds.current.has(bet.id) &&
          bet.placedAt * 1000 > lastPollTimestamp
      );

      if (newBets.length > 0) {
        console.log("🎉 New bets found from Ponder:", newBets.length);

        // Process new bets
        const resolvedBets = newBets.map(convertPonderBet);

        // Mark as processed
        newBets.forEach((bet) => processedBetIds.current.add(bet.id));

        // Update latest bet (most recent)
        const latestResolvedBet = resolvedBets[0];
        setLatestBet(latestResolvedBet);

        // Add to history
        setResolvedBets((prev) => {
          const newBets = resolvedBets.filter(
            (bet) =>
              !prev.some((existing) => existing.requestId === bet.requestId)
          );
          return [...newBets, ...prev].slice(0, 50); // Keep last 50
        });

        // Update last poll timestamp
        setLastPollTimestamp(Date.now());

        console.log("✅ Processed new bets:", {
          count: newBets.length,
          latest: latestResolvedBet.win ? "WIN" : "LOSS",
          payout: latestResolvedBet.payout.toString(),
        });
      }
    } catch (error) {
      console.error("❌ Error polling for new bets:", error);
    }
  }, [userAddress, lastPollTimestamp, convertPonderBet]);

  /**
   * Start polling for bet results
   */
  const startPolling = useCallback(() => {
    if (isPolling || !userAddress) return;

    console.log("🔄 Starting bet result polling for:", userAddress);
    setIsPolling(true);

    // Poll immediately
    pollForNewBets();

    // Set up interval polling (every 2 seconds)
    pollingIntervalRef.current = setInterval(pollForNewBets, 2000);
  }, [isPolling, userAddress, pollForNewBets]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    console.log("⏹️ Stopping bet result polling");
    setIsPolling(false);

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  /**
   * Clear latest bet result
   */
  const clearLatestBet = useCallback(() => {
    setLatestBet(null);
  }, []);

  /**
   * Clear all bet results
   */
  const clearAll = useCallback(() => {
    setLatestBet(null);
    setResolvedBets([]);
    processedBetIds.current.clear();
    setLastPollTimestamp(Date.now());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Reset state when user address changes (but don't auto-start polling)
  useEffect(() => {
    if (userAddress) {
      // Reset state for new user
      clearAll();
    } else {
      stopPolling();
    }
  }, [userAddress, stopPolling, clearAll]);

  return {
    latestBet,
    resolvedBets,
    isPolling,
    startPolling,
    stopPolling,
    clearLatestBet,
    clearAll,
  };
}

/**
 * Hook for instant bet result checking
 * Checks for a specific bet result immediately after placement
 */
export function useInstantBetResult(userAddress: string | undefined) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<ResolvedBet | null>(null);

  const checkForResult = useCallback(
    async (expectedTimestamp: number) => {
      if (!userAddress) return null;

      setIsChecking(true);
      setResult(null);

      try {
        // Get user's latest bet
        const latestBet = await PonderAPI.getUserLatestBet(userAddress);

        if (latestBet && latestBet.placedAt * 1000 >= expectedTimestamp) {
          // Convert to ResolvedBet format
          const resolvedBet: ResolvedBet = {
            requestId: BigInt(latestBet.id),
            player: latestBet.player,
            amount: BigInt(latestBet.betAmount),
            targetMultiplier: Number(latestBet.targetMultiplier) / 100,
            limboMultiplier: BigInt(latestBet.limboMultiplier || "0"),
            win: latestBet.win || false,
            payout: BigInt(latestBet.payout || "0"),
            timestamp: latestBet.placedAt * 1000,
            txHash: `0x${latestBet.id.slice(0, 64)}` as `0x${string}`,
          };

          setResult(resolvedBet);
          return resolvedBet;
        }

        return null;
      } catch (error) {
        console.error("Error checking for instant result:", error);
        return null;
      } finally {
        setIsChecking(false);
      }
    },
    [userAddress]
  );

  return {
    result,
    isChecking,
    checkForResult,
  };
}
