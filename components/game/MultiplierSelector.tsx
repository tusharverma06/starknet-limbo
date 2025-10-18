"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { getLimboStats } from "@/lib/utils/multiplier";
import { MIN_MULTIPLIER, MAX_MULTIPLIER } from "@/lib/constants";

interface MultiplierSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function MultiplierSelector({
  value,
  onChange,
  disabled,
}: MultiplierSelectorProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const num = parseFloat(val);
    if (isNaN(num)) {
      setError("Invalid number");
      return;
    }

    if (num < MIN_MULTIPLIER || num > MAX_MULTIPLIER) {
      setError(`Must be between ${MIN_MULTIPLIER}x and ${MAX_MULTIPLIER}x`);
      return;
    }

    setError("");
    onChange(num);
  };

  const stats = getLimboStats(value);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black/80 mb-2">
          Target Multiplier
        </label>
        <div className="w-full flex flex-col items-start gap-0.5">
          <div className="relative w-full flex items-center gap-1 justify-between h-10 min-h-10 bg-gray-50 border border-gray-300 rounded-xl pr-2 pl-4 py-0">
            <span className=" text-black/80 font-normal text-sm">x</span>
            <Input
              type="number"
              step="0.01"
              min={MIN_MULTIPLIER}
              max={MAX_MULTIPLIER}
              value={inputValue}
              onChange={handleInputChange}
              disabled={disabled}
              className="text-sm font-medium border-none  bg-transparent p-0 focus:ring-0 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Win Probability
        </label>
        <div className="relative w-full flex items-center gap-1 justify-between h-10 min-h-10 bg-gray-50 border border-gray-300 rounded-xl pr-2 pl-4 py-0">
          <span className=" text-black/80 font-normal text-sm">%</span>
          <Input
            type="text"
            value={stats.winChancePercent.slice(0, -1)}
            disabled={true}
            className="text-sm font-mono   border-none p-0 bg-transparent focus:ring-0 focus:outline-none text-black cursor-not-allowed font-medium"
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
