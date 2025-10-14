'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { formatETH } from '@/lib/utils/format';
import { toDisplayMultiplier } from '@/lib/utils/multiplier';
import { CheckCircle2, XCircle } from 'lucide-react';

interface GameResultProps {
  win: boolean;
  amount: bigint;
  targetMultiplier: number; // Contract format (e.g., 140 for 1.40x)
  randomResult: bigint;     // limboMultiplier from contract (e.g., 128 for 1.28x)
  payout?: bigint;          // Actual payout from contract event (optional for backward compatibility)
  onClose: () => void;
}

export function GameResult({
  win,
  amount,
  targetMultiplier,
  randomResult,
  payout: contractPayout,
  onClose
}: GameResultProps) {
  // Convert contract format to display format
  const resultMultiplier = toDisplayMultiplier(Number(randomResult));
  const targetDisplay = toDisplayMultiplier(targetMultiplier);

  // Use payout from contract event, fallback to calculation for backward compatibility
  const payout = contractPayout !== undefined
    ? contractPayout
    : (win ? (amount * randomResult) / BigInt(100) : BigInt(0));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card 
        className="max-w-md w-full" 
        glow={win}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            {win ? (
              <CheckCircle2 className="w-20 h-20 mx-auto text-green-500" />
            ) : (
              <XCircle className="w-20 h-20 mx-auto text-red-500" />
            )}
          </motion.div>

          {/* Result */}
          <div>
            <h2 className={`text-4xl font-bold mb-2 ${win ? 'text-green-500' : 'text-red-500'}`}>
              {win ? 'YOU WIN!' : 'YOU LOSE'}
            </h2>
            <p className="text-slate-400">
              Result: <span className="text-white font-semibold">{resultMultiplier.toFixed(2)}x</span>
            </p>
            <p className="text-slate-400">
              Target: <span className="text-white font-semibold">{targetDisplay.toFixed(2)}x</span>
            </p>
          </div>

          {/* Payout */}
          <div className="py-4 px-6 rounded-xl bg-slate-900/50 border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">
              {win ? 'Payout' : 'Lost'}
            </div>
            <div className={`text-2xl font-bold ${win ? 'text-green-500' : 'text-red-500'}`}>
              {win ? '+' : '-'}{formatETH(win ? payout : amount)} ETH
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </Card>
    </motion.div>
  );
}



