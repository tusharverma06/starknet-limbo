"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Activity,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Dices,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useUserBets } from "@/hooks/usePonderBets";
import { formatETH } from "@/lib/utils/format";
import { formatDistanceToNow } from "date-fns";
import { useEthPrice } from "@/hooks/useEthPrice";
import { ProvablyFairVerification } from "@/components/game/ProvablyFairVerification";
import { useQuery } from "@tanstack/react-query";

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string | null;
  userId?: string | null;
}

interface WalletTransaction {
  id: number;
  txHash: string;
  txType: string;
  amount: string;
  status: string;
  blockNumber?: string;
  gasUsed?: string;
  createdAt: string;
  confirmedAt?: string;
}

export function ActivityDrawer({
  isOpen,
  onClose,
  userAddress,
  userId,
}: ActivityDrawerProps) {
  const { bets, stats, isLoading, refresh } = useUserBets(userAddress);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const { ethPrice } = useEthPrice();
  const [activeTab, setActiveTab] = useState<"bets" | "transactions">("bets");
  const [betSubTab, setBetSubTab] = useState<"active" | "resolved">("active");
  const [verifyingBetId, setVerifyingBetId] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  // Fetch off-chain bets using React Query
  const {
    data: offchainBetsData,
    isLoading: isLoadingBets,
    refetch: refetchBets,
  } = useQuery({
    queryKey: ["betHistory", userAddress],
    queryFn: async () => {
      if (!userAddress) {
        console.log("⚠️ No userAddress (custodial wallet) provided");
        return { bets: [], count: 0 };
      }

      console.log(
        "📥 Fetching bets for custodial address (playerId):",
        userAddress
      );
      const response = await fetch(
        `/api/wallet/bet-history?playerId=${userAddress}`
      );
      console.log("📥 Bet history response status:", response.status);

      if (!response.ok) {
        console.error("❌ Bet history request failed:", response.status);
        throw new Error("Failed to fetch bet history");
      }

      const data = await response.json();
      console.log("📥 Bet history data:", data);
      console.log("📥 Number of bets:", data.bets?.length || 0);
      return data;
    },
    enabled: !!userAddress && isOpen, // Only fetch when drawer is open and we have an address
    refetchOnWindowFocus: false,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  const offchainBets = offchainBetsData?.bets || [];

  // Fetch wallet transactions using React Query
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["walletTransactions", userId],
    queryFn: async () => {
      if (!userId) {
        return { transactions: [] };
      }

      const response = await fetch(`/api/wallet/transactions?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      return data;
    },
    enabled: !!userId && isOpen, // Only fetch when drawer is open and we have userId
    refetchOnWindowFocus: false,
    staleTime: 10000,
  });

  const transactions = transactionsData?.transactions || [];

  // Refetch data when drawer opens
  useEffect(() => {
    console.log("🔄 Activity Drawer state changed:", {
      isOpen,
      userAddress,
      userId,
    });
    if (isOpen) {
      // Refetch on-chain bets
      if (userAddress) {
        refresh();
      }
      // React Query will automatically refetch based on enabled flag
      // But we can manually trigger refetch for fresh data when drawer opens
      refetchBets();
      refetchTransactions();
    }
  }, [isOpen, userAddress, userId, refresh, refetchBets, refetchTransactions]);

  // Check for new activity (bets in last 5 minutes)
  useEffect(() => {
    if (bets.length > 0) {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const recentBets = bets.filter(
        (bet) => bet.placedAt * 1000 > fiveMinutesAgo
      );
      setHasNewActivity(recentBets.length > 0);
    }
  }, [bets]);

  // Poll for bet updates if there are pending bets
  useEffect(() => {
    const pendingCount = offchainBets.filter(
      (b) => b.status === "pending"
    ).length;

    if (pendingCount === 0 || !isOpen) return;

    const interval = setInterval(() => {
      refetchBets(); // Use React Query refetch
    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [offchainBets, isOpen, refetchBets]);

  // Helper function to format USD values from bigint
  const formatUSD = (weiAmount: bigint) => {
    if (!ethPrice) return "$0.00";
    // Convert wei to ETH (divide by 10^18)
    const ethValue = Number(weiAmount) / 1e18;
    const usdValue = ethValue * ethPrice;
    return `$${usdValue.toFixed(2)}`;
  };

  if (!userAddress) {
    return null;
  }

  const winRate = stats ? (stats.winCount / stats.totalBets) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#cfd9ff] shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b-2 border-black bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-black" />
                  <span
                    className="text-sm font-semibold text-black"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Activity
                  </span>

                  {hasNewActivity && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-black"
                >
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("bets")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors border-2 border-black ${
                    activeTab === "bets"
                      ? "bg-[#2574ff] text-white shadow-[0px_2px_0px_0px_#000000]"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Dices className="w-4 h-4" />
                    Bets
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors border-2 border-black ${
                    activeTab === "transactions"
                      ? "bg-[#2574ff] text-white shadow-[0px_2px_0px_0px_#000000]"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowUpRight className="w-4 h-4" />
                    Transactions
                  </div>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "bets" ? (
                isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : (
                  <div className="p-4 space-y-6">
                    {/* Stats Overview */}
                    {stats && (
                      <div className="bg-white border-2 border-black rounded-lg p-4 space-y-4 shadow-[0px_2px_0px_0px_#000000]">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span
                            className="text-sm font-semibold text-black"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            Your Stats
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-black">
                              {stats.totalBets}
                            </div>
                            <div className="text-xs text-gray-600">
                              Total Bets
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-black">
                              {winRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-600">
                              Win Rate
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-black">
                              {formatETH(BigInt(stats.totalWagered))}
                            </div>
                            <div className="text-xs text-gray-600">
                              Total Wagered
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-black">
                              {formatETH(BigInt(stats.totalWon))}
                            </div>
                            <div className="text-xs text-gray-600">
                              Total Won
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bet Sub-Tabs */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBetSubTab("active")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors border-2 border-black ${
                          betSubTab === "active"
                            ? "bg-yellow-400 text-black shadow-[0px_2px_0px_0px_#000000]"
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                        style={{ fontFamily: "var(--font-lilita-one)" }}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Active
                          {offchainBets.filter((b) => b.status === "pending")
                            .length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-black text-white rounded-full text-[10px]">
                              {
                                offchainBets.filter(
                                  (b) => b.status === "pending"
                                ).length
                              }
                            </span>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => setBetSubTab("resolved")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors border-2 border-black ${
                          betSubTab === "resolved"
                            ? "bg-green-400 text-black shadow-[0px_2px_0px_0px_#000000]"
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                        style={{ fontFamily: "var(--font-lilita-one)" }}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <ShieldCheck className="w-3 h-3" />
                          Resolved
                        </div>
                      </button>
                    </div>

                    {/* Bets List */}
                    <div>
                      {isLoadingBets ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="text-gray-500">Loading bets...</div>
                        </div>
                      ) : (
                        (() => {
                          const filteredBets = offchainBets.filter((b) =>
                            betSubTab === "active"
                              ? b.status === "pending" ||
                                b.status === "pending_payout"
                              : b.status === "resolved" ||
                                b.status === "complete" ||
                                b.status === "processing" ||
                                b.status === "paid_out"
                          );

                          console.log("🔍 Total bets:", offchainBets.length);
                          console.log("🔍 Active tab:", betSubTab);
                          console.log("🔍 Filtered bets:", filteredBets.length);
                          console.log(
                            "🔍 All bet statuses:",
                            offchainBets.map((b) => ({
                              id: b.id,
                              status: b.status,
                              outcome: b.outcome,
                            }))
                          );

                          return filteredBets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                {betSubTab === "active"
                                  ? "No active bets"
                                  : "No resolved bets yet"}
                              </p>
                              <p className="text-xs">
                                {betSubTab === "active"
                                  ? "Place a bet to see it here while processing"
                                  : "Start playing to see your bet history"}
                              </p>
                              {offchainBets.length > 0 && (
                                <p className="text-xs mt-2 text-gray-400">
                                  Debug: {offchainBets.length} total bets loaded
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {filteredBets.map((bet) => (
                                <motion.div
                                  key={bet.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`border-2 border-black rounded-lg p-3 hover:bg-gray-50 transition-colors shadow-[0px_2px_0px_0px_#000000] ${
                                    bet.status === "pending" ||
                                    bet.status === "processing"
                                      ? "bg-blue-50"
                                      : "bg-white"
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {bet.status === "pending" ||
                                      bet.status === "processing" ? (
                                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                      ) : (
                                        <Dices
                                          className={`w-4 h-4 ${
                                            bet.outcome === "win"
                                              ? "text-green-600"
                                              : "text-gray-600"
                                          }`}
                                        />
                                      )}
                                      <span className="text-sm font-semibold text-black">
                                        {formatUSD(BigInt(bet.wager))}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {bet.status === "pending" ? (
                                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                          PENDING
                                        </span>
                                      ) : bet.status === "processing" ? (
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                          CONFIRMING
                                        </span>
                                      ) : (
                                        <span
                                          className={`text-xs px-2 py-1 rounded-full ${
                                            bet.outcome === "win"
                                              ? "bg-green-100 text-green-700"
                                              : "bg-gray-100 text-gray-700"
                                          }`}
                                        >
                                          {bet.outcome === "win"
                                            ? "WIN"
                                            : "LOSS"}
                                        </span>
                                      )}
                                      <a
                                        href={`/verify?betId=${bet.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors inline-flex"
                                        title="Verify bet (opens in new tab)"
                                      >
                                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                                      </a>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div className="flex justify-between">
                                      <span>Bet ID:</span>
                                      <span className="font-mono text-black text-[10px]">
                                        {bet.id.slice(0, 8)}...
                                        {bet.id.slice(-6)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Time:</span>
                                      <span className="font-medium text-black">
                                        {formatDistanceToNow(
                                          new Date(bet.createdAt),
                                          {
                                            addSuffix: true,
                                          }
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Payout:</span>
                                      <span
                                        className={`font-medium ${
                                          bet.outcome === "win"
                                            ? "text-green-600"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {bet.outcome === "win" && bet.payout
                                          ? formatUSD(BigInt(bet.payout))
                                          : "$0.00"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Multiplier:</span>
                                      <span
                                        className={`font-medium ${
                                          bet.outcome === "win"
                                            ? "text-green-600"
                                            : bet.limboMultiplier
                                            ? "text-gray-600"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {bet.outcome === "win"
                                          ? `${(
                                              Number(bet.targetMultiplier) / 100
                                            ).toFixed(2)}x`
                                          : bet.limboMultiplier
                                          ? `${(
                                              Number(bet.limboMultiplier) / 100
                                            ).toFixed(2)}x`
                                          : "—"}
                                      </span>
                                    </div>
                                    {bet.status === "pending" && (
                                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-yellow-200">
                                        <Clock className="w-3 h-3 text-yellow-600" />
                                        <span className="text-[10px] text-yellow-700 font-medium">
                                          Processing bet result...
                                        </span>
                                      </div>
                                    )}
                                    {bet.txHash &&
                                      bet.txHash.startsWith("0x") && (
                                        <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-gray-500">
                                              {bet.outcome === "win"
                                                ? "Payout Tx:"
                                                : "Bet Tx:"}
                                            </span>
                                            <a
                                              href={`https://sepolia.basescan.org/tx/${bet.txHash}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="font-mono text-blue-600 hover:underline text-[10px] flex items-center gap-1"
                                            >
                                              {bet.txHash.slice(0, 6)}...
                                              {bet.txHash.slice(-4)}
                                              <ArrowUpRight className="w-2.5 h-2.5" />
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                )
              ) : /* Transactions Tab */
              isLoadingTransactions ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-500">Loading...</div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 px-4">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No transactions yet</p>
                  <p className="text-xs">
                    Start playing to see your transaction history here
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="border-2 border-black rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors shadow-[0px_2px_0px_0px_#000000]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {tx.txType === "bet_placed" ? (
                            <ArrowUpRight className="w-4 h-4 text-blue-600" />
                          ) : tx.txType === "bet_won" ? (
                            <div className="flex items-center gap-1">
                              <Dices className="w-4 h-4 text-green-600" />
                              <TrendingUp className="w-3 h-3 text-green-600" />
                            </div>
                          ) : tx.txType === "bet_lost" ? (
                            <Dices className="w-4 h-4 text-red-600" />
                          ) : tx.txType === "payout" ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          ) : tx.txType === "withdraw" ? (
                            <ArrowUpRight className="w-4 h-4 text-orange-600" />
                          ) : tx.txType === "deposit" ? (
                            <ArrowDownLeft className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Activity className="w-4 h-4 text-gray-600" />
                          )}
                          <span className="text-sm font-semibold text-black">
                            {tx.txType === "bet_placed"
                              ? "Bet Placed"
                              : tx.txType === "bet_won"
                              ? "Bet Won"
                              : tx.txType === "bet_lost"
                              ? "Bet Lost"
                              : tx.txType === "payout"
                              ? "Payout Received"
                              : tx.txType === "deposit"
                              ? "Deposit"
                              : tx.txType === "withdraw"
                              ? "Withdrawal"
                              : tx.txType.charAt(0).toUpperCase() +
                                tx.txType.slice(1)}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            tx.txHash.startsWith("0x") ||
                            tx.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : tx.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {tx.txHash.startsWith("0x") ? "success" : tx.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <div className="text-right">
                            <span className="font-medium text-black block">
                              {formatETH(BigInt(tx.amount))}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatUSD(BigInt(tx.amount))}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span className="font-medium text-black">
                            {formatDistanceToNow(new Date(tx.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Tx Hash:</span>
                          {tx.txHash.startsWith("0x") ? (
                            <a
                              href={`https://sepolia.basescan.org/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-blue-600 hover:underline text-[10px] flex items-center gap-1"
                              title={tx.txHash}
                            >
                              {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="font-mono text-gray-600 truncate max-w-[120px] text-[10px]">
                              {tx.txHash}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Verification Modal */}
          <AnimatePresence>
            {showVerification && verifyingBetId && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 z-[60]"
                  onClick={() => {
                    setShowVerification(false);
                    setVerifyingBetId(null);
                  }}
                />

                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 sm:inset-4 md:inset-8 lg:inset-16 bg-white rounded-none sm:rounded-lg shadow-2xl z-[70] flex flex-col overflow-hidden max-w-5xl mx-auto"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <h3 className="text-base sm:text-lg font-semibold text-black">
                        Provably Fair Verification
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowVerification(false);
                        setVerifyingBetId(null);
                      }}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto">
                    <ProvablyFairVerification
                      initialRequestId={verifyingBetId}
                      onClose={() => {
                        setShowVerification(false);
                        setVerifyingBetId(null);
                      }}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
