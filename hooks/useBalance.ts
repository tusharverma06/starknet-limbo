import { useQuery } from "@tanstack/react-query";
import { useGameStore } from "@/store/gameStore";
import { useEffect } from "react";
import { getAuthHeaders } from "./useSimpleSiwe";
import { useAccount } from "wagmi";

interface BalanceData {
  balance: string; // in wei (blockchain balance)
  balanceInEth: number;
  balanceInUsd: number;
  availableBalance: string; // in wei (available = blockchain - locked)
  availableBalanceInEth: number;
  availableBalanceInUsd: number;
  lockedBalance: string; // in wei
  lockedBalanceInEth: number;
  lockedBalanceInUsd: number;
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
          credentials: 'include', // Required for cookies in cross-origin contexts
          headers: getAuthHeaders(connectedAddress || undefined),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch balance");
        }

        const data = await response.json();

        return {
          balance: data.balance,
          balanceInEth: data.balanceInEth,
          balanceInUsd: data.balanceInUsd || 0,
          availableBalance: data.availableBalance || data.balance,
          availableBalanceInEth: data.availableBalanceInEth || data.balanceInEth,
          availableBalanceInUsd: data.availableBalanceInUsd || data.balanceInUsd || 0,
          lockedBalance: data.lockedBalance || "0",
          lockedBalanceInEth: data.lockedBalanceInEth || 0,
          lockedBalanceInUsd: data.lockedBalanceInUsd || 0,
          address: data.address,
        };
      },
      enabled: queryEnabled, // Only fetch if user is authenticated
      refetchInterval: 3000, // Refetch every 3 seconds to keep available balance updated (locked balance changes after bets)
      refetchOnWindowFocus: true, // Still refetch when user returns to tab
      staleTime: 1000, // Consider data stale after 1 second
      retry: false, // Don't retry failed requests
    });

  // Sync optimistic balance with fetched available balance (not total balance)
  useEffect(() => {
    if (data?.availableBalanceInUsd !== undefined) {
      // Initialize optimistic balance if null
      if (optimisticBalanceUsd === null) {
        setOptimisticBalance(data.availableBalanceInUsd);
      }
      // If there's a significant difference between optimistic and fetched balance,
      // sync them (this handles async blockchain transaction completion)
      else if (Math.abs(optimisticBalanceUsd - data.availableBalanceInUsd) > 0.01) {
        // Only sync if the difference is significant (>$0.01) to avoid unnecessary updates from rounding
        setOptimisticBalance(data.availableBalanceInUsd);
      }
    }
  }, [data?.availableBalanceInUsd, optimisticBalanceUsd, setOptimisticBalance]);

  // Use optimistic balance if available, otherwise use fetched available balance
  // This is what the user can actually bet with
  const displayBalanceUsd = optimisticBalanceUsd ?? data?.availableBalanceInUsd ?? 0;

  return {
    balance: data?.balance || "0",
    balanceInEth: data?.balanceInEth || 0,
    balanceInUsd: data?.balanceInUsd || 0,
    availableBalance: data?.availableBalance || data?.balance || "0",
    availableBalanceInEth: data?.availableBalanceInEth || 0,
    availableBalanceInUsd: displayBalanceUsd,
    lockedBalance: data?.lockedBalance || "0",
    lockedBalanceInEth: data?.lockedBalanceInEth || 0,
    lockedBalanceInUsd: data?.lockedBalanceInUsd || 0,
    address: data?.address || "",
    isLoading,
    isRefetching,
    error: error ? (error as Error).message : null,
    refetch,
    // Expose the actual fetched balances for comparison
    fetchedBalanceUsd: data?.balanceInUsd || 0,
    fetchedAvailableBalanceUsd: data?.availableBalanceInUsd || 0,
  };
}
