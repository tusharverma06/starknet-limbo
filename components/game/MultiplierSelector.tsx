'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MULTIPLIER_PRESETS, getLimboStats } from '@/lib/utils/multiplier';
import { MIN_MULTIPLIER, MAX_MULTIPLIER } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';

interface MultiplierSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function MultiplierSelector({ value, onChange, disabled }: MultiplierSelectorProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const num = parseFloat(val);
    if (isNaN(num)) {
      setError('Invalid number');
      return;
    }

    if (num < MIN_MULTIPLIER || num > MAX_MULTIPLIER) {
      setError(`Must be between ${MIN_MULTIPLIER}x and ${MAX_MULTIPLIER}x`);
      return;
    }

    setError('');
    onChange(num);
  };

  const handlePresetClick = (preset: number) => {
    setInputValue(preset.toString());
    setError('');
    onChange(preset);
  };

  const stats = getLimboStats(value);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Target Multiplier
        </label>
        <div className="relative">
          <Input
            type="number"
            step="0.01"
            min={MIN_MULTIPLIER}
            max={MAX_MULTIPLIER}
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            error={error}
            className="text-2xl font-bold text-center"
            placeholder="2.00"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
            x
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Win Probability (Real-time)
        </label>
        <div className="relative">
          <Input
            type="text"
            value={stats.winChancePercent}
            disabled={true}
            className="text-lg font-mono text-center bg-gray-900 text-white cursor-not-allowed font-bold"
            readOnly
          />
        </div>
      </div>

      {/* <div className="grid grid-cols-3 gap-2">
        {MULTIPLIER_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            variant="ghost"
            size="sm"
            onClick={() => handlePresetClick(preset.value)}
            disabled={disabled}
            className={cn(
              'border border-gray-600 hover:border-gray-400',
              value === preset.value && 'border-white bg-white/10'
            )}
          >
            {preset.label}
          </Button>
        ))}
      </div> */}
    </div>
  );
}





