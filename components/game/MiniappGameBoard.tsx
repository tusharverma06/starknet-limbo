"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Navbar } from "@/components/ui/Navbar";
import { ActivityDrawer } from "@/components/ui/ActivityDrawer";
import { MultiplierSelector } from "./MultiplierSelector";
import { GameResult } from "./GameResult";
import { ServerWallet } from "./ServerWallet";
import { useServerWallet } from "@/hooks/useServerWallet";
import { useBetResultPoller } from "@/hooks/useBetResultPoller";
import { useBetResultWatcher } from "@/hooks/useBetResultWatcher";
import { useGameState } from "@/hooks/useGameState";
import { useFarcaster } from "@/hooks/useFarcaster";
import { Dice6, Loader2 } from "lucide-react";
import { MIN_BET_USD, MAX_BET_USD } from "@/lib/constants";
import Image from "next/image";

export function MiniappGameBoard() {
  const { user } = useFarcaster();
  const userId = user?.fid?.toString() || null;

  const {
    wallet,
    balanceInEth,
    balanceInUsd,
    isLoading: isWalletLoading,
    isInitialLoading,
    placeBet: placeBetWithServerWallet,
    withdraw: withdrawFromServerWallet,
  } = useServerWallet(userId);

  const { latestBet, isPolling, startPolling, stopPolling, clearLatestBet } =
    useBetResultPoller(wallet?.address);

  // Use the new bet result watcher for instant results
  const {
    result: watchedBetResult,
    isWaiting: isWaitingForResult,
    watchForResult,
  } = useBetResultWatcher();

  const {
    betAmount,
    targetMultiplier,
    setBetAmount,
    setTargetMultiplier,
    lastWin,
    setLastResult,
    reset: resetGameState,
  } = useGameState();

  const [showResult, setShowResult] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState("");
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [potentialPayoutUsd, setPotentialPayoutUsd] = useState<number | null>(
    null
  );

  // Handle bet resolution
  useEffect(() => {
    if (latestBet) {
      console.log("🎉 RESULT FOUND!", latestBet);
      stopPolling();
      setLastResult(latestBet.win, latestBet.payout);
      setShowResult(true);
    }
  }, [latestBet, setLastResult, stopPolling]);

  // Calculate potential payout in USD
  useEffect(() => {
    const calculatePotentialPayoutUsd = async () => {
      if (betAmount && targetMultiplier) {
        const betAmountUsd = parseFloat(betAmount);
        if (!isNaN(betAmountUsd) && betAmountUsd > 0) {
          // Simply multiply the USD bet amount by the target multiplier
          const payoutUsd = betAmountUsd * targetMultiplier;
          setPotentialPayoutUsd(payoutUsd);
        } else {
          setPotentialPayoutUsd(null);
        }
      } else {
        setPotentialPayoutUsd(null);
      }
    };

    calculatePotentialPayoutUsd();
  }, [betAmount, targetMultiplier]);

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBetAmount(val);

    const num = parseFloat(val);
    if (isNaN(num)) {
      setAmountError("Invalid amount");
      return;
    }

    if (num < MIN_BET_USD) {
      setAmountError(`Minimum bet is $${MIN_BET_USD}`);
      return;
    }

    if (num > MAX_BET_USD) {
      setAmountError(`Maximum bet is $${MAX_BET_USD}`);
      return;
    }

    if (balanceInUsd && num > balanceInUsd) {
      setAmountError("Insufficient balance");
      return;
    }

    setAmountError("");
  };

  const handleQuickAmount = (multiplier: number) => {
    const current = parseFloat(betAmount) || MIN_BET_USD;
    let newAmount: number;

    if (multiplier === 0.5) {
      newAmount = current / 2;
    } else if (multiplier === 2) {
      newAmount = current * 2;
    } else if (multiplier === -1) {
      // Max
      if (balanceInUsd) {
        newAmount = Math.min(balanceInUsd, MAX_BET_USD);
      } else {
        newAmount = MAX_BET_USD;
      }
    } else {
      newAmount = current;
    }

    // Ensure within bounds
    newAmount = Math.max(MIN_BET_USD, Math.min(newAmount, MAX_BET_USD));
    setBetAmount(newAmount.toString());
    setAmountError("");
  };

  const handlePlaceBet = async () => {
    if (!wallet || !userId) {
      console.warn("⚠️ No wallet found");
      return;
    }

    if (amountError) {
      return;
    }

    console.log("🎲 Starting bet placement with server wallet...");
    setIsPlacingBet(true);
    setBetError(null);

    try {
      const result = await placeBetWithServerWallet(
        betAmount,
        targetMultiplier
      );
      console.log("✅ Bet transaction initiated:", result.txHash);
      console.log("📝 Request ID:", result.requestId);

      // Watch for this specific bet result
      if (result.requestId) {
        console.log("👀 Starting to watch for bet result...");
        watchForResult(result.requestId);
      } else {
        // Fallback to polling if no requestId
        startPolling();
      }
    } catch (error) {
      console.error("❌ Place bet error:", error);
      setBetError(
        error instanceof Error ? error.message : "Failed to place bet"
      );
      setIsPlacingBet(false);
    }
    // Don't set isPlacingBet to false here - keep it true until result comes
  };

  const handleResultClose = () => {
    setShowResult(false);
    clearLatestBet();
    resetGameState();
    setIsPlacingBet(false);
  };

  // Handle watched bet result (instant result from event watching)
  useEffect(() => {
    if (watchedBetResult) {
      console.log("🎉 Bet result received from watcher!", watchedBetResult);

      // Convert to expected format
      const win = watchedBetResult.win;
      const payout = watchedBetResult.payout;
      const multiplier = Number(watchedBetResult.limboMultiplier) / 100;

      setLastResult(win, payout);
      setShowResult(true);
      setIsPlacingBet(false);

      console.log("🎲 Result:", {
        win,
        payout,
        multiplier,
        targetMultiplier,
      });
    }
  }, [watchedBetResult, setLastResult, targetMultiplier]);

  const handleWithdraw = async (amount: string, toAddress: string) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const result = await withdrawFromServerWallet(toAddress, amount);
      console.log("✅ Withdrawal successful:", result.txHash);
    } catch (error) {
      console.error("❌ Withdrawal failed:", error);
      throw error;
    }
  };

  const isDisabled =
    isPlacingBet ||
    isWaitingForResult ||
    isPolling ||
    !wallet ||
    isWalletLoading;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar
          walletAddress={wallet?.address}
          onActivityClick={() => setIsActivityDrawerOpen(true)}
          walletBalance={balanceInEth || "0"}
          userId={userId}
          onWithdraw={handleWithdraw}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 border-b border-gray-200"
        >
          <h1 className="text-2xl font-bold text-black mb-2 flex items-center justify-center gap-2">
            <Dice6 className="w-6 h-6 text-black" />
            LIMBO
          </h1>
        </motion.div>

        {/* Server Wallet Component - Show if no wallet exists or initial loading */}
        {(!wallet || isInitialLoading) && (
          <div className="p-4">
            <ServerWallet userId={userId} />
          </div>
        )}

        {/* Main Game Content */}
        <div className="flex-1 p-4 space-y-6">
          {/* Game Controls */}
          {wallet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Bet Amount Input */}
              <div>
                <div className="w-full flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-black ">
                    Bet Amount
                  </label>

                  <div className="text-center">
                    {/* <span className="text-sm text-gray-600">Balance: </span> */}
                    <span className="text-sm font-semibold text-black">
                      {balanceInUsd ? `$${balanceInUsd.toFixed(2)}` : "$0.00"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="relative flex items-center gap-0.5 justify-between h-10 min-h-10 bg-gray-50 border border-gray-300 rounded-xl pr-2 pl-4 py-0">
                    <span className="text-sm text-black/80 font-normal">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min={MIN_BET_USD}
                      max={MAX_BET_USD}
                      value={betAmount}
                      onChange={handleBetAmountChange}
                      disabled={isDisabled}
                      className="text-sm p-0 font-medium border-none bg-transparent focus:ring-0 focus:outline-none"
                      placeholder=""
                    />
                    <Image
                      src="/ethereum.webp"
                      alt="ETH"
                      width={20}
                      height={20}
                    />

                    {[
                      { label: "/2", multiplier: 0.5 },
                      { label: "2x", multiplier: 2 },
                      { label: "Max", multiplier: -1 },
                    ].map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleQuickAmount(item.multiplier)}
                        disabled={isDisabled}
                        className="text-xs text-black/80 min-w-[30px] min-h-[30px] flex items-center px-1.5 py-0.5 justify-center bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multiplier Selector */}
              <div>
                <MultiplierSelector
                  value={targetMultiplier}
                  onChange={setTargetMultiplier}
                  disabled={isDisabled}
                />
              </div>

              <Button
                size="lg"
                onClick={handlePlaceBet}
                disabled={
                  isDisabled ||
                  !!amountError ||
                  parseFloat(betAmount || "0") === 0
                }
                isLoading={isPlacingBet || isWaitingForResult}
                className="w-full text-sm h-10 mb-2 font-medium"
              >
                {isPolling ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Getting Result...
                  </>
                ) : isWaitingForResult ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Waiting for VRF...
                  </>
                ) : isPlacingBet ? (
                  "Placing Bet..."
                ) : (
                  " Place Bet"
                )}
              </Button>
              <div className="w-full border-t border-gray-200 pt-2 flex items-center justify-between ">
                <span className="text-sm text-gray-500 font-medium">
                  Potential Payout:{" "}
                </span>
                <span className="text-sm font-semibold text-black">
                  {potentialPayoutUsd
                    ? `$${potentialPayoutUsd.toFixed(2)}`
                    : "$0.00"}
                </span>
              </div>

              {betError && (
                <div className="text-sm text-red-600 text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  {betError}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Game Result Modal */}
      <AnimatePresence>
        {showResult && lastWin !== null && latestBet && (
          <GameResult
            win={latestBet.win}
            amount={latestBet.amount}
            targetMultiplier={latestBet.targetMultiplier}
            randomResult={latestBet.limboMultiplier}
            payout={latestBet.payout}
            onClose={handleResultClose}
          />
        )}
      </AnimatePresence>

      {/* Activity Drawer */}
      <ActivityDrawer
        isOpen={isActivityDrawerOpen}
        onClose={() => setIsActivityDrawerOpen(false)}
        userAddress={wallet?.address || null}
      />
    </div>
  );
}
