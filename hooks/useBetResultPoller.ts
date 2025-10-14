import { useState, useEffect, useRef, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { LIMBO_GAME_ABI } from '@/lib/contract/abi';
import { CONTRACT_ADDRESS, CHAIN } from '@/lib/contract/config';
import { ResolvedBet } from '@/lib/contract/types';

/**
 * AGGRESSIVE POLLING APPROACH - This WILL work!
 * Actively polls for bet results every 2 seconds when waiting
 */
export function useBetResultPoller(userAddress?: string) {
  const [latestBet, setLatestBet] = useState<ResolvedBet | null>(null);
  const [resolvedBets, setResolvedBets] = useState<ResolvedBet[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const publicClient = usePublicClient({ chainId: CHAIN.id });
  const processedIds = useRef(new Set<string>());
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedBlock = useRef<bigint>(BigInt(0));

  // Active polling function
  const pollForResults = useCallback(async () => {
    if (!publicClient || !userAddress) {
      console.log('⏸️ Polling paused - no client or address');
      return;
    }

    try {
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = lastCheckedBlock.current === BigInt(0)
        ? currentBlock - BigInt(10) // Check last 10 blocks on first run
        : lastCheckedBlock.current + BigInt(1);

      console.log('🔄 Polling for BetResolved events...', {
        from: fromBlock.toString(),
        to: currentBlock.toString(),
        address: userAddress,
      });

      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: LIMBO_GAME_ABI.find((item) => item.name === 'BetResolved' && item.type === 'event'),
        args: { player: userAddress },
        fromBlock,
        toBlock: currentBlock,
      });

      console.log(`📦 Found ${logs.length} events in this poll`);

      if (logs.length > 0) {
        logs.forEach((log: any) => {
          const { requestId, player, betAmount, targetMultiplier, limboMultiplier, win, payout, timestamp } = log.args;
          const reqIdStr = requestId.toString();

          // Skip if already processed
          if (processedIds.current.has(reqIdStr)) {
            console.log('⏭️ Already processed:', reqIdStr);
            return;
          }

          processedIds.current.add(reqIdStr);

          const resolved: ResolvedBet = {
            requestId: requestId as bigint,
            player: player as string,
            amount: betAmount as bigint,
            targetMultiplier: Number(targetMultiplier),
            limboMultiplier: limboMultiplier as bigint,
            win: win as boolean,
            payout: payout as bigint,
            timestamp: Number(timestamp) * 1000,
            txHash: log.transactionHash,
          };

          console.log('🎰 NEW BET RESULT FOUND!', {
            win: resolved.win ? '🎉 WIN' : '😢 LOSE',
            requestId: reqIdStr,
            limboMultiplier: Number(resolved.limboMultiplier) / 100,
            targetMultiplier: resolved.targetMultiplier / 100,
            payout: resolved.payout.toString(),
          });

          // Update state
          setLatestBet(resolved);
          setResolvedBets((prev) => [resolved, ...prev].slice(0, 50));
        });
      }

      lastCheckedBlock.current = currentBlock;
    } catch (error) {
      console.error('❌ Polling error:', error);
    }
  }, [publicClient, userAddress]);

  // Start polling when requested
  const startPolling = useCallback(() => {
    if (pollingInterval.current) {
      console.log('⚠️ Already polling');
      return;
    }

    console.log('▶️ Starting ULTRA FAST polling (every 500ms)');
    setIsPolling(true);

    // Poll immediately
    pollForResults();

    // Then poll every 500ms (twice per second) for instant results
    pollingInterval.current = setInterval(() => {
      pollForResults();
    }, 500);
  }, [pollForResults]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      console.log('⏹️ Stopping polling');
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    setIsPolling(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const clearLatestBet = useCallback(() => {
    console.log('🧹 Clearing latest bet');
    setLatestBet(null);
  }, []);

  const clearAll = useCallback(() => {
    console.log('🧹 Clearing all');
    setLatestBet(null);
    setResolvedBets([]);
    processedIds.current.clear();
  }, []);

  return {
    latestBet,
    resolvedBets,
    isPolling,
    startPolling,   // Call this when bet is placed
    stopPolling,    // Call this when result is shown
    clearLatestBet,
    clearAll,
  };
}
