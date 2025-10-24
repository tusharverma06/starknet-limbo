import { useQuery } from "@tanstack/react-query";
import { useGameStore } from "@/store/gameStore";
import { useEffect } from "react";

interface BalanceData {
  balance: string; // in wei
  balanceInEth: number;
  balanceInUsd: number;
  address: string;
}

/**
 * Hook to fetch and monitor server wallet balance
 * Fetches directly from blockchain via API
 * Auto-refreshes every 10 seconds
 * Supports optimistic updates for instant UI feedback
 */
export function useBalance(userId: string | null) {
  const { optimisticBalanceUsd, setOptimisticBalance } = useGameStore();

  const { data, isLoading, error, refetch, isRefetching } =
    useQuery<BalanceData>({
      queryKey: ["balance", userId],
      queryFn: async () => {
        if (!userId) {
          throw new Error("User ID is required");
        }

        const response = await fetch(`/api/wallet/balance?userId=${userId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch balance");
        }

        const data = await response.json();

        return {
          balance: data.balance,
          balanceInEth: data.balanceInEth,
          balanceInUsd: data.balanceInUsd || 0,
          address: data.address,
        };
      },
      enabled: !!userId,
      refetchInterval: 10000, // Refetch every 10 seconds
      refetchOnWindowFocus: true,
      staleTime: 5000, // Consider data stale after 5 seconds
    });

  // Sync optimistic balance with fetched data
  useEffect(() => {
    if (data?.balanceInUsd !== undefined) {
      // Initialize optimistic balance if null
      if (optimisticBalanceUsd === null) {
        setOptimisticBalance(data.balanceInUsd);
      }
      // If there's a significant difference between optimistic and fetched balance,
      // sync them (this handles async blockchain transaction completion)
      else if (Math.abs(optimisticBalanceUsd - data.balanceInUsd) > 0.001) {
        // Only sync if the difference is significant to avoid unnecessary updates
        console.log("🔄 Syncing optimistic balance with fetched balance:", {
          optimistic: optimisticBalanceUsd,
          fetched: data.balanceInUsd,
        });
        setOptimisticBalance(data.balanceInUsd);
      }
    }
  }, [data?.balanceInUsd, optimisticBalanceUsd, setOptimisticBalance]);

  // Use optimistic balance if available, otherwise use fetched balance
  const displayBalanceUsd = optimisticBalanceUsd ?? data?.balanceInUsd ?? 0;

  return {
    balance: data?.balance || "0",
    balanceInEth: data?.balanceInEth || 0,
    balanceInUsd: displayBalanceUsd,
    address: data?.address || "",
    isLoading,
    isRefetching,
    error: error ? (error as Error).message : null,
    refetch,
    // Expose the actual fetched balance for comparison
    fetchedBalanceUsd: data?.balanceInUsd || 0,
  };
}
