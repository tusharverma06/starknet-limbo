"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ModalWrapper } from "./ModalWrapper";
import sdk from "@farcaster/miniapp-sdk";
import Image from "next/image";

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string | null;
  userId?: string | null;
}

interface BetDisplay {
  id: string;
  playerId: string;
  playerName: string | null;
  playerPfp: string | null;
  wager: string;
  payout: string | null;
  limboMultiplier: number | null;
  targetMultiplier: number;
  outcome: "win" | "loss" | null;
  status:
    | "pending"
    | "pending_payout"
    | "resolved"
    | "complete"
    | "processing"
    | "paid_out";
  createdAt: string;
  resolvedAt: string | null;
  txHash: string | null;
}

export function ActivityDrawer({
  isOpen,
  onClose,
  userAddress,
  userId,
}: ActivityDrawerProps) {
  const [activeTab, setActiveTab] = useState<"my-bets" | "all-bets">("my-bets");

  // Fetch my bets (user's bets only)
  const {
    data: myBetsData,
    isLoading: isLoadingMyBets,
    refetch: refetchMyBets,
  } = useQuery<{ bets: BetDisplay[]; count: number }>({
    queryKey: ["myBets", userAddress],
    queryFn: async () => {
      if (!userAddress) {
        return { bets: [], count: 0 };
      }

      const response = await fetch(
        `/api/wallet/bet-history?playerId=${userAddress}&limit=50`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch my bets");
      }

      const data = await response.json();
      return data;
    },
    enabled: !!userAddress && isOpen && activeTab === "my-bets",
    refetchOnWindowFocus: false,
    staleTime: 10000,
  });

  // Fetch all bets (all users' bets)
  const {
    data: allBetsData,
    isLoading: isLoadingAllBets,
    refetch: refetchAllBets,
  } = useQuery<{ bets: BetDisplay[]; count: number }>({
    queryKey: ["allBets"],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/bet-history?limit=100`, {
        credentials: "include", // Required for cookies in cross-origin contexts
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all bets");
      }

      const data = await response.json();
      return data;
    },
    enabled: isOpen && activeTab === "all-bets",
    refetchOnWindowFocus: false,
    staleTime: 3000, // Refresh more frequently for all bets
    refetchInterval: activeTab === "all-bets" ? 5000 : false, // Auto-refresh every 5s when viewing all bets
  });

  const myBets: BetDisplay[] = myBetsData?.bets || [];
  const allBets: BetDisplay[] = allBetsData?.bets || [];
  const currentBets = activeTab === "my-bets" ? myBets : allBets;
  const isLoadingBets =
    activeTab === "my-bets" ? isLoadingMyBets : isLoadingAllBets;

  // Refetch data when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (activeTab === "my-bets") {
        refetchMyBets();
      } else {
        refetchAllBets();
      }
    }
  }, [isOpen, activeTab, refetchMyBets, refetchAllBets]);

  // Helper function to format USD values from database amount
  const formatUSD = (amount: string) => {
    try {
      // The backend returns USD amounts directly, not in wei
      const value = parseFloat(amount);
      return `$${value.toFixed(2)}`;
    } catch {
      return "$0.00";
    }
  };

  // Helper function to format wallet address
  const formatWalletAddress = (playerId: string) => {
    // Format wallet address: A7...7tT74
    return `${playerId.slice(0, 2)}...${playerId.slice(-5)}`;
  };

  // Helper function to calculate PNL
  const calculatePNL = (bet: BetDisplay) => {
    if (bet.outcome === "win" && bet.payout) {
      return {
        value: `+${formatUSD(bet.payout)}`,
        color: "text-green-500",
      };
    } else {
      // For losses or any non-win outcome, show negative wager in red
      return {
        value: `-${formatUSD(bet.wager)}`,
        color: "text-red-500",
      };
    }
  };

  // Helper function to handle verify redirect
  const handleVerify = async (betId: string) => {
    await sdk.actions.openUrl(
      `${process.env.NEXT_PUBLIC_APP_URL}/verify?betId=${betId}`
    );
  };

  if (!userAddress) {
    return null;
  }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} variant="bottom">
      <div className="h-[90vh]  shadow-xl flex flex-col rounded-t-[12px]">
        {/* Close Button */}
        <div className="flex justify-end p-2">
          <button
            onClick={onClose}
            className="bg-white border-2 border-white rounded-full w-[34px] h-[34px] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
          >
            <X className="w-[14px] h-[14px] text-black" />
          </button>
        </div>

        {/* Table Container */}
        <div className="flex-1 flex flex-col border-2 border-black rounded-[12px] mx-2 mb-2 overflow-hidden bg-white">
          {/* Tabs Header */}
          <div className="bg-[#2574ff] border-b border-black flex">
            <button
              onClick={() => setActiveTab("my-bets")}
              className={`flex-1 h-[50px] flex items-center justify-center border-r border-black transition-colors ${
                activeTab === "my-bets" ? "border-b-[3px] border-b-black" : ""
              }`}
            >
              <p
                className={`text-[16px] uppercase leading-normal ${
                  activeTab === "my-bets" ? "text-white" : "text-white"
                }`}
                style={{
                  fontFamily: "var(--font-lilita-one)",
                  textShadow:
                    activeTab === "my-bets" ? "0px 1.6px 0px #000000" : "none",
                }}
              >
                My Bets
              </p>
            </button>
            <button
              onClick={() => setActiveTab("all-bets")}
              className={`flex-1 h-[50px] flex items-center justify-center transition-colors ${
                activeTab === "all-bets" ? "border-b-[3px] border-b-black" : ""
              }`}
            >
              <p
                className={`text-[16px] leading-[0.9] text-center ${
                  activeTab === "all-bets" ? "text-white" : "text-white"
                }`}
                style={{
                  fontFamily: "var(--font-lilita-one)",
                  textShadow:
                    activeTab === "all-bets" ? "0px 1.6px 0px #000000" : "none",
                }}
              >
                All Bets
              </p>
            </button>
          </div>

          {/* Table Header */}
          <div className="bg-white border-b border-black flex">
            {activeTab === "all-bets" ? (
              <>
                {/* All Bets: Player, PNL, Multiplier, Verify */}
                <div
                  className="flex-1 flex items-center justify-center p-3"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.04) 100%)",
                  }}
                >
                  <p
                    className="text-base text-black/40 text-center leading-tight"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Player
                  </p>
                </div>
                <div
                  className="w-20 flex items-center justify-center p-3"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.04) 100%)",
                  }}
                >
                  <p
                    className="text-base text-black/40 text-center leading-tight"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    PNL
                  </p>
                </div>
                <div
                  className="w-20 flex items-center justify-center p-3"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.04) 100%)",
                  }}
                >
                  <p
                    className="text-base text-black/40 text-center leading-tight"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Multiplier
                  </p>
                </div>
                <div
                  className="w-20 flex items-center justify-center p-3"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.04) 100%)",
                  }}
                >
                  <p
                    className="text-base text-black/40 text-center leading-tight"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Verify
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* My Bets: Bet, Multiplier, Payout, Verify */}
                <div
                  className="flex-1 flex items-center justify-center p-3"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.04) 100%)",
                  }}
                >
                  <p
                    className="text-base text-black/40 text-center leading-tight"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    $ Bet
                  </p>
                </div>
                <div
                  className="flex-1 flex items-center justify-center p-3"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.04) 100%)",
                  }}
                >
                  <p
                    className="text-base text-black/40 text-center leading-tight"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Multiplier
                  </p>
                </div>
                <div
                  className="flex-1 flex items-center justify-center p-3"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.04) 100%)",
                  }}
                >
                  <p
                    className="text-base text-black/40 text-center leading-tight"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Payout
                  </p>
                </div>
                <div
                  className="w-20 flex items-center justify-center p-3"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.04) 100%)",
                  }}
                >
                  <p
                    className="text-base text-black/40 text-center leading-tight"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Verify
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Table Body - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingBets ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              </div>
            ) : currentBets.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <p className="text-sm">
                  {activeTab === "my-bets"
                    ? "No bets yet. Place your first bet!"
                    : "No bets to display"}
                </p>
              </div>
            ) : (
              currentBets.map((bet, index) => {
                const pnl = calculatePNL(bet);
                return (
                  <div
                    key={bet.id}
                    className={`flex border-b border-black ${
                      index === currentBets.length - 1 ? "" : ""
                    }`}
                  >
                    {activeTab === "all-bets" ? (
                      <>
                        {/* Player (PFP + Name) */}
                        <div className="flex-1 bg-white border-r border-black/10 flex items-center gap-2 p-3">
                          {bet.playerPfp ? (
                            <img
                              src={bet.playerPfp}
                              alt={bet.playerName || "Player"}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                {bet.playerName?.[0]?.toUpperCase() || "?"}
                              </span>
                            </div>
                          )}
                          <p
                            className="text-base text-black leading-tight truncate"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            {bet.playerName ||
                              formatWalletAddress(bet.playerId)}
                          </p>
                        </div>

                        {/* PNL */}
                        <div className="w-20 bg-white border-r border-black/10 flex items-center justify-center p-3">
                          <p
                            className={`text-base text-center leading-tight ${pnl.color}`}
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            {pnl.value}
                          </p>
                        </div>

                        {/* Multiplier */}
                        <div className="w-20 bg-white border-r border-black/10 flex items-center justify-center p-3">
                          <p
                            className="potential-payout"
                            style={{
                              fontFamily: "var(--font-lilita-one)",
                              textShadow: "0px 1px 0px #000000",
                            }}
                          >
                            {bet.limboMultiplier
                              ? `${(bet.limboMultiplier / 100).toFixed(2)}x`
                              : bet.targetMultiplier
                              ? `${(bet.targetMultiplier / 100).toFixed(2)}x`
                              : "—"}
                          </p>
                        </div>

                        {/* Verify */}
                        <div className="w-20 bg-white flex items-center justify-center p-3">
                          <button
                            onClick={() => handleVerify(bet.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm underline cursor-pointer"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            <Image
                              src="/redirect.svg"
                              alt="Verify"
                              width={16}
                              height={16}
                            />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Bet Amount */}
                        <div className="flex-1 bg-white border-r border-black/10 flex items-center justify-center p-3">
                          <p
                            className="text-base text-black text-center leading-tight"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            {formatUSD(bet.wager)}
                          </p>
                        </div>

                        {/* Multiplier */}
                        <div className="flex-1 bg-white border-r border-black/10 flex items-center justify-center p-3">
                          <p
                            className="potential-payout"
                            style={{
                              fontFamily: "var(--font-lilita-one)",
                              textShadow: "0px 1px 0px #000000",
                            }}
                          >
                            {bet.limboMultiplier
                              ? `${(bet.limboMultiplier / 100).toFixed(2)}x`
                              : bet.targetMultiplier
                              ? `${(bet.targetMultiplier / 100).toFixed(2)}x`
                              : "—"}
                          </p>
                        </div>

                        {/* Payout */}
                        <div className="flex-1 bg-white border-r border-black/10 flex items-center justify-center p-3">
                          <p
                            className="text-base text-black text-center leading-tight"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            {bet.payout ? formatUSD(bet.payout) : "$0.00"}
                          </p>
                        </div>

                        {/* Verify */}
                        <div className="w-20 bg-white flex items-center justify-center p-3">
                          <button
                            onClick={() => handleVerify(bet.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm underline cursor-pointer"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            <Image
                              src="/redirect.svg"
                              alt="Verify"
                              width={16}
                              height={16}
                            />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
