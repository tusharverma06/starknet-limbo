import { useState, useEffect, useCallback } from "react";

interface PendingBet {
  id: string;
  wager: string;
  payout: string;
  multiplier: string | null;
  targetMultiplier: string;
  createdAt: string;
  resolvedAt: string | null;
}

interface PendingSettlementsData {
  pendingCount: number;
  totalLocked: string;
  bets: PendingBet[];
}

export function usePendingSettlements() {
  const [data, setData] = useState<PendingSettlementsData>({
    pendingCount: 0,
    totalLocked: "0",
    bets: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingSettlements = useCallback(async () => {
    try {
      const response = await fetch("/api/wallet/pending-settlements", {
        credentials: 'include', // Required for cookies in cross-origin contexts
      });
      if (!response.ok) {
        throw new Error("Failed to fetch pending settlements");
      }

      const result = await response.json();
      if (result.success) {
        setData({
          pendingCount: result.pendingCount,
          totalLocked: result.totalLocked,
          bets: result.bets || [],
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Failed to fetch pending settlements:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchPendingSettlements();
  }, [fetchPendingSettlements]);

  // Poll every 5 seconds if there are pending settlements
  useEffect(() => {
    if (data.pendingCount === 0) return;

    const interval = setInterval(() => {
      fetchPendingSettlements();
    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [data.pendingCount, fetchPendingSettlements]);

  return {
    ...data,
    isLoading,
    error,
    refresh: fetchPendingSettlements,
  };
}
