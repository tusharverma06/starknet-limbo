import { useWatchContractEvent } from 'wagmi';
import { LIMBO_GAME_ABI } from '@/lib/contract/abi';
import { CONTRACT_ADDRESS, CHAIN } from '@/lib/contract/config';
import { useState, useCallback, useRef } from 'react';
import { ResolvedBet } from '@/lib/contract/types';

/**
 * Optimized hook that watches ONLY BetResolved events filtered by player address
 * Uses indexed topic filtering for immediate results without needing to track pending bets
 */
export function useOptimizedBetEvents(userAddress?: string) {
  const [resolvedBets, setResolvedBets] = useState<ResolvedBet[]>([]);
  const [latestBet, setLatestBet] = useState<ResolvedBet | null>(null);
  const processedRequestIds = useRef(new Set<string>());

  // Watch BetResolved events - filtered by player address at the RPC level
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIMBO_GAME_ABI,
    eventName: 'BetResolved',
    chainId: CHAIN.id,
    // Use args to filter by indexed parameters (topic[2] = player address)
    args: userAddress ? { player: userAddress } : undefined,
    onLogs(logs) {
      console.log('📡 BetResolved event received (filtered by player):', logs.length, 'logs');

      logs.forEach((log) => {
        const { requestId, player, betAmount, targetMultiplier, limboMultiplier, win, payout, timestamp } =
          log.args;

        const reqId = requestId as bigint;
        const reqIdStr = reqId.toString();

        console.log('🎰 BetResolved:', {
          requestId: reqIdStr,
          player,
          betAmount: betAmount?.toString(),
          targetMultiplier: targetMultiplier?.toString(),
          limboMultiplier: limboMultiplier?.toString(),
          win,
          payout: payout?.toString(),
          txHash: log.transactionHash,
        });

        // Prevent duplicate processing
        if (processedRequestIds.current.has(reqIdStr)) {
          console.log('⚠️ Already processed this bet, skipping');
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

        console.log('✅ Bet resolved! Result:', {
          win: resolved.win ? '🎉 WIN' : '😢 LOSE',
          limboMultiplier: Number(resolved.limboMultiplier) / 100,
          targetMultiplier: resolved.targetMultiplier / 100,
          payout: resolved.payout.toString(),
        });

        // Update latest bet (for immediate UI response)
        setLatestBet(resolved);

        // Add to history
        setResolvedBets((prev) => {
          const exists = prev.some((b) => b.requestId === resolved.requestId);
          if (exists) {
            console.log('⚠️ Bet already in history, skipping');
            return prev;
          }
          return [resolved, ...prev].slice(0, 50);
        });
      });
    },
  });

  const clearLatestBet = useCallback(() => {
    console.log('🧹 Clearing latest bet');
    setLatestBet(null);
  }, []);

  const clearHistory = useCallback(() => {
    console.log('🧹 Clearing bet history');
    setResolvedBets([]);
    processedRequestIds.current.clear();
  }, []);

  const clearAll = useCallback(() => {
    console.log('🧹 Clearing all bets');
    setLatestBet(null);
    setResolvedBets([]);
    processedRequestIds.current.clear();
  }, []);

  return {
    latestBet,           // Most recent bet result (for immediate display)
    resolvedBets,        // Full history of resolved bets
    clearLatestBet,      // Clear just the latest bet
    clearHistory,        // Clear history only
    clearAll,            // Clear everything
  };
}
