'use client';

import { Card } from '@/components/ui/Card';
import { ResolvedBet } from '@/lib/contract/types';
import { formatETH, shortenAddress, formatTimeAgo } from '@/lib/utils/format';
import { toDisplayMultiplier } from '@/lib/utils/multiplier';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RecentBetsProps {
  bets: ResolvedBet[];
}

export function RecentBets({ bets }: RecentBetsProps) {
  if (bets.length === 0) {
    return (
      <Card>
        <p className="text-center text-slate-400 py-8">
          No recent bets
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">Recent Bets</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {bets.map((bet, index) => {
          const resultMultiplier = toDisplayMultiplier(Number(bet.randomResult));
          const targetMultiplier = toDisplayMultiplier(bet.targetMultiplier);
          
          return (
            <div
              key={`${bet.txHash}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                {bet.win ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <div className="text-sm font-medium text-white">
                    {shortenAddress(bet.player)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatTimeAgo(bet.timestamp)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-sm font-semibold ${bet.win ? 'text-green-500' : 'text-red-500'}`}>
                  {resultMultiplier.toFixed(2)}x / {targetMultiplier.toFixed(2)}x
                </div>
                <div className="text-xs text-slate-400">
                  {formatETH(bet.amount)} ETH
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}



