"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Clock, TrendingUp, ArrowUpRight, ArrowDownLeft, Dices, ShieldCheck } from "lucide-react";
import { useUserBets } from "@/hooks/usePonderBets";
import { formatETH } from "@/lib/utils/format";
import { formatDistanceToNow } from "date-fns";
import { useEthPrice } from "@/hooks/useEthPrice";
import { ProvablyFairVerification } from "@/components/game/ProvablyFairVerification";

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
  const [activeTab, setActiveTab] = useState<'bets' | 'transactions'>('bets');
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [verifyingBetId, setVerifyingBetId] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  // Fetch wallet transactions
  const fetchTransactions = async () => {
    if (!userId) return;

    setIsLoadingTransactions(true);
    try {
      const response = await fetch(`/api/wallet/transactions?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Refetch data when drawer opens
  useEffect(() => {
    if (isOpen && userAddress) {
      refresh();
    }
    if (isOpen && userId) {
      fetchTransactions();
    }
  }, [isOpen, userAddress, userId, refresh]);

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
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-black">
                    Activity
                  </span>

                  {hasNewActivity && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('bets')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'bets'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Dices className="w-4 h-4" />
                    Bets
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'transactions'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
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
              {activeTab === 'bets' ? (
                isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : (
                  <div className="p-4 space-y-6">
                  {/* Stats Overview */}
                  {stats && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-black">
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
                          <div className="text-xs text-gray-600">Win Rate</div>
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
                          <div className="text-xs text-gray-600">Total Won</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Bets Table */}
                  <div>
                    {bets.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No bets yet</p>
                        <p className="text-xs">
                          Start playing to see your activity here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bets.map((bet) => (
                          <motion.div
                            key={bet.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Dices className={`w-4 h-4 ${bet.win ? "text-green-600" : "text-gray-600"}`} />
                                <span className="text-sm font-semibold text-black">
                                  {formatUSD(BigInt(bet.betAmount))}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    bet.win
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {bet.win ? 'WIN' : 'LOSS'}
                                </span>
                                <button
                                  onClick={() => {
                                    setVerifyingBetId(bet.id);
                                    setShowVerification(true);
                                  }}
                                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Verify bet"
                                >
                                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                                </button>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex justify-between">
                                <span>Bet ID:</span>
                                <span className="font-mono text-black text-[10px]">
                                  {bet.id.slice(0, 8)}...{bet.id.slice(-6)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Time:</span>
                                <span className="font-medium text-black">
                                  {formatDistanceToNow(
                                    new Date(bet.placedAt * 1000),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Payout:</span>
                                <span className={`font-medium ${bet.win ? "text-green-600" : "text-gray-600"}`}>
                                  {bet.win && bet.payout
                                    ? formatUSD(BigInt(bet.payout))
                                    : "$0.00"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Multiplier:</span>
                                <span className={`font-medium ${bet.win ? "text-green-600" : "text-gray-600"}`}>
                                  {bet.win
                                    ? `${(Number(bet.targetMultiplier) / 100).toFixed(2)}x`
                                    : `${(Number(bet.limboMultiplier || 0) / 100).toFixed(2)}x`}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
              ) : (
                /* Transactions Tab */
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
                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {tx.txType === 'bet' ? (
                              <Dices className="w-4 h-4 text-purple-600" />
                            ) : tx.txType === 'withdraw' ? (
                              <ArrowUpRight className="w-4 h-4 text-red-600" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4 text-green-600" />
                            )}
                            <span className="text-sm font-semibold text-black capitalize">
                              {tx.txType}
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              tx.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : tx.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span className="font-medium text-black">
                              {formatETH(BigInt(tx.amount))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time:</span>
                            <span className="font-medium text-black">
                              {formatDistanceToNow(new Date(tx.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tx Hash:</span>
                            <a
                              href={`https://sepolia.basescan.org/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-blue-600 hover:underline truncate max-w-[120px]"
                            >
                              {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
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
