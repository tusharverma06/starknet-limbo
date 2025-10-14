'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MIN_BET, MAX_BET } from '@/lib/constants';
import { parseEther, formatEther } from 'viem';

interface BetControlsProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  balance?: bigint;
}

export function BetControls({ value, onChange, disabled, balance }: BetControlsProps) {
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    const num = parseFloat(val);
    if (isNaN(num)) {
      setError('Invalid amount');
      return;
    }

    if (num < MIN_BET) {
      setError(`Minimum bet is ${MIN_BET} ETH`);
      return;
    }

    if (num > MAX_BET) {
      setError(`Maximum bet is ${MAX_BET} ETH`);
      return;
    }

    if (balance && parseEther(val) > balance) {
      setError('Insufficient balance');
      return;
    }

    setError('');
  };

  const handleQuickAmount = (multiplier: number) => {
    const current = parseFloat(value) || MIN_BET;
    const newAmount = Math.min(current * multiplier, MAX_BET);
    onChange(newAmount.toString());
    setError('');
  };

  const handleMax = () => {
    if (balance) {
      const maxAmount = Math.min(parseFloat(formatEther(balance)), MAX_BET);
      onChange(maxAmount.toString());
      setError('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Bet Amount (ETH)
        </label>
        <Input
          type="number"
          step="0.001"
          min={MIN_BET}
          max={MAX_BET}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          error={error}
          className="text-xl font-semibold"
          placeholder="0.01"
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
          disabled={disabled || !balance}
          className="flex-1 border border-gray-700 hover:border-gray-500"
        >
          MAX
        </Button>
      </div>

      {balance && (
        <div className="text-sm text-gray-400 p-3 bg-gray-900 rounded-lg border border-gray-800">
          Balance: {parseFloat(formatEther(balance)).toFixed(4)} ETH
        </div>
      )}
    </div>
  );
}





