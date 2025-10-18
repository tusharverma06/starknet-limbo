'use client';

import { useState, useEffect } from 'react';
import { usePonderBets } from '@/hooks/usePonderBets';
import { formatETH } from '@/lib/utils/format';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  User,
  Trophy,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function BetsPage() {
  const { bets, isLoading, error, refreshBets } = usePonderBets();
  const [searchAddress, setSearchAddress] = useState('');
  const [filterWin, setFilterWin] = useState<'all' | 'win' | 'loss'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'betAmount' | 'payout'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter and sort bets
  const filteredBets = bets
    .filter((bet) => {
      if (searchAddress && !bet.player.toLowerCase().includes(searchAddress.toLowerCase())) {
        return false;
      }
      if (filterWin === 'win' && !bet.win) return false;
      if (filterWin === 'loss' && bet.win) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'betAmount':
          aValue = BigInt(a.betAmount);
          bValue = BigInt(b.betAmount);
          break;
        case 'payout':
          aValue = BigInt(a.payout);
          bValue = BigInt(b.payout);
          break;
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

  // Calculate stats
  const totalBets = bets.length;
  const totalWagered = bets.reduce((sum, bet) => sum + BigInt(bet.betAmount), BigInt(0));
  const totalPayout = bets.reduce((sum, bet) => sum + BigInt(bet.payout), BigInt(0));
  const winCount = bets.filter((bet) => bet.win).length;
  const winRate = totalBets > 0 ? (winCount / totalBets) * 100 : 0;

  const handleSort = (field: 'timestamp' | 'betAmount' | 'payout') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-400" />
              All Bets
            </h1>
            <p className="text-slate-400 mt-1">
              Real-time betting activity from the blockchain
            </p>
          </div>
          <Link href="/game">
            <Button variant="outline">
              ← Back to Game
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-slate-400">Total Bets</div>
                <div className="text-xl font-bold text-white">{totalBets.toLocaleString()}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-sm text-slate-400">Win Rate</div>
                <div className="text-xl font-bold text-white">{winRate.toFixed(1)}%</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-slate-400">Total Wagered</div>
                <div className="text-xl font-bold text-white">
                  {formatETH(totalWagered)} ETH
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-sm text-slate-400">Total Payout</div>
                <div className="text-xl font-bold text-white">
                  {formatETH(totalPayout)} ETH
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterWin === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterWin('all')}
              >
                All
              </Button>
              <Button
                variant={filterWin === 'win' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterWin('win')}
              >
                Wins
              </Button>
              <Button
                variant={filterWin === 'loss' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterWin('loss')}
              >
                Losses
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={refreshBets}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </Card>

        {/* Bets Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="text-left p-4 text-slate-300 font-medium">Player</th>
                  <th 
                    className="text-left p-4 text-slate-300 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort('betAmount')}
                  >
                    Bet Amount {sortBy === 'betAmount' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-left p-4 text-slate-300 font-medium">Target</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Result</th>
                  <th 
                    className="text-left p-4 text-slate-300 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort('payout')}
                  >
                    Payout {sortBy === 'payout' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-left p-4 text-slate-300 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort('timestamp')}
                  >
                    Time {sortBy === 'timestamp' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBets.map((bet) => (
                  <tr key={bet.id} className="border-t border-slate-700 hover:bg-slate-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <code className="text-sm text-slate-300">
                          {bet.player.slice(0, 6)}...{bet.player.slice(-4)}
                        </code>
                      </div>
                    </td>
                    <td className="p-4 text-white font-medium">
                      {formatETH(BigInt(bet.betAmount))} ETH
                    </td>
                    <td className="p-4 text-slate-300">
                      {(Number(bet.targetMultiplier) / 100).toFixed(2)}x
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {bet.win ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">WIN</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-medium">LOSS</span>
                          </>
                        )}
                        <span className="text-slate-400 text-sm">
                          {(Number(bet.limboMultiplier) / 100).toFixed(2)}x
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-white font-medium">
                      {formatETH(BigInt(bet.payout))} ETH
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(bet.timestamp * 1000), {
                          addSuffix: true,
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBets.length === 0 && !isLoading && (
            <div className="p-8 text-center text-slate-400">
              {searchAddress || filterWin !== 'all' 
                ? 'No bets match your filters' 
                : 'No bets found'
              }
            </div>
          )}

          {isLoading && (
            <div className="p-8 text-center text-slate-400">
              Loading bets...
            </div>
          )}

          {error && (
            <div className="p-8 text-center text-red-400">
              Error: {error}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
