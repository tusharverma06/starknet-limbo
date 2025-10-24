"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { VerificationStep } from "./VerificationStep";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBetId?: string;
}

interface VerificationStepData {
  step: number;
  description: string;
  status: string;
  data: Record<string, unknown>;
}

interface VerificationResponse {
  verificationSteps: VerificationStepData[];
  overallStatus: string;
  valid: boolean;
  bet?: {
    betId: string;
    outcome: string;
    [key: string]: unknown;
  };
  provablyFair?: {
    serverSeed: string;
    serverSeedHash: string;
    [key: string]: unknown;
  };
}

// User-friendly explanations for each step
const STEP_EXPLANATIONS: Record<number, string> = {
  1: "✅ The server committed to a random number before you placed your bet",
  2: "✅ Your result was calculated from that locked-in random number",
  3: "✅ The game number was derived correctly from the random value",
  4: "✅ The result multiplier matches the game number mathematically",
  5: "✅ Win/lose was determined fairly based on the multiplier",
  6: "✅ Your payout matches exactly what you should receive",
};

const FAIRNESS_EXPLANATION = `Our provably fair system ensures complete transparency and prevents any manipulation of game results. Here's how it works:

1. 🔒 Commitment Phase: Before your bet, our server generates a random seed and publishes its cryptographic hash (commitment). This locks in the outcome.

2. 🎲 Play Phase: You place your bet. The outcome is already determined by the committed seed, but remains hidden.

3. 🔓 Reveal Phase: After the bet is resolved, we reveal the original seed.

4. ✅ Verify Phase: Anyone can verify that SHA256(revealed seed) matches the committed hash, proving we couldn't have changed the outcome after your bet.

This system makes it mathematically impossible for us to cheat, and you can verify it yourself!`;

export function VerificationModal({
  isOpen,
  onClose,
  initialBetId = "",
}: VerificationModalProps) {
  const [betId, setBetId] = useState(initialBetId);
  const [verification, setVerification] = useState<VerificationResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-verify if initialBetId is provided
  useEffect(() => {
    if (isOpen && initialBetId && !verification) {
      handleVerify();
    }
  }, [isOpen, initialBetId]);

  const handleVerify = async () => {
    const idToVerify = betId.trim() || initialBetId.trim();

    if (!idToVerify) {
      setError("Please enter a bet ID");
      return;
    }

    setLoading(true);
    setError(null);
    setVerification(null);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betId: idToVerify }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
        if (data.note) {
          setError(`${data.error}: ${data.note}`);
        }
      } else {
        setVerification(data);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify bet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBetId("");
    setVerification(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] bg-white rounded-xl border-2 border-black shadow-[0px_4px_0px_0px_#000000] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-black" />
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "var(--font-lilita-one)" }}>
                Verify Bet Fairness
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-black"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Input Section */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-black mb-2" style={{ fontFamily: "var(--font-lilita-one)" }}>
                Enter Bet ID:
              </label>
              <div className="flex gap-2">
                <input
                  value={betId || initialBetId}
                  onChange={(e) => setBetId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="clxxx..."
                  disabled={loading}
                  className="flex-1 px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2574ff] disabled:opacity-50"
                />
                <button
                  onClick={handleVerify}
                  disabled={loading || (!betId.trim() && !initialBetId.trim())}
                  className="px-6 py-2 bg-[#2574ff] text-white rounded-lg border-2 border-black shadow-[0px_2px_0px_0px_#000000] hover:translate-y-[1px] hover:shadow-[0px_1px_0px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Search className="w-4 h-4" />
                      Verify
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-100 border-2 border-black rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-black" style={{ fontFamily: "var(--font-lilita-one)" }}>
                    Verification Error
                  </p>
                  <p className="text-sm text-black mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {loading && !verification && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-100 border-2 border-black rounded-lg animate-pulse shadow-[0px_2px_0px_0px_#000000]"
                  />
                ))}
              </div>
            )}

            {/* Verification Results */}
            {verification && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Overall Status */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`p-5 rounded-xl border-2 border-black shadow-[0px_2px_0px_0px_#000000] flex items-center gap-4 ${
                    verification.valid
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {verification.valid ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                    >
                      <CheckCircle className="w-8 h-8 text-black flex-shrink-0" />
                    </motion.div>
                  ) : (
                    <AlertCircle className="w-8 h-8 text-black flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-xl mb-1 text-black" style={{ fontFamily: "var(--font-lilita-one)" }}>
                      {verification.valid
                        ? "This Bet is Provably Fair!"
                        : "Verification Issues Detected"}
                    </p>
                    <p className="text-sm text-black">
                      {verification.valid
                        ? "All cryptographic checks passed. This bet result is mathematically proven to be fair and cannot be manipulated."
                        : "Some verification checks failed. Please contact support for assistance."}
                    </p>
                  </div>
                </motion.div>

                {/* Bet Info Summary */}
                {verification.bet && (
                  <div className="bg-white rounded-xl p-4 border-2 border-black shadow-[0px_2px_0px_0px_#000000]">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1" style={{ fontFamily: "var(--font-lilita-one)" }}>Bet ID</p>
                        <p className="font-mono text-xs text-black font-semibold break-all">
                          {verification.bet.betId}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1" style={{ fontFamily: "var(--font-lilita-one)" }}>Result</p>
                        <p
                          className="text-lg font-bold text-black"
                          style={{ fontFamily: "var(--font-lilita-one)" }}
                        >
                          {verification.bet.outcome === "win"
                            ? "WIN"
                            : "LOSE"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Steps */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-black uppercase tracking-wide" style={{ fontFamily: "var(--font-lilita-one)" }}>
                    Verification Steps
                  </p>
                  {verification.verificationSteps.map((step) => (
                    <VerificationStep
                      key={step.step}
                      stepNumber={step.step}
                      title={step.description}
                      status={
                        step.status === "✅"
                          ? "pass"
                          : step.status === "❌"
                          ? "fail"
                          : "loading"
                      }
                      simpleExplanation={
                        STEP_EXPLANATIONS[step.step] ||
                        "Verification in progress..."
                      }
                      technicalDetails={step.data}
                    />
                  ))}
                </div>

                {/* How It Works Section */}
                <div className="bg-yellow-100 border-2 border-black rounded-xl p-5 shadow-[0px_2px_0px_0px_#000000]">
                  <div className="flex items-start gap-3 mb-3">
                    <Shield className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-black text-base mb-2" style={{ fontFamily: "var(--font-lilita-one)" }}>
                        How Provably Fair Works
                      </h3>
                      <div className="text-sm text-black space-y-3 leading-relaxed">
                        <div className="flex gap-2">
                          <span className="font-bold" style={{ fontFamily: "var(--font-lilita-one)" }}>1.</span>
                          <p>
                            <strong style={{ fontFamily: "var(--font-lilita-one)" }}>Commitment:</strong> Before your bet, the
                            server generates a random seed and publishes its
                            hash. This locks in the outcome.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold" style={{ fontFamily: "var(--font-lilita-one)" }}>2.</span>
                          <p>
                            <strong style={{ fontFamily: "var(--font-lilita-one)" }}>Play:</strong> You place your bet. The
                            outcome is already determined but remains hidden.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold" style={{ fontFamily: "var(--font-lilita-one)" }}>3.</span>
                          <p>
                            <strong style={{ fontFamily: "var(--font-lilita-one)" }}>Reveal:</strong> After the bet resolves, we
                            reveal the original seed.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold" style={{ fontFamily: "var(--font-lilita-one)" }}>4.</span>
                          <p>
                            <strong style={{ fontFamily: "var(--font-lilita-one)" }}>Verify:</strong> Anyone can verify that
                            SHA256(revealed seed) matches the committed hash,
                            proving we couldn't have changed the outcome.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-black">
                    <p className="text-xs text-black">
                      This system makes it mathematically impossible for
                      anyone to manipulate results. You can verify it yourself
                      anytime!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t-2 border-black bg-white">
            <button
              onClick={handleClose}
              className="w-full py-2 px-4 bg-[#2574ff] text-white rounded-lg border-2 border-black shadow-[0px_2px_0px_0px_#000000] hover:translate-y-[1px] hover:shadow-[0px_1px_0px_0px_#000000] transition-all"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
