import { useState, useEffect, useCallback } from "react";
import { PonderAPI, type Bet, type User } from "@/lib/graphql/ponder";

interface UsePonderBetsReturn {
  bets: Bet[];
  userBets: Bet[];
  userStats: User | null;
  isLoading: boolean;
  error: string | null;
  refreshBets: () => Promise<void>;
  refreshUserBets: (address: string) => Promise<void>;
  refreshUserStats: (address: string) => Promise<void>;
  pollForNewBets: (lastTimestamp: number) => Promise<Bet[]>;
}

/**
 * Hook for fetching betting data from Ponder GraphQL API
 */
export function usePonderBets(): UsePonderBetsReturn {
  const [bets, setBets] = useState<Bet[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [userStats, setUserStats] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refresh all bets
   */
  const refreshBets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allBets = await PonderAPI.getAllBets(100);
      setBets(allBets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bets");
      console.error("Failed to refresh bets:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh bets for a specific user
   */
  const refreshUserBets = useCallback(async (address: string) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const bets = await PonderAPI.getUserBets(address, 50);
      setUserBets(bets);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch user bets"
      );
      console.error("Failed to refresh user bets:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh user statistics
   */
  const refreshUserStats = useCallback(async (address: string) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const stats = await PonderAPI.getUserStats(address);
      setUserStats(stats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch user stats"
      );
      console.error("Failed to refresh user stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Poll for new bets since a timestamp
   */
  const pollForNewBets = useCallback(
    async (lastTimestamp: number): Promise<Bet[]> => {
      try {
        const recentBets = await PonderAPI.getRecentBets(100);
        const newBets = recentBets.filter(
          (bet) => bet.placedAt > lastTimestamp
        );
        return newBets;
      } catch (err) {
        console.error("Failed to poll for new bets:", err);
        return [];
      }
    },
    []
  );

  // Auto-refresh bets on mount
  useEffect(() => {
    refreshBets();
  }, [refreshBets]);

  return {
    bets,
    userBets,
    userStats,
    isLoading,
    error,
    refreshBets,
    refreshUserBets,
    refreshUserStats,
    pollForNewBets,
  };
}

/**
 * Hook for real-time bet polling
 */
export function useBetPolling(
  lastTimestamp: number,
  onNewBets: (bets: Bet[]) => void,
  interval: number = 2000
) {
  const [isPolling, setIsPolling] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(lastTimestamp);

  useEffect(() => {
    if (!isPolling) return;

    const poll = async () => {
      try {
        const newBets = await PonderAPI.getRecentBets(50);
        const latestBets = newBets.filter(
          (bet) => bet.placedAt > currentTimestamp
        );

        if (latestBets.length > 0) {
          onNewBets(latestBets);
          setCurrentTimestamp(latestBets[0].placedAt);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    const intervalId = setInterval(poll, interval);
    return () => clearInterval(intervalId);
  }, [isPolling, currentTimestamp, onNewBets, interval]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  const updateTimestamp = useCallback((timestamp: number) => {
    setCurrentTimestamp(timestamp);
  }, []);

  return {
    isPolling,
    startPolling,
    stopPolling,
    updateTimestamp,
  };
}

/**
 * Hook for user-specific betting data
 */
export function useUserBets(address: string | null) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const [userBets, userStats] = await Promise.all([
        PonderAPI.getUserBets(address, 50),
        PonderAPI.getUserStats(address),
      ]);

      setBets(userBets);
      setStats(userStats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch user data"
      );
      console.error("Failed to refresh user data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      refresh();
    }
  }, [address, refresh]);

  return {
    bets,
    stats,
    isLoading,
    error,
    refresh,
  };
}
