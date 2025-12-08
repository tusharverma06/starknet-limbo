"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ActivityDrawer } from "@/components/ui/ActivityDrawer";
import { FundingModal } from "@/components/ui/FundingModal";
import { WithdrawModal } from "@/components/ui/WithdrawModal";
import { TransactionsSheet } from "@/components/ui/TransactionsSheet";
import { useServerWallet } from "@/hooks/useServerWallet";
import { useBalance } from "@/hooks/useBalance";
import { useGameState } from "@/hooks/useGameState";
import { useFarcaster } from "@/hooks/useFarcaster";
import { useSimpleSiwe } from "@/hooks/useSimpleSiwe";
import { Loader2 } from "lucide-react";
import { MIN_BET_USD, MAX_BET_USD } from "@/lib/constants";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect } from "wagmi";
import { cn } from "@/lib/utils/cn";
import { useRive } from "@rive-app/react-canvas";

// Removed unused BetResultDisplay interface - results handled inline

export function MiniappGameBoard() {
  const { user } = useFarcaster();
  const userId = user?.fid?.toString() || null;

  // Simple SIWE authentication with cookie-based sessions
  const {
    isAuthenticated,
    custodialWallet,
    isLoading: isAuthLoading,
    isSigning,
    signIn,
    signOut,
  } = useSimpleSiwe();

  // Use balance hook - shows available balance (total - locked)
  // This is what user can actually bet with
  const {
    availableBalanceInEth: balanceEth,
    availableBalanceInUsd: balanceUsd,
    lockedBalanceInUsd,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useBalance(userId, isAuthenticated);

  // Keep useServerWallet for wallet operations (placeBet, withdraw)
  const {
    wallet,
    placeBet: placeBetWithServerWallet,
    withdraw: withdrawFromServerWallet,
    isInitialLoading,
    isWithdrawing,
    isPlacingBet: isPlacingBetViaWallet,
  } = useServerWallet(userId, isAuthenticated);

  const handleRefreshBalance = async () => {
    await refetchBalance();
  };

  // Wagmi account for checking external wallet connection
  const {
    address: externalWalletAddress,
    isConnected: isExternalWalletConnected,
  } = useAccount();

  // Removed legacy on-chain bet polling/watching - now using instant off-chain results

  const {
    betAmount,
    targetMultiplier,
    setBetAmount,
    setTargetMultiplier,
    setLastResult,
  } = useGameState();

  // Removed optimistic balance - now showing real blockchain balance

  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState("");
  const [multiplierError, setMultiplierError] = useState("");
  const [multiplierInput, setMultiplierInput] = useState(
    targetMultiplier.toFixed(2)
  );
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showTransactionsSheet, setShowTransactionsSheet] = useState(false);
  const [potentialPayoutUsd, setPotentialPayoutUsd] = useState<number | null>(
    null
  );
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<
    "idle" | "win" | "lose"
  >("idle");
  const [showBanner, setShowBanner] = useState(false);
  const [bannerData, setBannerData] = useState<{
    multiplier: number;
    amount: string;
    isWin: boolean;
  } | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const { connect, connectors } = useConnect();

  // Rive animations with autoplay enabled
  const { RiveComponent: RiveIdle } = useRive({
    src: "/limbov2.riv",
    stateMachines: "idle",
    autoplay: true,
  });

  const { RiveComponent: RiveWin } = useRive({
    src: "/limbov2.riv",
    stateMachines: "if win",
    autoplay: true,
  });

  const { RiveComponent: RiveLose } = useRive({
    src: "/limbov2.riv",
    stateMachines: "if lose",
    autoplay: true,
  });

  // Ref for wallet dropdown to handle click outside
  const walletDropdownRef = useRef<HTMLDivElement>(null);

  // Audio refs for win and lose sounds and background music
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const loseAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const [bgMusicStarted, setBgMusicStarted] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    winAudioRef.current = new Audio("/win_audio.wav");
    loseAudioRef.current = new Audio("/loose_audio.wav");
    bgMusicRef.current = new Audio("/bg-music.wav");

    // Set audio properties
    if (winAudioRef.current) {
      winAudioRef.current.preload = "auto";
      winAudioRef.current.volume = 0.7;
    }
    if (loseAudioRef.current) {
      loseAudioRef.current.preload = "auto";
      loseAudioRef.current.volume = 0.7;
    }
    if (bgMusicRef.current) {
      bgMusicRef.current.preload = "auto";
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.3;
    }

    // Cleanup on unmount
    return () => {
      if (winAudioRef.current) {
        winAudioRef.current.pause();
        winAudioRef.current = null;
      }
      if (loseAudioRef.current) {
        loseAudioRef.current.pause();
        loseAudioRef.current = null;
      }
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, []);

  // Function to start background music (needs user interaction)
  const startBackgroundMusic = () => {
    if (bgMusicRef.current && !bgMusicStarted) {
      bgMusicRef.current.play().catch((error) => {
        console.log("Failed to start background music:", error);
      });
      setBgMusicStarted(true);
    }
  };

  // Play audio when animation changes and handle background music
  useEffect(() => {
    if (currentAnimation === "win" && winAudioRef.current) {
      // Pause background music if it's playing
      if (bgMusicRef.current && bgMusicStarted) {
        bgMusicRef.current.pause();
      }

      // Reset and play win sound
      winAudioRef.current.currentTime = 0;
      winAudioRef.current.play().catch((error) => {
        console.log("Failed to play win sound:", error);
      });

      // Resume background music when win audio ends
      const handleWinEnded = () => {
        if (bgMusicRef.current && bgMusicStarted) {
          bgMusicRef.current.play().catch((error) => {
            console.log("Failed to resume background music:", error);
          });
        }
      };
      winAudioRef.current.addEventListener("ended", handleWinEnded);

      return () => {
        winAudioRef.current?.removeEventListener("ended", handleWinEnded);
      };
    } else if (currentAnimation === "lose" && loseAudioRef.current) {
      // Pause background music if it's playing
      if (bgMusicRef.current && bgMusicStarted) {
        bgMusicRef.current.pause();
      }

      // Reset and play lose sound
      loseAudioRef.current.currentTime = 0;
      loseAudioRef.current.play().catch((error) => {
        console.log("Failed to play lose sound:", error);
      });

      // Resume background music when lose audio ends
      const handleLoseEnded = () => {
        if (bgMusicRef.current && bgMusicStarted) {
          bgMusicRef.current.play().catch((error) => {
            console.log("Failed to resume background music:", error);
          });
        }
      };
      loseAudioRef.current.addEventListener("ended", handleLoseEnded);

      return () => {
        loseAudioRef.current?.removeEventListener("ended", handleLoseEnded);
      };
    } else if (currentAnimation === "idle") {
      // Ensure background music is playing when returning to idle
      if (bgMusicRef.current && bgMusicStarted && bgMusicRef.current.paused) {
        bgMusicRef.current.play().catch((error) => {
          console.log("Failed to resume background music on idle:", error);
        });
      }
    }
  }, [currentAnimation, animationKey, bgMusicStarted]);

  // Handle click outside for wallet dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        walletDropdownRef.current &&
        !walletDropdownRef.current.contains(event.target as Node)
      ) {
        setShowWalletDropdown(false);
      }
    };

    if (showWalletDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showWalletDropdown]);

  // Removed legacy commitment hash and polling - now using instant off-chain results

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
      if (balanceUsd) {
        newAmount = Math.min(balanceUsd, MAX_BET_USD);
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
    // Start background music on any interaction
    startBackgroundMusic();

    if (!isAuthenticated) {
      signIn();
      return;
    }

    // If no wallet, this will be "Create Wallet" - handled by ServerWallet component
    if (!wallet) {
      return;
    }

    // Parse bet amount
    const betAmountNum = parseFloat(betAmount || "0");

    // If balance is less than $0.10, open funding modal
    if (balanceUsd < 0.1) {
      setShowFundingModal(true);
      return;
    }

    // If bet amount exceeds balance, open funding modal
    if (betAmountNum > 0 && betAmountNum > balanceUsd) {
      setShowFundingModal(true);
      return;
    }

    // Check for amount validation errors first
    if (amountError) {
      return;
    }

    // Check for zero or invalid bet amount
    if (betAmountNum <= 0) {
      return;
    }

    // Otherwise, place bet
    await handlePlaceBet();
  };

  const handlePlaceBet = async () => {
    if (!wallet || !userId) {
      return;
    }

    // Safety check: Ensure SIWE authentication is valid
    if (!isAuthenticated) {
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

    setIsPlacingBet(true);
    setBetError(null);

    const betAmountNum = parseFloat(betAmount);

    try {
      const result = await placeBetWithServerWallet(betAmount, multiplierValue);

      // Handle instant result from off-chain provably fair system
      if (result.result) {
        // Balance will update automatically from blockchain polling (every 3 seconds)

        // Trigger Rive animation based on result
        const isWin = result.result.win;
        const payoutUsd =
          (result.result as { payoutInUsd?: number }).payoutInUsd || 0;

        // Set banner data
        setBannerData({
          multiplier: result.result.limboMultiplier,
          amount: isWin
            ? `+$${payoutUsd.toFixed(2)}`
            : `-$${betAmountNum.toFixed(2)}`,
          isWin: isWin,
        });

        // Trigger Rive animation by changing state
        // Increment key to force remount and replay animation
        setAnimationKey((prev) => prev + 1);
        setCurrentAnimation(isWin ? "win" : "lose");
        setShowBanner(false);

        // Show banner after Rive animation starts (approx 1 second)
        setTimeout(() => {
          setShowBanner(true);

          // Hide banner and reset to idle after 3 seconds
          setTimeout(() => {
            setShowBanner(false);
            setCurrentAnimation("idle");
          }, 3000);
        }, 1000);

        setLastResult(result.result.win, BigInt(result.result.payout));
        setIsPlacingBet(false);

        // Refetch balance immediately after bet
        await refetchBalance();
      }
    } catch (error) {
      setBetError(
        error instanceof Error ? error.message : "Failed to place bet"
      );
      setIsPlacingBet(false);
    }
  };

  // Removed legacy watched bet result effect - now handled inline

  const handleWithdraw = async (amount: string, toAddress: string) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const result = await withdrawFromServerWallet(toAddress, amount);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSignIn = async () => {
    if (!userId) {
      return;
    }

    try {
      // Check if external wallet is connected
      if (!isExternalWalletConnected || !externalWalletAddress) {
        // RainbowKit ConnectButton will handle opening the modal
        return;
      }

      // Sign SIWE message to authorize custodial wallet (creates session cookie)
      const success = await signIn();

      if (success) {
        setBetError(null); // Clear any previous errors
      } else {
        setBetError("Sign-in failed. Please try again.");
      }
    } catch (error) {
      setBetError(error instanceof Error ? error.message : "Sign-in failed");
    }
  };

  const isDisabled = isPlacingBet || isPlacingBetViaWallet;

  const getButtonText = () => {
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
            {/* Sign In / Wallet Button */}
            {isAuthLoading ? (
              // Show loading state while checking authentication
              <button
                disabled
                className="border-2 border-white rounded-lg px-4 py-1 h-8 animate-pulse cursor-wait"
              >
                <span
                  className="text-base text-white leading-[0.9]"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  Loading...
                </span>
              </button>
            ) : !isAuthenticated || isSigningOut ? (
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openChainModal,
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
                        if (isSigningOut) return;
                        if (
                          !connected ||
                          !externalWalletAddress ||
                          !isExternalWalletConnected
                        ) {
                          connect({ connector: connectors[0] });
                        } else if (chain.unsupported) {
                          openChainModal();
                        } else {
                          // Trigger SIWE sign in
                          handleSignIn();
                        }
                      }}
                      disabled={isSigningOut}
                      className={`border-2 border-white rounded-lg px-4 py-1 h-8 hover:bg-white/10 transition-colors ${
                        isSigningOut ? "animate-pulse cursor-not-allowed" : ""
                      }`}
                    >
                      <span
                        className="text-base text-white leading-[0.9]"
                        style={{ fontFamily: "var(--font-lilita-one)" }}
                      >
                        {isSigningOut
                          ? "Signing Out..."
                          : !connected ||
                            !externalWalletAddress ||
                            !isExternalWalletConnected
                          ? "Connect Wallet"
                          : chain.unsupported
                          ? "Wrong Network"
                          : isSigning
                          ? "Signing..."
                          : "Sign In"}
                      </span>
                    </button>
                  );
                }}
              </ConnectButton.Custom>
            ) : (
              <div className="relative" ref={walletDropdownRef}>
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className={cn(
                    `border-2 border-white rounded-lg px-[10px] py-[10px] h-[38px] flex items-center gap-[4px] hover:bg-white/10 transition-colors`,
                    showWalletDropdown &&
                      "bg-white hover:bg-white text-[#2574ff]!"
                  )}
                >
                  <Image
                    src={showWalletDropdown ? "/eth-active.svg" : "/eth.svg"}
                    alt="ETH"
                    width={18}
                    height={18}
                  />
                  <span
                    className={cn(
                      "text-base leading-[0.9] text-white",
                      showWalletDropdown &&
                        "text-[#2574ff]! hover:text-[#2574ff]!"
                    )}
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    {isBalanceLoading
                      ? "..."
                      : `$${balanceUsd < 0 ? "0.00" : balanceUsd.toFixed(2)}`}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform ${
                      showWalletDropdown
                        ? "rotate-180 text-[#2574ff]!"
                        : "text-white"
                    }`}
                  >
                    <path
                      d="M3.5 5.25L7 8.75L10.5 5.25"
                      stroke={showWalletDropdown ? "#2574ff" : "white"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu - Menu items */}
                <AnimatePresence>
                  {showWalletDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-[200px] bg-white border-2 border-black rounded-lg shadow-[0px_4px_0px_0px_#000000] z-50"
                    >
                      <div className="pt-[10px] pb-[12px] px-[10px] flex flex-col gap-[12px]">
                        {/* Wallet Address with Disconnect */}
                        <div className="bg-[rgba(0,0,0,0.06)] rounded-lg px-[6px] py-[8px] flex items-center justify-between">
                          <p
                            className="text-[16px] text-black leading-[0.9]"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            {custodialWallet
                              ? `${custodialWallet.slice(
                                  0,
                                  2
                                )}...${custodialWallet.slice(-6)}`
                              : "Loading..."}
                          </p>
                          <button
                            onClick={async () => {
                              setIsSigningOut(true);
                              await signOut();
                              setShowWalletDropdown(false);
                              setIsSigningOut(false);
                            }}
                            disabled={isSigningOut}
                            className="flex items-center justify-center disabled:opacity-50"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5.25 12.25H3.5C3.23478 12.25 2.98043 12.1446 2.79289 11.9571C2.60536 11.7696 2.5 11.5152 2.5 11.25V2.75C2.5 2.48478 2.60536 2.23043 2.79289 2.04289C2.98043 1.85536 3.23478 1.75 3.5 1.75H5.25M9.625 9.625L12.25 7L9.625 4.375M12.25 7H5.25"
                                stroke="#E9452D"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Add Funds */}
                        <button
                          onClick={() => {
                            if (!wallet || !isAuthenticated) {
                              return;
                            }
                            setShowFundingModal(true);
                            setShowWalletDropdown(false);
                          }}
                          disabled={
                            !wallet || !isAuthenticated || isInitialLoading
                          }
                          className="flex items-center gap-[8px] w-full disabled:opacity-50"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7 2.91667V11.0833M2.91667 7H11.0833"
                              stroke="black"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p
                            className="text-[16px] text-black leading-[1.2]"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            Add Funds
                          </p>
                        </button>

                        {/* Withdraw Funds */}
                        <button
                          onClick={() => {
                            if (!wallet || !isAuthenticated) {
                              return;
                            }
                            setShowWithdrawModal(true);
                            setShowWalletDropdown(false);
                          }}
                          disabled={
                            !wallet ||
                            !isAuthenticated ||
                            isInitialLoading ||
                            isWithdrawing
                          }
                          className="flex items-center gap-[8px] w-full disabled:opacity-50"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.0833 7C11.0833 7 9.33333 9.04167 7 9.04167C4.66667 9.04167 2.91667 7 2.91667 7M7 2.91667V9.04167M7 9.04167L5.25 7M7 9.04167L8.75 7"
                              stroke="black"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p
                            className="text-[16px] text-black leading-[1.2]"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            Withdraw Funds
                          </p>
                        </button>

                        {/* View Transactions */}
                        <button
                          onClick={() => {
                            setShowTransactionsSheet(true);
                            setShowWalletDropdown(false);
                          }}
                          className="flex items-center gap-[8px] w-full"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.0833 4.08333L7.58333 7.58333L5.83333 5.83333L2.91667 8.75M11.0833 4.08333H8.16667M11.0833 4.08333V7"
                              stroke="black"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p
                            className="text-[16px] text-black leading-[1.2]"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            View Trx
                          </p>
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
          {/* Visual/Game Area - Rive Animation */}
          <div className="relative bg-[#040c1a] rounded-xl overflow-hidden flex-1 min-h-[355px] border-2 border-black shadow-[0px_2px_0px_0px_#000000]">
            <AnimatePresence mode="wait">
              {/* Rive Idle State */}
              {currentAnimation === "idle" && (
                <motion.div
                  key={`idle-${animationKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <RiveIdle />
                </motion.div>
              )}

              {/* Rive Win Animation */}
              {currentAnimation === "win" && (
                <motion.div
                  key={`win-${animationKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <RiveWin />
                </motion.div>
              )}

              {/* Rive Lose Animation */}
              {currentAnimation === "lose" && (
                <motion.div
                  key={`lose-${animationKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <RiveLose />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated Banner */}
            <AnimatePresence>
              {showBanner && bannerData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                      transform: "rotate(6.35deg)",
                    }}
                  >
                    {/* Banner Background */}
                    <div
                      className={`absolute w-[120%] h-[124px] ${
                        bannerData.isWin ? "bg-[#1ec460]" : "bg-[#f0452c]"
                      }`}
                      style={{
                        boxShadow: bannerData.isWin
                          ? "0px 5px 0px 0px #063f1d"
                          : "0px 5px 0px 0px #902313",
                      }}
                    />

                    {/* Banner Text */}
                    <div
                      className="relative z-10 flex flex-col gap-[6px] items-center"
                      style={{
                        fontFamily: "var(--font-lilita-one)",
                      }}
                    >
                      <p
                        className="text-[40px] text-white leading-[0.9]"
                        style={{
                          textShadow: bannerData.isWin
                            ? "#063f1d 0px 2px 0px"
                            : "#721d11 0px 2px 0px",
                        }}
                      >
                        {bannerData.isWin ? "You Won" : "You Lost"}
                      </p>
                      <p
                        className="text-[40px] text-white leading-[0.9]"
                        style={{
                          textShadow: bannerData.isWin
                            ? "#063f1d 0px 2px 0px"
                            : "#721d11 0px 2px 0px",
                        }}
                      >
                        {bannerData.multiplier.toFixed(2)}x ({bannerData.amount}
                        )
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              <div
                className={`border-2 ${
                  parseFloat(betAmount || "0") > balanceUsd && balanceUsd >= 0.1
                    ? "border-[#e9452d]"
                    : "border-black"
                } rounded-xl h-[44px] flex items-center justify-between px-3 py-2`}
              >
                <div className="flex items-center gap-0">
                  <span
                    className={`text-base leading-[0.9] font-bold ${
                      parseFloat(betAmount || "0") > balanceUsd &&
                      balanceUsd >= 0.1
                        ? "text-[#e9452d]"
                        : "text-black"
                    }`}
                  >
                    $
                  </span>
                  <input
                    type="text"
                    className={`text-base leading-[0.9] bg-transparent focus:outline-none focus:ring-0 ${
                      parseFloat(betAmount || "0") > balanceUsd &&
                      balanceUsd >= 0.1
                        ? "text-[#e9452d]"
                        : "text-black"
                    }`}
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
                      className={`border-2 ${
                        parseFloat(betAmount || "0") > balanceUsd &&
                        balanceUsd >= 0.1
                          ? "border-[#e9452d]"
                          : "border-black"
                      } rounded-lg h-[24px] px-[6px] py-[8px] flex items-center justify-center disabled:opacity-50`}
                    >
                      <p
                        className={`text-[12px] tracking-[-1px] leading-[0.9] ${
                          parseFloat(betAmount || "0") > balanceUsd &&
                          balanceUsd >= 0.1
                            ? "text-[#e9452d]"
                            : "text-black"
                        }`}
                        style={{ fontFamily: "var(--font-lilita-one)" }}
                      >
                        {item.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              {/* Insufficient balance error message */}
              {parseFloat(betAmount || "0") > balanceUsd &&
                balanceUsd >= 0.1 && (
                  <div className="flex items-center gap-[6px]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="#e9452d"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path
                        d="M8 5V9M8 11V11.5"
                        stroke="#e9452d"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <p
                      className="text-[#e9452d] text-[16px] leading-[0.9]"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      You don&apos;t have enough balance
                    </p>
                  </div>
                )}
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
                isAuthLoading ||
                isPlacingBet ||
                isPlacingBetViaWallet ||
                isBalanceLoading ||
                isSigning ||
                isSigningOut ||
                isInitialLoading ||
                (!wallet && isAuthenticated)
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
                {!isAuthenticated ? (
                  "Sign In to Play"
                ) : isAuthLoading ? (
                  "Signing..."
                ) : isPlacingBet ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {getButtonText()}
                  </span>
                ) : balanceUsd < 0.1 ? (
                  "Fund Wallet to Play"
                ) : parseFloat(betAmount || "0") > balanceUsd ? (
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
          </motion.div>

          {/* View All Bets Button */}
          <button
            onClick={() => setIsActivityDrawerOpen(true)}
            className="w-full bg-white border-2 border-black rounded-xl h-[43px] px-[12px] py-[10px] flex items-center justify-center gap-[8px] shadow-[0px_2px_0px_0px_#000000] active:shadow-none active:translate-y-[2px] transition-all hover:bg-gray-50"
          >
            <p
              className="text-[16px] text-black uppercase leading-normal"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              View All Bets
            </p>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 10L8 6L12 10"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
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
      <FundingModal
        isOpen={showFundingModal && !!wallet}
        onClose={() => setShowFundingModal(false)}
        walletAddress={wallet?.address || ""}
        currentBalance={balanceEth ? balanceEth.toString() : "0"}
        userId={userId}
        onSuccess={handleRefreshBalance}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal && !!wallet}
        onClose={() => setShowWithdrawModal(false)}
        walletAddress={wallet?.address || ""}
        currentBalance={balanceEth ? balanceEth.toString() : "0"}
        onWithdraw={handleWithdraw}
        onSuccess={handleRefreshBalance}
      />

      {/* Transactions Sheet */}
      <TransactionsSheet
        isOpen={showTransactionsSheet}
        onClose={() => setShowTransactionsSheet(false)}
        userId={userId}
      />
    </div>
  );
}
