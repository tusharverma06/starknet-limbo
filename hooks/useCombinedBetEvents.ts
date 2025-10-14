import { useState, useEffect } from 'react';
import { useBetEvents } from './useBetEvents';
import { usePastBetEvents } from './usePastBetEvents';
import { PendingBet, ResolvedBet } from '@/lib/contract/types';

interface UseCombinedBetEventsOptions {
  userAddress?: string;
  loadPastEvents?: boolean;
  pastEventsFromBlock?: bigint;
}

/**
 * Combined hook that merges real-time event watching with past event fetching
 * Provides a complete view of user's bets with fallback for missed events
 */
export function useCombinedBetEvents(options: UseCombinedBetEventsOptions = {}) {
  const { userAddress, loadPastEvents = true, pastEventsFromBlock } = options;

  // Real-time event watching
  const realTime = useBetEvents(userAddress);

  // Past events (load once on mount)
  const [pastEventsLoaded, setPastEventsLoaded] = useState(false);
  const past = usePastBetEvents({
    userAddress,
    enabled: loadPastEvents && !pastEventsLoaded,
    fromBlock: pastEventsFromBlock,
  });

  // Merged state
  const [allPendingBets, setAllPendingBets] = useState<PendingBet[]>([]);
  const [allResolvedBets, setAllResolvedBets] = useState<ResolvedBet[]>([]);

  // Load past events first (once)
  useEffect(() => {
    if (loadPastEvents && !past.isLoading && !pastEventsLoaded && past.pendingBets.length >= 0) {
      console.log('📥 Loading past events into state');
      setAllPendingBets(past.pendingBets);
      setAllResolvedBets(past.resolvedBets);
      setPastEventsLoaded(true);
    }
  }, [loadPastEvents, past.isLoading, past.pendingBets, past.resolvedBets, pastEventsLoaded]);

  // Merge real-time events with past events
  useEffect(() => {
    if (!pastEventsLoaded && loadPastEvents) return;

    setAllPendingBets((prev) => {
      // Merge real-time pending bets, avoiding duplicates
      const combined = [...realTime.pendingBets];
      const existingIds = new Set(realTime.pendingBets.map((b) => b.requestId.toString()));

      // Add past pending bets that aren't in real-time
      for (const bet of prev) {
        if (!existingIds.has(bet.requestId.toString())) {
          combined.push(bet);
        }
      }

      return combined.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    });

    setAllResolvedBets((prev) => {
      // Merge real-time resolved bets, avoiding duplicates
      const combined = [...realTime.resolvedBets];
      const existingIds = new Set(realTime.resolvedBets.map((b) => b.requestId.toString()));

      // Add past resolved bets that aren't in real-time
      for (const bet of prev) {
        if (!existingIds.has(bet.requestId.toString())) {
          combined.push(bet);
        }
      }

      return combined.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
    });
  }, [realTime.pendingBets, realTime.resolvedBets, pastEventsLoaded, loadPastEvents]);

  return {
    pendingBets: allPendingBets,
    resolvedBets: allResolvedBets,
    hasPendingBet: allPendingBets.length > 0,
    clearBets: realTime.clearBets,
    clearPendingBets: realTime.clearPendingBets,
    isLoadingPastEvents: past.isLoading,
    pastEventsError: past.error,
  };
}
