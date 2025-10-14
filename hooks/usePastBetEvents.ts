import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { LIMBO_GAME_ABI } from '@/lib/contract/abi';
import { CONTRACT_ADDRESS, CHAIN } from '@/lib/contract/config';
import { PendingBet, ResolvedBet } from '@/lib/contract/types';

interface UsePastBetEventsOptions {
  userAddress?: string;
  enabled?: boolean;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
}

/**
 * Hook to fetch historical bet events from the blockchain
 * Useful for recovering missed events or initial load
 */
export function usePastBetEvents(options: UsePastBetEventsOptions = {}) {
  const { userAddress, enabled = false, fromBlock, toBlock = 'latest' } = options;
  const publicClient = usePublicClient({ chainId: CHAIN.id });

  const [pendingBets, setPendingBets] = useState<PendingBet[]>([]);
  const [resolvedBets, setResolvedBets] = useState<ResolvedBet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !publicClient) return;

    const fetchPastEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching past events...', { fromBlock, toBlock, userAddress });

        // Calculate block range (default to last 10,000 blocks if not specified)
        const currentBlock = await publicClient.getBlockNumber();
        const from = fromBlock ?? currentBlock - BigInt(10000);
        const to = toBlock === 'latest' ? currentBlock : toBlock;

        console.log(`📦 Fetching from block ${from} to ${to}`);

        // Fetch BetPlaced events
        const betPlacedLogs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: LIMBO_GAME_ABI.find((item) => item.name === 'BetPlaced'),
          fromBlock: from,
          toBlock: to,
          args: userAddress ? { player: userAddress } : undefined,
        });

        // Fetch BetResolved events
        const betResolvedLogs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: LIMBO_GAME_ABI.find((item) => item.name === 'BetResolved'),
          fromBlock: from,
          toBlock: to,
          args: userAddress ? { player: userAddress } : undefined,
        });

        console.log(`✅ Found ${betPlacedLogs.length} BetPlaced and ${betResolvedLogs.length} BetResolved events`);

        // Process BetPlaced events
        const resolvedRequestIds = new Set(
          betResolvedLogs.map((log: any) => log.args.requestId.toString())
        );

        const pending: PendingBet[] = betPlacedLogs
          .map((log: any) => {
            const { requestId, player, amount, targetMultiplier, timestamp } = log.args;
            return {
              requestId,
              player,
              amount,
              targetMultiplier: Number(targetMultiplier),
              timestamp: Number(timestamp) * 1000,
              txHash: log.transactionHash,
            };
          })
          .filter((bet: PendingBet) => !resolvedRequestIds.has(bet.requestId.toString()))
          .sort((a: PendingBet, b: PendingBet) => b.timestamp - a.timestamp)
          .slice(0, 10);

        // Process BetResolved events
        const resolved: ResolvedBet[] = betResolvedLogs
          .map((log: any) => {
            const { requestId, player, betAmount, targetMultiplier, limboMultiplier, win, payout, timestamp } =
              log.args;
            return {
              requestId,
              player,
              amount: betAmount,
              targetMultiplier: Number(targetMultiplier),
              limboMultiplier,
              win,
              payout,
              timestamp: Number(timestamp) * 1000,
              txHash: log.transactionHash,
            };
          })
          .sort((a: ResolvedBet, b: ResolvedBet) => b.timestamp - a.timestamp)
          .slice(0, 50);

        setPendingBets(pending);
        setResolvedBets(resolved);

        console.log(`📊 Loaded ${pending.length} pending and ${resolved.length} resolved bets`);
      } catch (err) {
        console.error('❌ Error fetching past events:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPastEvents();
  }, [enabled, publicClient, userAddress, fromBlock, toBlock]);

  return {
    pendingBets,
    resolvedBets,
    isLoading,
    error,
  };
}
