import { useWatchContractEvent, usePublicClient, useBlockNumber } from "wagmi";
import { LIMBO_GAME_ABI } from "@/lib/contract/abi";
import { CONTRACT_ADDRESS, CHAIN } from "@/lib/contract/config";
import { useState, useCallback, useRef, useEffect } from "react";
import { ResolvedBet } from "@/lib/contract/types";

/**
 * DEBUG VERSION with extensive logging
 * Optimized hook that watches ONLY BetResolved events filtered by player address
 * Uses indexed topic filtering for immediate results without needing to track pending bets
 */
export function useOptimizedBetEventsDebug(userAddress?: string) {
  const [resolvedBets, setResolvedBets] = useState<ResolvedBet[]>([]);
  const [latestBet, setLatestBet] = useState<ResolvedBet | null>(null);
  const processedRequestIds = useRef(new Set<string>());
  const publicClient = usePublicClient({ chainId: CHAIN.id });
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    chainId: CHAIN.id,
  });

  // Log connection status
  useEffect(() => {
    console.log("🔌 Hook initialized with:", {
      userAddress,
      contractAddress: CONTRACT_ADDRESS,
      chainId: CHAIN.id,
      publicClientConnected: !!publicClient,
      currentBlock: blockNumber?.toString(),
    });
  }, [userAddress, publicClient, blockNumber]);

  // Watch BetResolved events - filtered by player address at the RPC level
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIMBO_GAME_ABI,
    eventName: "BetResolved",
    chainId: CHAIN.id,
    // Use args to filter by indexed parameters (topic[2] = player address)
    args: userAddress ? { player: userAddress } : undefined,
    onLogs(logs) {
      console.log(
        "📡 BetResolved event received (filtered by player):",
        logs.length,
        "logs"
      );
      console.log("📋 Raw logs:", logs);

      logs.forEach((log) => {
        console.log("🔍 Processing log:", log);

        const {
          requestId,
          player,
          betAmount,
          targetMultiplier,
          limboMultiplier,
          win,
          payout,
          timestamp,
        } = log.args;

        const reqId = requestId as bigint;
        const reqIdStr = reqId.toString();

        console.log("🎰 BetResolved:", {
          requestId: reqIdStr,
          player,
          betAmount: betAmount?.toString(),
          targetMultiplier: targetMultiplier?.toString(),
          limboMultiplier: limboMultiplier?.toString(),
          win,
          payout: payout?.toString(),
          timestamp: timestamp?.toString(),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber?.toString(),
        });

        // Prevent duplicate processing
        if (processedRequestIds.current.has(reqIdStr)) {
          console.log("⚠️ Already processed this bet, skipping");
          return;
        }
        processedRequestIds.current.add(reqIdStr);

        const resolved: ResolvedBet = {
          requestId: reqId,
          player: player as string,
          amount: betAmount as bigint,
          targetMultiplier: Number(targetMultiplier),
          limboMultiplier: limboMultiplier as bigint,
          win: win as boolean,
          payout: payout as bigint,
          timestamp: Number(timestamp) * 1000, // Convert to milliseconds
          txHash: log.transactionHash,
        };

        console.log("✅ Bet resolved! Result:", {
          win: resolved.win ? "🎉 WIN" : "😢 LOSE",
          limboMultiplier: Number(resolved.limboMultiplier) / 100,
          targetMultiplier: resolved.targetMultiplier / 100,
          payout: resolved.payout.toString(),
        });

        // Update latest bet (for immediate UI response)
        console.log("📤 Setting latestBet state");
        setLatestBet(resolved);

        // Add to history
        setResolvedBets((prev) => {
          const exists = prev.some((b) => b.requestId === resolved.requestId);
          if (exists) {
            console.log("⚠️ Bet already in history, skipping");
            return prev;
          }
          console.log("📝 Adding to history");
          return [resolved, ...prev].slice(0, 50);
        });
      });
    },
    onError(error) {
      console.error("❌ useWatchContractEvent error:", error);
    },
  });

  // Manual fetch of past events for debugging
  const fetchPastEvents = useCallback(
    async (fromBlock?: bigint) => {
      if (!publicClient) {
        console.error("❌ No public client available");
        return;
      }

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const from = fromBlock ?? currentBlock - BigInt(100); // Last 100 blocks

        console.log("🔍 Fetching past BetResolved events:", {
          from: from.toString(),
          to: currentBlock.toString(),
          address: CONTRACT_ADDRESS,
          player: userAddress,
        });

        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: LIMBO_GAME_ABI.find((item) => item.name === "BetResolved"),
          args: userAddress ? { player: userAddress } : undefined,
          fromBlock: from,
          toBlock: currentBlock,
        });

        console.log("📦 Found past events:", logs.length);
        logs.forEach((log) => {
          console.log("📜 Past event:", {
            requestId: log.args.requestId?.toString(),
            player: log.args.player,
            win: log.args.win,
            blockNumber: log.blockNumber?.toString(),
          });
        });
      } catch (error) {
        console.error("❌ Error fetching past events:", error);
      }
    },
    [publicClient, userAddress]
  );

  const clearLatestBet = useCallback(() => {
    console.log("🧹 Clearing latest bet");
    setLatestBet(null);
  }, []);

  const clearHistory = useCallback(() => {
    console.log("🧹 Clearing bet history");
    setResolvedBets([]);
    processedRequestIds.current.clear();
  }, []);

  const clearAll = useCallback(() => {
    console.log("🧹 Clearing all bets");
    setLatestBet(null);
    setResolvedBets([]);
    processedRequestIds.current.clear();
  }, []);

  return {
    latestBet, // Most recent bet result (for immediate display)
    resolvedBets, // Full history of resolved bets
    clearLatestBet, // Clear just the latest bet
    clearHistory, // Clear history only
    clearAll, // Clear everything
    fetchPastEvents, // Manual fetch for debugging
    blockNumber, // Current block number
  };
}
