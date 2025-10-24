"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ActivityDrawer } from "@/components/ui/ActivityDrawer";
import { FundingModal } from "@/components/ui/FundingModal";
import { WithdrawModal } from "@/components/ui/WithdrawModal";
import { VerificationModal } from "./VerificationModal";
import { useServerWallet } from "@/hooks/useServerWallet";
import { useBetResultPoller } from "@/hooks/useBetResultPoller";
import { useBetResultWatcher } from "@/hooks/useBetResultWatcher";
import { useGameState } from "@/hooks/useGameState";
import { useFarcaster } from "@/hooks/useFarcaster";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { Loader2, Lock, RefreshCw } from "lucide-react";
import { MIN_BET_USD, MAX_BET_USD } from "@/lib/constants";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Combined bet result type used in the game board
 * Matches the GameResult component's expected props
 */
interface BetResultDisplay {
  win: boolean;
  payout: bigint;
  amount: bigint;
  targetMultiplier: number;
  limboMultiplier: bigint;
}

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
    refreshBalance,
  } = useServerWallet(userId);

  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  const handleRefreshBalance = async () => {
    setIsRefreshingBalance(true);
    try {
      await refreshBalance();
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  const {
    isAuthenticated,
    custodialWallet,
    isLoading: isAuthLoading,
    signIn,
    signOut,
  } = useQuickAuth();

  const { latestBet, isPolling, startPolling, stopPolling } =
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
    setLastResult,
  } = useGameState();

  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState("");
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [potentialPayoutUsd, setPotentialPayoutUsd] = useState<number | null>(
    null
  );
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showResultMultiplier, setShowResultMultiplier] = useState(false);
  const [resultMultiplierValue, setResultMultiplierValue] = useState<number>(0);
  const [resultMultiplierColor, setResultMultiplierColor] = useState<
    "green" | "red"
  >("green");
  const [commitmentHash, setCommitmentHash] = useState<string>("");
  const [showCommitmentTooltip, setShowCommitmentTooltip] = useState(false);

  // Generate commitment hash when authenticated and ready to bet
  useEffect(() => {
    if (isAuthenticated && !isPlacingBet) {
      const generateCommitmentHash = () => {
        const chars = "0123456789abcdef";
        let hash = "0x";
        for (let i = 0; i < 64; i++) {
          hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
      };
      setCommitmentHash(generateCommitmentHash());
    }
  }, [isAuthenticated, isPlacingBet]);

  // Handle bet resolution from polling
  useEffect(() => {
    if (latestBet) {
      console.log("🎉 RESULT FOUND from polling!", latestBet);
      stopPolling();

      // Show animated result multiplier in mountain bg
      const displayMultiplier = Number(latestBet.limboMultiplier) / 100;
      setResultMultiplierValue(displayMultiplier);
      setResultMultiplierColor(latestBet.win ? "green" : "red");
      setShowResultMultiplier(true);

      // Hide after 3 seconds
      setTimeout(() => {
        setShowResultMultiplier(false);
      }, 3000);

      setLastResult(latestBet.win, latestBet.payout);
      setIsPlacingBet(false);
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

  const handlePrimaryAction = async () => {
    // If no wallet, this will be "Create Wallet" - handled by ServerWallet component
    if (!wallet) {
      return;
    }

    // Check for amount validation errors first
    if (amountError) {
      console.log("⚠️ Amount validation error:", amountError);
      return;
    }

    // Check if user has sufficient balance
    const betAmountNum = parseFloat(betAmount || "0");

    // Check for zero or invalid bet amount
    if (betAmountNum <= 0) {
      console.log("⚠️ Invalid bet amount");
      return;
    }

    // If balance is 0 or insufficient, open funding modal instead
    if (!balanceInUsd || balanceInUsd === 0) {
      console.log("💰 No balance, opening funding modal...");
      setShowFundingModal(true);
      return;
    }

    if (betAmountNum > balanceInUsd) {
      console.log("💰 Insufficient balance, opening funding modal...");
      setShowFundingModal(true);
      return;
    }

    // Otherwise, place bet
    await handlePlaceBet();
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

      console.log("✅ Bet result received instantly:", result);

      // Handle instant result from off-chain provably fair system
      if (result.result) {
        const betResult: BetResultDisplay = {
          win: result.result.win,
          payout: BigInt(result.result.payout),
          amount: BigInt(result.result.amount),
          targetMultiplier: result.result.targetMultiplier,
          limboMultiplier: BigInt(
            Math.floor(result.result.limboMultiplier * 100)
          ),
        };

        // Show animated result multiplier in mountain bg
        setResultMultiplierValue(result.result.limboMultiplier);
        setResultMultiplierColor(result.result.win ? "green" : "red");
        setShowResultMultiplier(true);

        // Hide after 3 seconds
        setTimeout(() => {
          setShowResultMultiplier(false);
        }, 3000);

        setLastResult(betResult.win, betResult.payout);
        setIsPlacingBet(false);
      } else {
        // Legacy on-chain betting flow (if still needed)
        console.log("📝 Request ID:", result.requestId);
        if (result.requestId) {
          console.log("👀 Starting to watch for bet result...");
          watchForResult(result.requestId);
        } else {
          startPolling();
        }
      }
    } catch (error) {
      console.error("❌ Place bet error:", error);
      setBetError(
        error instanceof Error ? error.message : "Failed to place bet"
      );
      setIsPlacingBet(false);
    }
  };

  // Handle watched bet result (instant result from event watching)
  useEffect(() => {
    if (watchedBetResult) {
      console.log("🎉 Bet result received from watcher!", watchedBetResult);

      // Convert BetResult to BetResultDisplay
      const betResult: BetResultDisplay = {
        win: watchedBetResult.win,
        payout: watchedBetResult.payout,
        amount: watchedBetResult.betAmount,
        targetMultiplier: Number(watchedBetResult.targetMultiplier) / 100,
        limboMultiplier: watchedBetResult.limboMultiplier,
      };

      // Show animated result multiplier in mountain bg
      const displayMultiplier = Number(watchedBetResult.limboMultiplier) / 100;
      setResultMultiplierValue(displayMultiplier);
      setResultMultiplierColor(watchedBetResult.win ? "green" : "red");
      setShowResultMultiplier(true);

      // Hide after 3 seconds
      setTimeout(() => {
        setShowResultMultiplier(false);
      }, 3000);

      setLastResult(betResult.win, betResult.payout);
      setIsPlacingBet(false);

      console.log("🎲 Result:", betResult);
    }
  }, [watchedBetResult, setLastResult]);

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

  const handleSignIn = async () => {
    if (!userId) {
      console.error("Missing userId (Farcaster FID)");
      return;
    }

    try {
      // Call Quick Auth sign-in - no more signature prompts!
      const success = await signIn();
      if (success) {
        console.log("✅ Quick Auth sign in successful");
      }
    } catch (error) {
      console.error("❌ Sign in failed:", error);
    }
  };

  const isDisabled =
    isPlacingBet || isWaitingForResult || isPolling || isWalletLoading;

  const getButtonText = () => {
    if (isPolling) return "Getting Result...";
    if (isWaitingForResult) return "Waiting for VRF...";
    if (isPlacingBet) return "Placing Bet...";
    if (!wallet) return "Create Wallet";
    return "Place Bet";
  };

  // Show loading state while wallet is being initialized
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto flex flex-col min-h-screen">
          {/* Navbar with pulse animation */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Centered Loading State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#cfd9ff] relative">
      <div className="max-w-md mx-auto flex flex-col min-h-screen">
        {/* Game Board Title & Wallet - Now with inline menu buttons */}
        <div className="mt-2 mx-2 bg-[#2574ff] border-2 border-black rounded-xl h-[53px] flex items-center justify-between px-2 shadow-[0px_2px_0px_0px_#000000] relative">
          <h1
            className="text-[24px] font-bold text-white leading-[0.9]"
            style={{
              fontFamily: "var(--font-lilita-one)",
              textShadow: "0px 2px 0px #000000",
            }}
          >
            Based Limbo
          </h1>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {/* Only show Verify & Activity buttons when authenticated */}
            {isAuthenticated && (
              <>
                {/* Verify Button */}
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="w-[30px] h-[30px] border-2 border-white rounded-md flex items-center justify-center hover:bg-white/10 transition-colors"
                  title="Verify Fairness"
                >
                  <span className="text-white text-sm">✓</span>
                </button>

                {/* Activity Button */}
                <button
                  onClick={() => setIsActivityDrawerOpen(true)}
                  className="w-[30px] h-[30px] border-2 border-white rounded-md flex items-center justify-center hover:bg-white/10 transition-colors"
                  title="Activity"
                >
                  <span className="text-white text-xs">⋯</span>
                </button>
              </>
            )}

            {/* Sign In / Wallet Button */}
            {!isAuthenticated ? (
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== "loading";
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === "authenticated");

                  return (
                    <button
                      onClick={() => {
                        if (!connected) {
                          openConnectModal();
                        } else if (chain.unsupported) {
                          openChainModal();
                        } else {
                          // Trigger sign in
                          handleSignIn();
                        }
                      }}
                      className="border-2 border-white rounded-lg px-4 py-1 h-[38px] hover:bg-white/10 transition-colors"
                    >
                      <span
                        className="text-base text-white leading-[0.9]"
                        style={{ fontFamily: "var(--font-lilita-one)" }}
                      >
                        {!connected
                          ? "Sign In"
                          : chain.unsupported
                          ? "Wrong Network"
                          : isAuthLoading
                          ? "Signing In..."
                          : "Sign In"}
                      </span>
                    </button>
                  );
                }}
              </ConnectButton.Custom>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="border-2 border-white rounded-lg px-3 py-1 h-[38px] flex items-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <span
                    className="text-base text-white leading-[0.9]"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    {custodialWallet
                      ? `${custodialWallet.slice(
                          0,
                          4
                        )}..${custodialWallet.slice(-4)}`
                      : "Wallet"}
                  </span>
                  <span
                    className={`text-white text-xs transition-transform ${
                      showWalletDropdown ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {/* Dropdown Menu - Only shown when authenticated */}
                <AnimatePresence>
                  {showWalletDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-black rounded-lg shadow-[0px_4px_0px_0px_#000000] z-50"
                    >
                      <div className="p-3 space-y-2">
                        {/* Balance */}
                        <div className="pb-2 border-b-2 border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-600">
                              Custodial Wallet Balance
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRefreshBalance();
                              }}
                              disabled={isRefreshingBalance}
                              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                              title="Refresh balance"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 text-gray-600 ${
                                  isRefreshingBalance ? "animate-spin" : ""
                                }`}
                              />
                            </button>
                          </div>
                          <p
                            className="text-lg font-bold text-black"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            {balanceInUsd
                              ? `$${balanceInUsd.toFixed(2)}`
                              : "$0.00"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {balanceInEth || "0"} ETH
                          </p>
                        </div>

                        {/* Actions */}
                        <button
                          onClick={() => {
                            setShowFundingModal(true);
                            setShowWalletDropdown(false);
                          }}
                          className="w-full py-2 px-3 bg-[#2574ff] text-white rounded-lg border-2 border-black shadow-[0px_2px_0px_0px_#000000] hover:translate-y-[1px] hover:shadow-[0px_1px_0px_0px_#000000] transition-all text-sm"
                          style={{ fontFamily: "var(--font-lilita-one)" }}
                        >
                          Fund Wallet
                        </button>

                        <button
                          onClick={() => {
                            setShowWithdrawModal(true);
                            setShowWalletDropdown(false);
                          }}
                          className="w-full py-2 px-3 bg-white text-black rounded-lg border-2 border-black hover:bg-gray-50 transition-colors text-sm"
                          style={{ fontFamily: "var(--font-lilita-one)" }}
                        >
                          Withdraw
                        </button>

                        {/* Custodial Wallet Address */}
                        <div className="pt-2 border-t-2 border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">
                            Custodial Wallet
                          </p>
                          <p className="font-mono text-[10px] text-black break-all">
                            {custodialWallet}
                          </p>
                        </div>

                        {/* Sign Out */}
                        <button
                          onClick={() => {
                            signOut();
                            setShowWalletDropdown(false);
                          }}
                          className="w-full py-2 px-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors text-xs"
                          style={{ fontFamily: "var(--font-lilita-one)" }}
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Main Game Content */}
        <div className="flex flex-col gap-2 p-2 flex-1">
          {/* Visual/Game Area - Mountain Background */}
          <div className="relative bg-white rounded-xl overflow-hidden flex-1 min-h-[380px]  border-2 border-black shadow-[0px_2px_0px_0px_#000000]">
            {/* Mountain Background Image */}
            <div className="absolute inset-0">
              <Image
                src="/mountain-bg.png"
                alt="Mountain Background"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Result Multiplier Animation */}
            <AnimatePresence>
              {showResultMultiplier && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <p
                      className={`text-[120px] font-extrabold leading-none ${
                        resultMultiplierColor === "green"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                      style={{
                        fontFamily: "var(--font-lilita-one)",
                        textShadow: "0px 4px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      {resultMultiplierValue.toFixed(2)}x
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progressive Blur Overlay at Bottom */}
            {/* <div className="absolute bottom-0 left-0 right-0 h-[238px] bg-gradient-to-t from-white/10 to-transparent backdrop-blur-sm" /> */}
          </div>

          {/* Game Controls Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white backdrop-blur-md border-2 border-black rounded-xl p-4 space-y-6 shadow-[0px_0px_5px_1px_inset_rgba(255,255,255,0.1)]"
          >
            {/* Bet Amount Input */}
            <div className="space-y-2">
              <p
                className="text-base text-black tracking-[-1px] leading-[0.9]"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                Bet Amount
              </p>
              <div className="border-2 border-black rounded-xl h-[44px] flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-0">
                  <span className="text-base text-black leading-[0.9] font-bold">
                    $
                  </span>
                  <input
                    type="text"
                    className="text-base text-black leading-[0.9] bg-transparent focus:outline-none focus:ring-0"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { label: "0.5x", multiplier: 0.5 },
                    { label: "2x", multiplier: 2 },
                    { label: "MAX", multiplier: -1 },
                  ].map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleQuickAmount(item.multiplier)}
                      disabled={isDisabled}
                      className="border-2 border-black rounded-lg h-[24px] px-[6px] py-[8px] flex items-center justify-center disabled:opacity-50"
                    >
                      <p
                        className="text-[12px] text-black tracking-[-1px] leading-[0.9]"
                        style={{ fontFamily: "var(--font-lilita-one)" }}
                      >
                        {item.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Multiplier Input */}
            <div className="space-y-2">
              <p
                className="text-base text-black tracking-[-1px] leading-[0.9]"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                Multiplier
              </p>
              <div className="border-2 border-black rounded-xl h-[44px] flex items-center justify-between px-3 py-2">
                <input
                  type="text"
                  className="text-base text-black leading-[0.9] bg-transparent focus:outline-none focus:ring-0 flex-1"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                  value={targetMultiplier.toFixed(2)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setTargetMultiplier(Math.max(1.01, Math.min(1000, val)));
                    }
                  }}
                  disabled={isDisabled}
                />
                <span className="text-base text-black leading-[0.9] font-bold ml-1">
                  x
                </span>
              </div>
            </div>

            {/* COMMENTED OUT: Original Figma Power Bar (Segmented, Clickable) */}
            {/*
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p
                  className="text-base text-black leading-[0.9]"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  Multiplier
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setTargetMultiplier(
                        Math.max(1.01, targetMultiplier - 0.5)
                      )
                    }
                    disabled={isDisabled || targetMultiplier <= 1.01}
                    className="w-6 h-6 flex items-center justify-center border-2 border-black rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="text-sm font-bold">-</span>
                  </button>
                  <div className="border border-black rounded-sm px-[6px] py-[2px]">
                    <p
                      className="text-[14px] text-black leading-[0.9]"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      {targetMultiplier.toFixed(2)}x
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setTargetMultiplier(Math.min(100, targetMultiplier + 0.5))
                    }
                    disabled={isDisabled || targetMultiplier >= 100}
                    className="w-6 h-6 flex items-center justify-center border-2 border-black rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="text-sm font-bold">+</span>
                  </button>
                </div>
              </div>

              <div
                className="relative h-[10px] flex gap-[1.4px] cursor-pointer"
                onClick={(e) => {
                  if (isDisabled) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(1, x / rect.width));
                  const newMultiplier = 1 + percentage * 99;
                  setTargetMultiplier(
                    Math.max(
                      1.01,
                      Math.min(100, Number(newMultiplier.toFixed(2)))
                    )
                  );
                }}
              >
                {Array.from({ length: 26 }).map((_, index) => {
                  const segmentValue = ((index + 1) / 26) * 100;
                  const currentValue = ((targetMultiplier - 1) / 99) * 100;
                  const isActive = segmentValue <= currentValue;

                  return (
                    <div
                      key={index}
                      className={`flex-1 h-full rounded-[1px] border border-black transition-colors ${
                        isActive ? "bg-[#094eed]" : "bg-[#2a3147]"
                      }`}
                    />
                  );
                })}
                <div
                  className="absolute w-[8px] h-[14px] -top-[2px] border-2 border-black bg-[#424242] rounded-[1px] pointer-events-none"
                  style={{
                    left: `calc(${((targetMultiplier - 1) / 99) * 100}% - 4px)`,
                  }}
                />
              </div>
            </div>
            */}

            {/* Place Bet Button */}
            <button
              onClick={handlePrimaryAction}
              disabled={
                !isAuthenticated ||
                isDisabled ||
                !!amountError ||
                parseFloat(betAmount || "0") <= 0
              }
              className="relative w-full h-[43px] bg-gradient-to-b from-[#1499ff] to-[#094eed] border-2 border-black rounded-lg shadow-[0px_3px_0px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed active:shadow-none active:translate-y-[2px] transition-all"
            >
              <p
                className="text-base text-white uppercase tracking-[0.16px] leading-normal"
                style={{
                  textShadow: "0px 1.6px 0px #000000",
                  fontFamily: "var(--font-lilita-one)",
                }}
              >
                {isPlacingBet || isWaitingForResult || isPolling ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {getButtonText()}
                  </span>
                ) : !balanceInUsd || balanceInUsd === 0 ? (
                  "Fund Wallet to Play"
                ) : parseFloat(betAmount || "0") > balanceInUsd ? (
                  "Add More Funds"
                ) : amountError ? (
                  "Fix Amount"
                ) : parseFloat(betAmount || "0") <= 0 ? (
                  "Enter Amount"
                ) : (
                  "Bet your amount"
                )}
              </p>
            </button>

            {/* Sign in prompt if not authenticated */}
            {!isAuthenticated && (
              <div className="text-sm text-center p-3 bg-yellow-50 border-2 border-black rounded-lg">
                <p
                  className="text-gray-700"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  Please sign in to start playing
                </p>
              </div>
            )}

            {/* Insufficient balance warning */}
            {isAuthenticated &&
              balanceInUsd !== null &&
              balanceInUsd !== undefined &&
              parseFloat(betAmount || "0") > 0 &&
              parseFloat(betAmount || "0") > balanceInUsd && (
                <div className="text-sm text-center p-3 bg-red-50 border-2 border-black rounded-lg">
                  <p
                    className="text-red-700"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Insufficient balance. You have ${balanceInUsd.toFixed(2)}
                  </p>
                </div>
              )}

            {/* Potential Win */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
              <div className="flex items-center gap-2 relative">
                <p className="potential-payout">Potential Win</p>
                {/* Lock Icon with Tooltip - Only show when authenticated and has commitment hash */}
                {isAuthenticated && commitmentHash && !isPlacingBet && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowCommitmentTooltip(!showCommitmentTooltip)
                      }
                      className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                      title="Provably Fair Commitment"
                    >
                      <Lock className="w-3 h-3 text-green-600" />
                    </button>

                    {/* Tooltip */}
                    <AnimatePresence>
                      {showCommitmentTooltip && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 5 }}
                          className="absolute bottom-full left-0 mb-2 z-50 w-48"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="bg-white border-2 border-black rounded-lg shadow-lg p-3">
                            <div className="flex items-start gap-2 mb-2">
                              <Lock className="w-4 h-4 text-black/8- flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-bold text-black mb-1">
                                  Committed Round
                                </p>
                                <p className="text-[10px] text-gray-600 leading-tight">
                                  This round is provably fair
                                </p>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-black">
                              <p className="text-[9px] text-gray-500 mb-1">
                                Hash:
                              </p>
                              <code className="text-[9px] font-mono text-black/80 break-all block">
                                {commitmentHash.slice(0, 20)}...
                              </code>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <p
                className="text-[18px] text-black text-center leading-[0.9] font-bold"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                ${potentialPayoutUsd ? potentialPayoutUsd.toFixed(2) : "0.00"}
              </p>
            </div>

            {betError && (
              <div className="text-sm text-red-600 text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                {betError}
              </div>
            )}

            {/* Show funding option if authenticated but balance is zero */}
            {isAuthenticated &&
              balanceInUsd !== null &&
              balanceInUsd !== undefined &&
              balanceInUsd === 0 && (
                <div className="text-sm text-center p-4 bg-yellow-50 border-2 border-black rounded-lg">
                  <p
                    className="text-gray-700 mb-2"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Your wallet needs funds to place bets
                  </p>
                  <button
                    onClick={() => setShowFundingModal(true)}
                    className="w-full py-2 px-4 bg-[#2574ff] text-white rounded-lg border-2 border-black shadow-[0px_2px_0px_0px_#000000] hover:translate-y-[1px] hover:shadow-[0px_1px_0px_0px_#000000] transition-all text-sm"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Fund Wallet
                  </button>
                </div>
              )}
          </motion.div>
        </div>
      </div>

      {/* Game Result Modal */}
      {/* <AnimatePresence>
        {showResult && lastWin !== null && currentBetResult && (
          <GameResult
            win={currentBetResult.win}
            amount={currentBetResult.amount}
            targetMultiplier={currentBetResult.targetMultiplier}
            randomResult={currentBetResult.limboMultiplier}
            payout={currentBetResult.payout}
            onClose={handleResultClose}
            betId={currentBetId || undefined}
            onVerify={handleOpenVerification}
          />
        )}
      </AnimatePresence> */}

      {/* Activity Drawer */}
      <ActivityDrawer
        isOpen={isActivityDrawerOpen}
        onClose={() => setIsActivityDrawerOpen(false)}
        userAddress={wallet?.address || null}
        userId={userId}
      />

      {/* Funding Modal */}
      {wallet && (
        <FundingModal
          isOpen={showFundingModal}
          onClose={() => setShowFundingModal(false)}
          walletAddress={wallet.address}
          currentBalance={balanceInEth || "0"}
          userId={userId}
          onSuccess={handleRefreshBalance}
        />
      )}

      {/* Withdraw Modal */}
      {wallet && (
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          walletAddress={wallet.address}
          currentBalance={balanceInEth || "0"}
          onWithdraw={handleWithdraw}
        />
      )}
    </div>
  );
}
