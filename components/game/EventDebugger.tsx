'use client';

import { useAccount } from 'wagmi';
import { useOptimizedBetEventsDebug } from '@/hooks/useOptimizedBetEventsDebug';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/**
 * Debug component to test event watching
 * Add this temporarily to your GameBoard to see what's happening
 */
export function EventDebugger() {
  const { address } = useAccount();
  const { latestBet, resolvedBets, fetchPastEvents, blockNumber } = useOptimizedBetEventsDebug(address);

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-xl font-bold text-white">Event Debugger</h3>

      <div className="space-y-2 text-sm">
        <div className="text-gray-400">
          Current Block: <span className="text-white font-mono">{blockNumber?.toString()}</span>
        </div>
        <div className="text-gray-400">
          User Address: <span className="text-white font-mono text-xs">{address || 'Not connected'}</span>
        </div>
        <div className="text-gray-400">
          Contract: <span className="text-white font-mono text-xs">0xb1f942b87db32325c13e1e57314c833561ed78a9</span>
        </div>
      </div>

      <Button
        onClick={() => fetchPastEvents()}
        size="sm"
        className="w-full"
      >
        Fetch Past 100 Blocks (Check Console)
      </Button>

      <div className="space-y-2">
        <h4 className="font-semibold text-white">Latest Bet:</h4>
        {latestBet ? (
          <div className="p-3 bg-gray-900 rounded text-xs font-mono text-white space-y-1">
            <div>Request ID: {latestBet.requestId.toString()}</div>
            <div>Win: {latestBet.win ? '✅ YES' : '❌ NO'}</div>
            <div>Target: {latestBet.targetMultiplier / 100}x</div>
            <div>Result: {Number(latestBet.limboMultiplier) / 100}x</div>
            <div>Payout: {latestBet.payout.toString()}</div>
          </div>
        ) : (
          <div className="text-gray-500 italic">No bets yet</div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-white">History ({resolvedBets.length}):</h4>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {resolvedBets.length === 0 ? (
            <div className="text-gray-500 italic text-sm">No history</div>
          ) : (
            resolvedBets.slice(0, 5).map((bet) => (
              <div key={bet.requestId.toString()} className="p-2 bg-gray-900 rounded text-xs">
                {bet.win ? '✅' : '❌'} {Number(bet.limboMultiplier) / 100}x (Target: {bet.targetMultiplier / 100}x)
              </div>
            ))
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
        <div>⚠️ Check browser console for detailed logs</div>
        <div>📡 Events arrive when VRF resolves your bet</div>
      </div>
    </Card>
  );
}
