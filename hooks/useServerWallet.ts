import { useState, useCallback, useEffect } from "react";
import { formatEther } from "viem";
import { getAuthHeaders } from "./useSimpleSiwe";
import { useAccount, useSignMessage } from "wagmi";

interface WalletInfo {
  address: string;
  createdAt: number;
  balance: string;
  lastUsed?: number;
}

interface UseServerWalletReturn {
  wallet: WalletInfo | null;
  balance: string | null;
  balanceInEth: string | null;
  balanceInUsd: number | null;
  isLoading: boolean;
  isInitialLoading: boolean;
  isWithdrawing: boolean;
  isPlacingBet: boolean;
  error: string | null;
  createWallet: () => Promise<void>;
  refreshBalance: (isBackgroundRefresh?: boolean) => Promise<void>;
  withdraw: (
    toAddress: string,
    usdAmount: string
  ) => Promise<{ txHash: string }>;
  placeBet: (
    usdBetAmount: string,
    targetMultiplier: number
  ) => Promise<{
    txHash?: string;
    requestId?: string | null;
    betId?: string;
    result?: {
      win: boolean;
      limboMultiplier: number;
      payout: string;
      gameNumber: string;
      amount: string;
      targetMultiplier: number;
    };
  }>;
}

/**
 * Hook for managing server-side wallets
 * @param userId - User identifier (e.g., Farcaster FID)
 * @param isAuthenticated - Whether user is authenticated (triggers wallet fetch)
 */
export function useServerWallet(userId: string | null, isAuthenticated?: boolean): UseServerWalletReturn {
  const { address: connectedAddress } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceInUsd, setBalanceInUsd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch wallet info from server
   */
  const fetchWallet = useCallback(async () => {
    if (!userId) {
      setIsInitialLoading(false);
      return;
    }

    try {
      // GET endpoint uses session auth, no userId param needed
      const response = await fetch(`/api/wallet/create`, {
        credentials: 'include', // Required for cookies in cross-origin contexts
      });

      if (response.status === 404) {
        setWallet(null);
        return;
      }

      if (response.status === 401) {
        console.log("⚠️ Not authenticated - wallet fetch requires sign in");
        setWallet(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch wallet");
      }

      const data = await response.json();
      setWallet(data);
      setBalance(data.balance);
    } catch (err) {
      console.error("Error fetching wallet:", err);
      // Don't set error for 404 - wallet just doesn't exist yet
    } finally {
      setIsInitialLoading(false);
    }
  }, [userId]);

  /**
   * Create a new wallet
   */
  const createWallet = useCallback(async () => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/wallet/create", {
        method: "POST",
        credentials: 'include', // Required for cookies in cross-origin contexts
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create wallet");
      }

      await fetchWallet();
    } catch (err) {
      console.error("Error creating wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to create wallet");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchWallet]);

  /**
   * Refresh wallet balance
   */
  const refreshBalance = useCallback(async (isBackgroundRefresh = false) => {
    if (!userId) return;

    // Use isRefreshing for background auto-refresh, isLoading for manual refresh
    if (isBackgroundRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Balance endpoint uses session auth, no userId param needed
      const response = await fetch(`/api/wallet/balance`, {
        credentials: 'include', // Required for cookies in cross-origin contexts
      });

      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      const data = await response.json();
      setBalance(data.balance);
      setBalanceInUsd(data.balanceInUsd || null);

      // Update wallet info too
      if (wallet) {
        setWallet({ ...wallet, balance: data.balance });
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      // Don't show error for background refresh
      if (!isBackgroundRefresh) {
        setError(err instanceof Error ? err.message : "Failed to fetch balance");
      }
    } finally {
      if (isBackgroundRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [userId, wallet]);

  /**
   * Withdraw funds from custodial wallet to any address
   * Requires JWT authentication (session cookie)
   */
  const withdraw = useCallback(
    async (toAddress: string, usdAmount: string) => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      setIsWithdrawing(true);
      setError(null);

      try {
        console.log(`💸 Initiating withdrawal: $${usdAmount} to ${toAddress}`);

        const response = await fetch("/api/wallet/withdraw", {
          method: "POST",
          credentials: 'include', // Required for cookies in cross-origin contexts
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(connectedAddress || undefined),
          },
          body: JSON.stringify({
            toAddress,
            usdAmount,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Withdrawal failed");
        }

        console.log("✅ Withdrawal successful:", data.txHash);

        // Update balance
        setBalance(data.newBalance);
        if (wallet) {
          setWallet({ ...wallet, balance: data.newBalance });
        }

        return { txHash: data.txHash };
      } catch (err) {
        console.error("Error withdrawing:", err);
        setError(err instanceof Error ? err.message : "Withdrawal failed");
        throw err;
      } finally {
        setIsWithdrawing(false);
      }
    },
    [userId, wallet, connectedAddress]
  );

  /**
   * Place a bet using server wallet
   */
  const placeBet = useCallback(
    async (usdBetAmount: string, targetMultiplier: number) => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      if (!wallet) {
        throw new Error("Wallet not found. Please create a wallet first.");
      }

      setIsPlacingBet(true);
      setError(null);

      try {
        const response = await fetch("/api/wallet/place-bet", {
          method: "POST",
          credentials: 'include', // Required for cookies in cross-origin contexts
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(connectedAddress || undefined),
          },
          body: JSON.stringify({ usdBetAmount, targetMultiplier }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Bet placement failed");
        }

        // Update balance (handle both old and new response formats)
        const newBalance = data.balance?.current || data.newBalance;
        if (newBalance) {
          setBalance(newBalance);
          if (wallet) {
            setWallet({ ...wallet, balance: newBalance });
          }
        }

        // Return full data object (supports both on-chain and off-chain responses)
        return {
          txHash: data.txHash,
          requestId: data.requestId,
          betId: data.betId,
          result: data.result,
          blockNumber: data.blockNumber,
        };
      } catch (err) {
        console.error("Error placing bet:", err);
        setError(err instanceof Error ? err.message : "Bet placement failed");
        throw err;
      } finally {
        setIsPlacingBet(false);
      }
    },
    [userId, wallet, connectedAddress]
  );

  // Fetch wallet on mount, when userId changes, or when authentication changes
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet, isAuthenticated]);

  // Auto-refresh balance every 30 seconds if wallet exists
  useEffect(() => {
    if (!wallet) return;

    const interval = setInterval(() => {
      refreshBalance(true); // Pass true for background refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [wallet, refreshBalance]);

  // Convert balance to ETH for display
  const balanceInEth = balance ? formatEther(BigInt(balance)) : null;

  return {
    wallet,
    balance,
    balanceInEth,
    balanceInUsd,
    isLoading,
    isInitialLoading,
    isWithdrawing,
    isPlacingBet,
    error,
    createWallet,
    refreshBalance,
    withdraw,
    placeBet,
  };
}
