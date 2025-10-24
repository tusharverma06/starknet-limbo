"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Info, X, Shield } from "lucide-react";

interface FairnessCommitmentProps {
  visible?: boolean;
}

export function FairnessCommitment({
  visible = true,
}: FairnessCommitmentProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Generate a mock commitment hash for display purposes
  // In production, this would come from the server
  const generateMockHash = () => {
    const chars = "0123456789abcdef";
    let hash = "0x";
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const [commitmentHash] = useState(generateMockHash());

  if (!visible) return null;

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-3"
      >
        <div className="flex items-center gap-3">
          {/* Lock Icon */}
          <motion.div
            animate={{
              rotate: [0, -5, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 5,
            }}
          >
            <Lock className="w-5 h-5 text-green-600" />
          </motion.div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-green-900">
                🔒 This Round is Committed!
              </p>
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="p-1 hover:bg-green-200 rounded-full transition-colors"
              >
                <Info className="w-4 h-4 text-green-700" />
              </button>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-green-700 font-medium">
                Commitment ID:
              </span>
              <code className="text-xs font-mono text-green-800 bg-white px-2 py-0.5 rounded border border-green-200">
                {commitmentHash.slice(0, 10)}...
              </code>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tooltip/Explanation */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-10"
          >
            <div className="bg-white border-2 border-green-300 rounded-xl shadow-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="float-right p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                  <h4 className="font-bold text-green-900 text-sm mb-2">
                    What does this mean?
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Before each round, our system generates a hidden random seed
                    and publishes its hash (commitment). This ensures we can't
                    change the outcome later. After your bet, we reveal the seed
                    and you can verify that it matches this commitment hash.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-green-200">
                <p className="text-xs text-green-800 font-semibold">
                  ✅ This guarantees fair, tamper-proof results!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
