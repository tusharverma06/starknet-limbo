"use client";

import { X, Trophy, Medal, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ModalWrapper } from "./ModalWrapper";
import Image from "next/image";

interface LeaderboardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  privyUserId: string | null;
}

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  points: number;
  referrals: number;
  isCurrentUser?: boolean;
}

export function LeaderboardDrawer({
  isOpen,
  onClose,
  privyUserId,
}: LeaderboardDrawerProps) {
  const { data, isLoading } = useQuery<{
    leaderboard: LeaderboardEntry[];
    userRank: number | null;
    total: number;
  }>({
    queryKey: ["leaderboard", privyUserId],
    queryFn: async () => {
      const url = privyUserId
        ? `/api/leaderboard?privyUserId=${privyUserId}&limit=100`
        : `/api/leaderboard?limit=100`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      return response.json();
    },
    enabled: isOpen,
    refetchOnWindowFocus: false,
    staleTime: 10000,
  });

  const getRankIcon = (rank: number, isUser?: boolean) => {
    if (rank === 1)
      return (
        <Trophy
          className={`w-5 h-5 ${isUser ? "text-white" : "text-yellow-500"}`}
        />
      );
    if (rank === 2)
      return (
        <Medal
          className={`w-5 h-5 ${isUser ? "text-white" : "text-gray-400"}`}
        />
      );
    if (rank === 3)
      return (
        <Award
          className={`w-5 h-5 ${isUser ? "text-white" : "text-amber-600"}`}
        />
      );
    return null;
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-t-3xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black bg-[#2574ff]">
          <h2
            className="text-[24px] text-white leading-[1]"
            style={{
              fontFamily: "var(--font-lilita-one)",
              textShadow: "0px 2px 0px #000000",
            }}
          >
            Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* User Rank Banner */}
        {privyUserId && data?.userRank && (
          <div className="bg-[#cfd9ff] border-b-2 border-black p-4">
            <div className="flex items-center justify-between">
              <p
                className="text-[16px] text-black"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                Your Rank: #{data.userRank}
              </p>
              <p
                className="text-[14px] text-gray-600"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                {data.total} Players
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2574ff] border-t-transparent" />
            </div>
          ) : data?.leaderboard && data.leaderboard.length > 0 ? (
            <div className="space-y-2 relative">
              {data.leaderboard.map((entry, i) => (
                <div
                  key={`${entry.rank}-${entry.displayName}-${i}`}
                  className={` border-2 border-black rounded-xl p-3 shadow-[0px_2px_0px_0px_#000000] ${
                    entry.isCurrentUser
                      ? "bg-[#2574ff] sticky -top-1"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(
                        entry.rank,
                        entry.isCurrentUser
                      ) || (
                        <span
                          className={`text-[18px] ${
                            entry.isCurrentUser
                              ? "text-white"
                              : "text-gray-600"
                          }`}
                          style={{ fontFamily: "var(--font-lilita-one)" }}
                        >
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    {entry.avatarUrl ? (
                      <Image
                        src={entry.avatarUrl}
                        alt={entry.displayName}
                        width={40}
                        height={40}
                        loader={({ src }) => src}
                        className="rounded-full object-cover w-10 h-10 border-2 border-black"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center ${
                          entry.isCurrentUser
                            ? "bg-[#fff]"
                            : "bg-[#2574ff]"
                        }`}
                      >
                        <span
                          className={`text-[16px] ${
                            entry.isCurrentUser
                              ? "text-white"
                              : "text-black"
                          }`}
                          style={{ fontFamily: "var(--font-lilita-one)" }}
                        >
                          {(entry.displayName || "?")[0].toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* User Info */}
                    <div className="flex-1">
                      <p
                        className={`text-[16px] ${
                          entry.isCurrentUser
                            ? "text-white/90"
                            : "text-black"
                        } leading-[1.2]`}
                        style={{ fontFamily: "var(--font-lilita-one)" }}
                      >
                        {entry.displayName}
                      </p>
                      <p
                        className={`text-[12px] ${
                          entry.isCurrentUser
                            ? "text-white/90"
                            : "text-gray-600"
                        }`}
                      >
                        {entry.referrals} referrals
                      </p>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p
                        className={`text-[20px] ${
                          entry.isCurrentUser
                            ? "text-white/90"
                            : "text-[#2574ff]"
                        } leading-[1]`}
                        style={{ fontFamily: "var(--font-lilita-one)" }}
                      >
                        {entry.points.toLocaleString()}
                      </p>
                      <p
                        className={`text-[12px] ${
                          entry.isCurrentUser
                            ? "text-white/90"
                            : "text-gray-600"
                        }`}
                      >
                        points
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-600">No players yet</p>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
