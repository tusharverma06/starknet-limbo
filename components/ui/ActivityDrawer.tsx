"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useUserBets } from "@/hooks/usePonderBets";
import { formatETH } from "@/lib/utils/format";
import { formatDistanceToNow } from "date-fns";
import { useEthPrice } from "@/hooks/useEthPrice";

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string | null;
}

export function ActivityDrawer({
  isOpen,
  onClose,
  userAddress,
}: ActivityDrawerProps) {
  const { bets, stats, isLoading, refresh } = useUserBets(userAddress);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const { ethPrice } = useEthPrice();

  // Refetch data when drawer opens
  useEffect(() => {
    if (isOpen && userAddress) {
      refresh();
    }
  }, [isOpen, userAddress, refresh]);

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
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-black">
                  Recent Bets
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
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
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 font-semibold text-black">
                                Bet
                              </th>
                              <th className="text-left py-2 font-semibold text-black">
                                Time
                              </th>
                              <th className="text-left py-2 font-semibold text-black">
                                Payout
                              </th>
                              <th className="text-left py-2 font-semibold text-black">
                                Multiplier
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {bets.map((bet) => (
                              <motion.tr
                                key={bet.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border-b border-gray-100"
                              >
                                <td className="py-3 text-black">
                                  {formatUSD(BigInt(bet.betAmount))}
                                </td>
                                <td className="py-3 text-gray-600">
                                  {formatDistanceToNow(
                                    new Date(bet.placedAt * 1000),
                                    {
                                      addSuffix: false,
                                    }
                                  )}
                                </td>
                                <td
                                  className={`py-3 font-medium ${
                                    bet.win ? "text-green-600" : "text-gray-600"
                                  }`}
                                >
                                  {bet.win && bet.payout
                                    ? formatUSD(BigInt(bet.payout))
                                    : "$0.00"}
                                </td>
                                <td
                                  className={`py-3 font-medium ${
                                    bet.win ? "text-green-600" : "text-gray-600"
                                  }`}
                                >
                                  {bet.win
                                    ? `${(
                                        Number(bet.targetMultiplier) / 100
                                      ).toFixed(2)}x`
                                    : "0.00x"}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
