"use client";

import { useState, useEffect } from "react";
import { useUserBets } from "@/hooks/usePonderBets";
import Image from "next/image";
import { Button } from "../ui/Button";

interface ActivityIconProps {
  userAddress: string | null;
  onClick?: () => void;
}

export function ActivityIcon({ userAddress, onClick }: ActivityIconProps) {
  const { bets, stats } = useUserBets(userAddress);
  const [hasNewActivity, setHasNewActivity] = useState(false);

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

  if (!userAddress) {
    return null;
  }

  const totalBets = stats?.totalBets || 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2 text-gray-600 hover:text-black justify-center"
      title="View your betting activity"
    >
      <Image src="/activity.svg" alt="Activity" width={16} height={16} />

      {/* Notification dot */}
      {hasNewActivity && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}

      {/* Bet count badge */}
      {totalBets > 0 && (
        <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalBets > 99 ? "99+" : totalBets}
        </div>
      )}
    </Button>
  );
}
