import { useWatchContractEvent } from "wagmi";
import { LIMBO_GAME_ABI } from "@/lib/contract/abi";
import { CONTRACT_ADDRESS, CHAIN } from "@/lib/contract/config";
import { useState, useCallback, useRef, useEffect } from "react";
import { PendingBet, ResolvedBet } from "@/lib/contract/types";

const PENDING_BET_TIMEOUT = 5 * 60 * 1000; // 5 minutes timeout for stale bets

export function useBetEvents(userAddress?: string) {
  const [pendingBets, setPendingBets] = useState<PendingBet[]>([]);
  const [resolvedBets, setResolvedBets] = useState<ResolvedBet[]>([]);
  const processedRequestIds = useRef(new Set<string>());

  // Auto-cleanup stale pending bets (timeout after 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPendingBets((prev) => {
        const filtered = prev.filter(
          (bet) => now - bet.timestamp < PENDING_BET_TIMEOUT
        );
        if (filtered.length !== prev.length) {
          console.log(
            `🧹 Cleaned up ${prev.length - filtered.length} stale pending bets`
          );
        }
        return filtered;
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Watch BetPlaced events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIMBO_GAME_ABI,
    eventName: "BetPlaced",
    chainId: CHAIN.id,
    onLogs(logs) {
      console.log("📡 BetPlaced event received:", logs.length, "logs");
      logs.forEach((log) => {
        const { requestId, player, amount, targetMultiplier, timestamp } = (
          log as unknown as {
            args: {
              requestId: bigint;
              player: string;
              amount: bigint;
              targetMultiplier: number;
              timestamp: number;
            };
          }
        ).args;
        console.log("🎲 BetPlaced:", {
          requestId: requestId?.toString(),
          player,
          amount: amount?.toString(),
          targetMultiplier: targetMultiplier?.toString(),
          txHash: log.transactionHash,
        });

        // Filter by user if address provided
        if (
          userAddress &&
          player?.toLowerCase() !== userAddress.toLowerCase()
        ) {
          console.log("⏭️ Skipping bet from other player");
          return;
        }

        const reqId = requestId as bigint;
        const reqIdStr = reqId.toString();

        // Check if already processed (duplicate prevention)
        if (processedRequestIds.current.has(`placed-${reqIdStr}`)) {
          console.log("⚠️ BetPlaced already processed, skipping");
          return;
        }
        processedRequestIds.current.add(`placed-${reqIdStr}`);

        const bet: PendingBet = {
          requestId: reqId,
          player: player as string,
          amount: amount as bigint,
          targetMultiplier: Number(targetMultiplier),
          timestamp: Number(timestamp) * 1000, // Convert to milliseconds
          txHash: log.transactionHash || "",
        };

        console.log("✅ Adding pending bet:", {
          ...bet,
          requestId: bet.requestId.toString(),
          amount: bet.amount.toString(),
        });

        setPendingBets((prev) => {
          // Check for duplicates by requestId
          const exists = prev.some((b) => b.requestId === bet.requestId);
          if (exists) {
            console.log("⚠️ Bet with this requestId already pending, skipping");
            return prev;
          }
          return [bet, ...prev].slice(0, 10);
        });
      });
    },
  });

  // Watch BetResolved events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIMBO_GAME_ABI,
    eventName: "BetResolved",
    chainId: CHAIN.id,
    onLogs(logs) {
      console.log("📡 BetResolved event received:", logs.length, "logs");
      logs.forEach((log) => {
        const {
          requestId,
          player,
          betAmount,
          targetMultiplier,
          limboMultiplier,
          win,
          payout,
          timestamp,
        } = (
          log as unknown as {
            args: {
              requestId: bigint;
              player: string;
              betAmount: bigint;
              targetMultiplier: bigint;
              limboMultiplier: bigint;
              win: boolean;
              payout: bigint;
              timestamp: number;
            };
          }
        ).args;
        console.log("🎰 BetResolved:", {
          requestId: requestId?.toString(),
          player,
          betAmount: betAmount?.toString(),
          limboMultiplier: limboMultiplier?.toString(),
          win,
          payout: payout?.toString(),
          txHash: log.transactionHash,
        });

        // Filter by user if address provided
        if (
          userAddress &&
          player?.toLowerCase() !== userAddress.toLowerCase()
        ) {
          console.log("⏭️ Skipping resolved bet from other player");
          return;
        }

        const reqId = requestId as bigint;
        const reqIdStr = reqId.toString();

        // Prevent duplicate processing
        if (processedRequestIds.current.has(`resolved-${reqIdStr}`)) {
          console.log("⚠️ BetResolved already processed, skipping");
          return;
        }
        processedRequestIds.current.add(`resolved-${reqIdStr}`);

        const resolved: ResolvedBet = {
          requestId: reqId,
          player: player as string,
          amount: betAmount as bigint,
          targetMultiplier: Number(targetMultiplier),
          limboMultiplier: limboMultiplier as bigint,
          win: win as boolean,
          payout: payout as bigint,
          timestamp: Number(timestamp) * 1000, // Convert to milliseconds
          txHash: log.transactionHash || "",
        };

        console.log("✅ Adding resolved bet:", {
          ...resolved,
          requestId: resolved.requestId.toString(),
          amount: resolved.amount.toString(),
          limboMultiplier: resolved.limboMultiplier.toString(),
          payout: resolved.payout.toString(),
        });

        setResolvedBets((prev) => {
          // Check for duplicates by requestId
          const exists = prev.some((b) => b.requestId === resolved.requestId);
          if (exists) {
            console.log(
              "⚠️ Bet with this requestId already resolved, skipping"
            );
            return prev;
          }
          return [resolved, ...prev].slice(0, 50);
        });

        // Remove matching pending bet by requestId
        setPendingBets((prev) => {
          const remaining = prev.filter((bet) => bet.requestId !== reqId);
          if (remaining.length !== prev.length) {
            console.log(`🗑️ Removed pending bet with requestId: ${reqIdStr}`);
          } else {
            console.warn(
              `⚠️ No matching pending bet found for requestId: ${reqIdStr}`
            );
          }
          return remaining;
        });
      });
    },
  });

  const clearBets = useCallback(() => {
    console.log("🧹 Clearing all bets");
    setPendingBets([]);
    setResolvedBets([]);
    processedRequestIds.current.clear();
  }, []);

  const clearPendingBets = useCallback(() => {
    console.log("🧹 Clearing all pending bets (manual reset)");
    setPendingBets([]);
  }, []);

  return {
    pendingBets,
    resolvedBets,
    clearBets,
    clearPendingBets,
    hasPendingBet: pendingBets.length > 0,
  };
}
