import { useQuery } from "@tanstack/react-query";
import { useGameStore } from "@/store/gameStore";
import { useEffect } from "react";
import { getAuthHeaders } from "./useSimpleSiwe";
import { useAccount } from "wagmi";

interface BalanceData {
  balance: string; // in wei
  balanceInEth: number;
  balanceInUsd: number;
  address: string;
}

/**
 * Hook to fetch and monitor server wallet balance
 * Fetches directly from blockchain via API
 * Only refetches on manual trigger or window focus
 * Supports optimistic updates for instant UI feedback
 * Requires session authentication
 */
export function useBalance(userId: string | null, isAuthenticated: boolean) {
  const { address: connectedAddress } = useAccount();
  const { optimisticBalanceUsd, setOptimisticBalance } = useGameStore();

  const queryEnabled = !!userId && isAuthenticated;

  const { data, isLoading, error, refetch, isRefetching } =
    useQuery<BalanceData>({
      queryKey: ["balance", userId, isAuthenticated],
      queryFn: async () => {
        if (!userId) {
          throw new Error("User ID is required");
        }

        const response = await fetch("/api/wallet/balance", {
          headers: getAuthHeaders(connectedAddress || undefined),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Balance fetch failed:", errorData);
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
      enabled: queryEnabled, // Only fetch if user is authenticated
      refetchInterval: false, // Disable auto-refetch - rely on manual refetch after transactions
      refetchOnWindowFocus: true, // Still refetch when user returns to tab
      staleTime: 30000, // Consider data stale after 30 seconds
      retry: false, // Don't retry failed requests
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
      else if (Math.abs(optimisticBalanceUsd - data.balanceInUsd) > 0.01) {
        // Only sync if the difference is significant (>$0.01) to avoid unnecessary updates from rounding
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
