'use client';

import { Card } from '@/components/ui/Card';
import { formatETH } from '@/lib/utils/format';
import { Wallet, TrendingUp, Users } from 'lucide-react';

interface HouseStatsProps {
  houseBalance: bigint;
  totalBets?: number;
  totalPlayers?: number;
}

export function HouseStats({ houseBalance, totalBets = 0, totalPlayers = 0 }: HouseStatsProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">House Stats</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <Wallet className="w-6 h-6 mx-auto mb-2 text-blue-400" />
          <div className="text-sm text-slate-400 mb-1">Balance</div>
          <div className="text-lg font-bold text-white">
            {formatETH(houseBalance, 2)} ETH
          </div>
        </div>
        
        <div className="text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-400" />
          <div className="text-sm text-slate-400 mb-1">Total Bets</div>
          <div className="text-lg font-bold text-white">
            {totalBets}
          </div>
        </div>

        <div className="text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-purple-400" />
          <div className="text-sm text-slate-400 mb-1">Players</div>
          <div className="text-lg font-bold text-white">
            {totalPlayers}
          </div>
        </div>
      </div>
    </Card>
  );
}



