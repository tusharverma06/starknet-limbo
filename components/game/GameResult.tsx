"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { formatETH } from "@/lib/utils/format";
import { toDisplayMultiplier } from "@/lib/utils/multiplier";
import { getUsdValueFromEth } from "@/lib/utils/price";
import { CheckCircle2, XCircle } from "lucide-react";

interface GameResultProps {
  win: boolean;
  amount: bigint;
  targetMultiplier: number; // Contract format (e.g., 140 for 1.40x)
  randomResult: bigint; // limboMultiplier from contract (e.g., 128 for 1.28x)
  payout?: bigint; // Actual payout from contract event (optional for backward compatibility)
  onClose: () => void;
  betId?: string; // Bet ID for provably fair verification
}

export function GameResult({
  win,
  amount,
  targetMultiplier,
  randomResult,
  payout: contractPayout,
  onClose,
}: GameResultProps) {
  const [payoutUsd, setPayoutUsd] = useState<number | null>(null);
  const [amountUsd, setAmountUsd] = useState<number | null>(null);

  // Convert contract format to display format
  const resultMultiplier = toDisplayMultiplier(Number(randomResult));

  // Use payout from contract event, fallback to calculation for backward compatibility
  const payout =
    contractPayout !== undefined
      ? contractPayout
      : win
      ? (amount * randomResult) / BigInt(100)
      : BigInt(0);

  // Calculate USD values
  useEffect(() => {
    const calculateUsdValues = async () => {
      try {
        const amountEth = parseFloat(formatETH(amount));
        const amountUsdValue = await getUsdValueFromEth(amountEth);
        setAmountUsd(amountUsdValue);

        if (win) {
          const payoutEth = parseFloat(formatETH(payout));
          const payoutUsdValue = await getUsdValueFromEth(payoutEth);
          setPayoutUsd(payoutUsdValue);
        }
      } catch (error) {
        console.error("Error calculating USD values:", error);
      }
    };

    calculateUsdValues();
  }, [amount, payout, win]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-auto"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-white rounded-xl p-6 border-2 border-black shadow-[0px_4px_0px_0px_#000000] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            {win ? (
              <CheckCircle2 className="w-20 h-20 mx-auto text-green-500" />
            ) : (
              <XCircle className="w-20 h-20 mx-auto text-red-500" />
            )}
          </motion.div>

          {/* Result */}
          <div>
            <h2
              className={`text-4xl font-bold mb-2 ${
                win ? "text-green-500" : "text-red-500"
              }`}
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              {win ? "YOU WIN!" : "YOU LOSE"}
            </h2>

            {/* Result Multiplier - BOLD AND BIG */}
            <div className="my-4">
              <p
                className="text-sm text-gray-600 mb-1"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                Result Multiplier
              </p>
              <p
                className={`text-6xl font-extrabold ${
                  win ? "text-green-600" : "text-red-600"
                }`}
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                {resultMultiplier.toFixed(2)}x
              </p>
            </div>

            <p
              className="text-gray-600 mt-3"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Target:{" "}
              <span className="text-black font-semibold">
                {targetMultiplier.toFixed(2)}x
              </span>
            </p>
          </div>

          {/* Payout */}
          <div className="py-4 px-6 rounded-xl bg-white border-2 border-black shadow-[0px_2px_0px_0px_#000000]">
            <div
              className="text-sm text-gray-600 mb-1"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              {win ? "Payout" : "Lost"}
            </div>
            <div
              className={`text-2xl font-bold ${
                win ? "text-green-500" : "text-red-500"
              }`}
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              {win ? "+" : "-"}
              {formatETH(win ? payout : amount)} ETH
            </div>
            {/* Show USD value with proper formatting */}
            {((win && payoutUsd !== null && payoutUsd > 0) ||
              (!win && amountUsd !== null && amountUsd > 0)) && (
              <div
                className={`text-lg font-semibold ${
                  win ? "text-green-500" : "text-red-500"
                }`}
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                {win ? "+" : "-"}$
                {win
                  ? payoutUsd! < 0.01
                    ? payoutUsd!.toFixed(4)
                    : payoutUsd!.toFixed(2)
                  : amountUsd! < 0.01
                  ? amountUsd!.toFixed(4)
                  : amountUsd!.toFixed(2)}{" "}
                USD
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#2574ff] hover:bg-[#1e5fd9] text-white font-semibold border-2 border-black shadow-[0px_3px_0px_0px_#000000] hover:translate-y-[1px] hover:shadow-[0px_2px_0px_0px_#000000] transition-all"
            style={{ fontFamily: "var(--font-lilita-one)" }}
          >
            Continue
          </button>
        </div>
      </div>
    </motion.div>
  );
}
