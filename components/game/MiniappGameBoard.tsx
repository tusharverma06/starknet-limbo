"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ActivityDrawer } from "@/components/ui/ActivityDrawer";
import { FundingModal } from "@/components/ui/FundingModal";
import { WithdrawModal } from "@/components/ui/WithdrawModal";
import { useServerWallet } from "@/hooks/useServerWallet";
import { useBalance } from "@/hooks/useBalance";
import { useBetResultPoller } from "@/hooks/useBetResultPoller";
import { useBetResultWatcher } from "@/hooks/useBetResultWatcher";
import { useGameState } from "@/hooks/useGameState";
import { useGameStore } from "@/store/gameStore";
import { useFarcaster } from "@/hooks/useFarcaster";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useSiweAuth } from "@/hooks/useSiweAuth";
import { Loader2, Lock, RefreshCw } from "lucide-react";
import { MIN_BET_USD, MAX_BET_USD } from "@/lib/constants";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

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

  // Use the new balance hook for real-time balance
  const {
    balanceInEth,
    balanceInUsd,
    isLoading: isBalanceLoading,
    isRefetching: isRefreshingBalance,
    refetch: refetchBalance,
  } = useBalance(userId);

  // Keep useServerWallet for wallet operations (placeBet, withdraw)
  const {
    wallet,
    placeBet: placeBetWithServerWallet,
    withdraw: withdrawFromServerWallet,
    isLoading: isWalletLoading,
    isInitialLoading,
  } = useServerWallet(userId);

  const handleRefreshBalance = async () => {
    await refetchBalance();
  };

  const {
    isAuthenticated,
    custodialWallet,
    isLoading: isAuthLoading,
    signIn,
    signOut,
  } = useQuickAuth();

  // SIWE Auth for external wallet authorization
  const {
    isAuthenticated: isSiweAuthenticated,
    signIn: siweSignIn,
    isSigning: isSiweSigning,
    error: siweError,
  } = useSiweAuth();

  // Wagmi account for checking external wallet connection
  const {
    address: externalWalletAddress,
    isConnected: isExternalWalletConnected,
  } = useAccount();

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

  const { deductBet, addPayout, setOptimisticBalance } = useGameStore();

  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState("");
  const [multiplierError, setMultiplierError] = useState("");
  const [multiplierInput, setMultiplierInput] = useState(
    targetMultiplier.toFixed(2)
  );
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
  // const [commitmentHash, setCommitmentHash] = useState<string>("");
  // const [showCommitmentTooltip, setShowCommitmentTooltip] = useState(false);

  // // Generate commitment hash when authenticated and ready to bet
  // useEffect(() => {
  //   if (isAuthenticated && !isPlacingBet) {
  //     const generateCommitmentHash = () => {
  //       const chars = "0123456789abcdef";
  //       let hash = "0x";
  //       for (let i = 0; i < 64; i++) {
  //         hash += chars[Math.floor(Math.random() * chars.length)];
  //       }
  //       return hash;
  //     };
  //     setCommitmentHash(generateCommitmentHash());
  //   }
  // }, [isAuthenticated, isPlacingBet]);

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

  // Sync multiplierInput when targetMultiplier changes from external sources (buttons, etc.)
  useEffect(() => {
    setMultiplierInput(targetMultiplier.toFixed(2));
  }, [targetMultiplier]);

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

    // If balance is less than $0.10, open funding modal
    if (balanceInUsd < 0.1) {
      console.log("💰 Balance too low (< $0.10), opening funding modal...");
      setShowFundingModal(true);
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

    // If bet amount exceeds balance, open funding modal
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

    // Safety check: Ensure SIWE authentication is valid
    if (!isSiweAuthenticated) {
      console.error("❌ Cannot place bet: SIWE authentication required");
      setBetError("Please sign in with your wallet to place bets");
      return;
    }

    if (amountError) {
      return;
    }

    // Validate multiplier before placing bet
    const multiplierValue = parseFloat(multiplierInput);
    if (
      isNaN(multiplierValue) ||
      multiplierValue < 1.01 ||
      multiplierValue > 1000
    ) {
      setMultiplierError("Multiplier must be between 1.01 and 1000");
      return;
    }

    // Clear multiplier error and update the actual multiplier value
    setMultiplierError("");
    setTargetMultiplier(multiplierValue);

    console.log("🎲 Starting bet placement with server wallet...");
    setIsPlacingBet(true);
    setBetError(null);

    // Optimistic update: immediately deduct bet amount
    const betAmountNum = parseFloat(betAmount);
    deductBet(betAmountNum);
    console.log("💸 Optimistically deducted bet amount:", betAmountNum);

    try {
      const result = await placeBetWithServerWallet(betAmount, multiplierValue);

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

        // Optimistic update: add payout if win
        if (result.result.win) {
          // Backend always returns payoutInUsd for accurate USD amount
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const payoutUsd = (result.result as any).payoutInUsd;
          if (payoutUsd) {
            addPayout(payoutUsd);
            console.log("🎉 Optimistically added payout:", payoutUsd, "USD");
          } else {
            console.error(
              "⚠️ Backend did not return payoutInUsd, skipping optimistic payout update"
            );
            // Fallback: refetch balance to get accurate amount
            await refetchBalance();
          }
        }

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

      // Revert optimistic update by refreshing balance
      try {
        await refetchBalance();
      } catch (refreshError) {
        // If refresh fails, manually revert the deduction
        console.error(
          "⚠️ Balance refresh failed, manually reverting:",
          refreshError
        );
        addPayout(betAmountNum); // Add back the deducted amount
      }

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
      console.log("🔐 Starting sign-in flow...");

      // Step 1: Check if external wallet is connected
      if (!isExternalWalletConnected || !externalWalletAddress) {
        console.log(
          "⚠️ External wallet not connected - RainbowKit will handle connection"
        );
        // RainbowKit ConnectButton will handle opening the modal
        return;
      }

      console.log("✅ External wallet connected:", externalWalletAddress);

      // Step 2: Sign SIWE message to authorize custodial wallet
      if (!isSiweAuthenticated) {
        console.log("📝 Requesting SIWE signature...");
        const siweSuccess = await siweSignIn();

        if (!siweSuccess) {
          console.error("❌ SIWE signature failed");
          setBetError("Failed to authorize wallet. Please try again.");
          return;
        }

        console.log("✅ SIWE signature completed");
      } else {
        console.log("✅ Already have SIWE authorization");
      }

      // Step 3: Complete Quick Auth flow (creates/links custodial wallet)
      console.log("🔑 Completing Quick Auth...");
      const success = await signIn();

      if (success) {
        console.log("✅ Sign-in flow completed successfully");
        setBetError(null); // Clear any previous errors
      } else {
        console.error("❌ Quick Auth failed");
        setBetError("Sign-in failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Sign in failed:", error);
      setBetError(error instanceof Error ? error.message : "Sign-in failed");
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
            {/* Only show Verify & Activity buttons when SIWE authenticated */}
            {isSiweAuthenticated && (
              <>
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
            {!isSiweAuthenticated ? (
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
                          // Trigger SIWE sign in
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
                          ? "Connect Wallet"
                          : chain.unsupported
                          ? "Wrong Network"
                          : isSiweSigning
                          ? "Signing..."
                          : isAuthLoading
                          ? "Loading..."
                          : "Authorize"}
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
                    {isBalanceLoading ? "..." : `$${balanceInUsd.toFixed(2)}`}
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
                  inputMode="decimal"
                  placeholder="1.01 - 1000"
                  className="text-base text-black leading-[0.9] bg-transparent focus:outline-none focus:ring-0 flex-1"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                  value={multiplierInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty, numbers, and decimal point
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setMultiplierInput(value);
                      setMultiplierError(""); // Clear error while typing
                    }
                  }}
                  onBlur={() => {
                    // On blur, validate and format the input
                    const val = parseFloat(multiplierInput);
                    if (!isNaN(val)) {
                      const clamped = Math.max(1.01, Math.min(1000, val));
                      setTargetMultiplier(clamped);
                      setMultiplierInput(clamped.toFixed(2));
                      setMultiplierError("");
                    } else if (multiplierInput !== "") {
                      setMultiplierError("Invalid multiplier");
                    }
                  }}
                  disabled={isDisabled}
                />
                <span className="text-base text-black leading-[0.9] font-bold ml-1">
                  x
                </span>
              </div>
              {multiplierError && (
                <p className="text-xs text-red-600 mt-1">{multiplierError}</p>
              )}
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
                !isSiweAuthenticated ||
                !isAuthenticated ||
                isDisabled ||
                (balanceInUsd < 0.1 && parseFloat(betAmount || "0") > 0) ||
                (parseFloat(betAmount || "0") <= 0 && balanceInUsd >= 0.1) ||
                (!!amountError &&
                  balanceInUsd >= parseFloat(betAmount || "0")) ||
                !!multiplierError
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
                ) : balanceInUsd < 0.1 ? (
                  "Fund Wallet to Play"
                ) : parseFloat(betAmount || "0") > balanceInUsd ? (
                  "Add More Funds"
                ) : amountError ? (
                  "Fix Amount"
                ) : multiplierError ? (
                  "Fix Multiplier"
                ) : parseFloat(betAmount || "0") <= 0 ? (
                  "Enter Amount"
                ) : (
                  "Bet your amount"
                )}
              </p>
            </button>

            {/* Sign in prompt if not authenticated with SIWE */}
            {!isSiweAuthenticated && (
              <div className="text-sm p-3 bg-yellow-50 border-2 border-black rounded-lg space-y-2">
                <p
                  className="text-gray-800 font-bold text-center"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  🔐 Authorization Required
                </p>
                <p className="text-gray-700 text-xs text-center">
                  {!isExternalWalletConnected
                    ? "Connect your wallet and sign a message to authorize betting"
                    : "Sign a message to authorize your custodial wallet"}
                </p>
                {siweError && (
                  <p className="text-red-600 text-xs text-center font-semibold">
                    {siweError}
                  </p>
                )}
              </div>
            )}

            {/* Insufficient balance warning */}
            {isSiweAuthenticated &&
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

            {/* Low balance warning */}
            {isSiweAuthenticated && balanceInUsd < 0.1 && balanceInUsd > 0 && (
              <div className="text-sm text-center p-3 bg-yellow-50 border-2 border-black rounded-lg">
                <p
                  className="text-yellow-700"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  Balance too low. Please add at least $0.10 to play.
                </p>
              </div>
            )}

            {/* Potential Win */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
              <div className="flex items-center gap-2 relative">
                <p className="potential-payout">Potential Win</p>
              </div>
              <p
                className="text-[18px] text-black text-center leading-[0.9] font-bold"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                ${potentialPayoutUsd ? potentialPayoutUsd.toFixed(2) : "0.00"}
              </p>
            </div>

            {/* Display bet error */}
            {betError && (
              <div className="text-sm text-red-600 text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                {betError}
              </div>
            )}

            {/* Show funding option if SIWE authenticated but balance is zero */}
            {isSiweAuthenticated &&
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
          currentBalance={balanceInEth?.toString() || "0"}
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
          currentBalance={balanceInEth?.toString() || "0"}
          onWithdraw={handleWithdraw}
        />
      )}
    </div>
  );
}
