'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatETH } from '@/lib/utils/format';
import { getUsdValueFromEth } from '@/lib/utils/price';

interface ResolvedBet {
  requestId: bigint;
  player: string;
  amount: bigint;
  targetMultiplier: number;
  limboMultiplier: bigint;
  win: boolean;
  payout: bigint;
  timestamp: number;
  txHash: `0x${string}`;
}

interface RecentBetsAccordionProps {
  bets: ResolvedBet[];
}

export function RecentBetsAccordion({ bets }: RecentBetsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [betUsdValues, setBetUsdValues] = useState<{ [key: string]: { amount: number; payout: number } }>({});

  // Calculate USD values for all bets
  useEffect(() => {
    const calculateUsdValues = async () => {
      const usdValues: { [key: string]: { amount: number; payout: number } } = {};
      
      for (const bet of bets) {
        try {
          const amountEth = parseFloat(formatETH(bet.amount));
          const amountUsd = await getUsdValueFromEth(amountEth);
          
          let payoutUsd = 0;
          if (bet.win) {
            const payoutEth = parseFloat(formatETH(bet.payout));
            payoutUsd = await getUsdValueFromEth(payoutEth);
          }
          
          usdValues[bet.requestId.toString()] = { amount: amountUsd, payout: payoutUsd };
        } catch (error) {
          console.error('Error calculating USD values for bet:', error);
        }
      }
      
      setBetUsdValues(usdValues);
    };

    if (bets.length > 0) {
      calculateUsdValues();
    }
  }, [bets]);

  if (bets.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-medium text-black">
          Recent Bets ({bets.length})
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-black" />
        ) : (
          <ChevronDown className="w-4 h-4 text-black" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
          {bets.slice(0, 10).map((bet, index) => {
            const usdValues = betUsdValues[bet.requestId.toString()];
            
            return (
              <div
                key={bet.requestId.toString()}
                className="p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        bet.win ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm font-medium text-black">
                      {bet.targetMultiplier.toFixed(2)}x
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-black">
                      {formatETH(bet.amount)} ETH
                    </div>
                    {usdValues && (
                      <div className="text-xs text-gray-500">
                        ${usdValues.amount.toFixed(2)} USD
                      </div>
                    )}
                    <div className="text-xs text-gray-600">
                      {bet.win ? `+${formatETH(bet.payout)}` : 'Lost'}
                    </div>
                    {usdValues && bet.win && (
                      <div className="text-xs text-green-600">
                        +${usdValues.payout.toFixed(2)} USD
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Result: {Number(bet.limboMultiplier) / 100}x
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
