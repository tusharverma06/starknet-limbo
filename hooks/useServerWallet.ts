import { useState, useCallback, useEffect } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

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
 * Hook for managing server-side custodial wallets
 * @param address - Currently connected wallet address
 */
export function useServerWallet(address: string | null): UseServerWalletReturn {
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
   * Fetch custodial wallet info for connected wallet address
   */
  const fetchWallet = useCallback(async () => {
    if (!address) {
      setIsInitialLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/wallet/create?wallet_address=${address}`, {
        credentials: 'include',
      });

      if (response.status === 404) {
        setWallet(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch wallet");
      }

      const data = await response.json();
      setWallet({
        address: data.custodial_address || data.address,
        createdAt: data.createdAt,
        balance: data.balance || "0",
        lastUsed: data.lastUsed,
      });
      setBalance(data.balance || "0");
    } catch (err) {
      console.error("Error fetching wallet:", err);
    } finally {
      setIsInitialLoading(false);
    }
  }, [address]);

  /**
   * Create wallet is no longer needed - wallets are created automatically when connecting
   * This is kept for backward compatibility but does nothing
   */
  const createWallet = useCallback(async () => {
    console.log("⚠️ createWallet() is deprecated - wallets are created automatically");
    await fetchWallet();
  }, [fetchWallet]);

  /**
   * Refresh wallet balance
   */
  const refreshBalance = useCallback(async (isBackgroundRefresh = false) => {
    if (!address) return;

    if (isBackgroundRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/wallet/balance?address=${address}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      const data = await response.json();
      setBalance(data.balance);
      setBalanceInUsd(data.balanceInUsd || null);

      if (wallet) {
        setWallet({ ...wallet, balance: data.balance });
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
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
  }, [address, wallet]);

  /**
   * Withdraw funds from custodial wallet to any address
   */
  const withdraw = useCallback(
    async (toAddress: string, usdAmount: string) => {
      if (!address) {
        throw new Error("Address is required");
      }

      setIsWithdrawing(true);
      setError(null);

      try {
        console.log(`💸 Initiating withdrawal: $${usdAmount} to ${toAddress}`);

        const response = await fetch("/api/wallet/withdraw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, toAddress, usdAmount }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Withdrawal failed");
        }

        console.log("✅ Withdrawal successful:", data.txHash);

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
    [address, wallet]
  );

  /**
   * Place a bet using server wallet
   */
  const placeBet = useCallback(
    async (usdBetAmount: string, targetMultiplier: number) => {
      if (!address) {
        throw new Error("Address is required");
      }

      if (!wallet) {
        throw new Error("Wallet not found. Please create a wallet first.");
      }

      setIsPlacingBet(true);
      setError(null);

      try {
        const response = await fetch("/api/wallet/place-bet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, usdBetAmount, targetMultiplier }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Bet placement failed");
        }

        const newBalance = data.balance?.current || data.newBalance;
        if (newBalance) {
          setBalance(newBalance);
          if (wallet) {
            setWallet({ ...wallet, balance: newBalance });
          }
        }

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
    [address, wallet]
  );

  // Fetch wallet on mount
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Auto-refresh balance every 30 seconds if wallet exists
  useEffect(() => {
    if (!wallet) return;

    const interval = setInterval(() => {
      refreshBalance(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [wallet, refreshBalance]);

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
