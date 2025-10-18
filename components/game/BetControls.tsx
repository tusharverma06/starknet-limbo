'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MIN_BET_USD, MAX_BET_USD } from '@/lib/constants';
import { parseEther, formatEther } from 'viem';
import { getEthValueFromUsd, getUsdValueFromEth } from '@/lib/utils/price';

interface BetControlsProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  balance?: bigint;
}

export function BetControls({ value, onChange, disabled, balance }: BetControlsProps) {
  const [error, setError] = useState('');
  const [usdBalance, setUsdBalance] = useState<number | null>(null);

  // Convert balance to USD when component mounts or balance changes
  React.useEffect(() => {
    if (balance) {
      const ethBalance = parseFloat(formatEther(balance));
      if (isFinite(ethBalance) && ethBalance >= 0) {
        getUsdValueFromEth(ethBalance).then((usdValue) => {
          if (isFinite(usdValue) && usdValue >= 0) {
            setUsdBalance(usdValue);
          } else {
            setUsdBalance(null);
          }
        }).catch(() => setUsdBalance(null));
      } else {
        setUsdBalance(null);
      }
    } else {
      setUsdBalance(null);
    }
  }, [balance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    const num = parseFloat(val);
    if (isNaN(num)) {
      setError('Invalid amount');
      return;
    }

    if (num < MIN_BET_USD) {
      setError(`Minimum bet is $${MIN_BET_USD}`);
      return;
    }

    if (num > MAX_BET_USD) {
      setError(`Maximum bet is $${MAX_BET_USD}`);
      return;
    }

    if (usdBalance && num > usdBalance) {
      setError('Insufficient balance');
      return;
    }

    setError('');
  };

  const handleQuickAmount = (multiplier: number) => {
    const current = parseFloat(value) || MIN_BET_USD;
    const newAmount = Math.min(current * multiplier, MAX_BET_USD);
    onChange(newAmount.toString());
    setError('');
  };

  const handleMax = () => {
    if (usdBalance) {
      const maxAmount = Math.min(usdBalance, MAX_BET_USD);
      onChange(maxAmount.toString());
      setError('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-black/80 mb-2">
            Bet Amount (USD)
          </label>
          {usdBalance !== null && (
            <div className="text-sm text-gray-400 p-3 bg-gray-900 rounded-lg border border-gray-800">
              Balance: ${usdBalance.toFixed(2)}
            </div>
          )}
        </div>
        <Input
          type="number"
          step="0.01"
          min={MIN_BET_USD}
          max={MAX_BET_USD}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          error={error}
          className="text-lg font-medium"
          placeholder="1.00"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuickAmount(0.5)}
          disabled={disabled}
          className="flex-1 border border-gray-700 hover:border-gray-500"
        >
          1/2
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuickAmount(2)}
          disabled={disabled}
          className="flex-1 border border-gray-700 hover:border-gray-500"
        >
          2x
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMax}
          disabled={disabled || !usdBalance}
          className="flex-1 border border-gray-700 hover:border-gray-500"
        >
          MAX
        </Button>
      </div>

     
    </div>
  );
}





