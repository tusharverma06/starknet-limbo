"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface VerificationStep {
  step: number;
  description: string;
  status: string;
  data: Record<string, unknown>;
}

interface BetData {
  player: string;
  betAmount: string;
  targetMultiplier: number;
  limboMultiplier?: number;
  win: boolean;
  payout: string;
}

interface VerificationResponse {
  verificationSteps: VerificationStep[];
  overallStatus: string;
  bet?: BetData;
  error?: string;
  note?: string;
}

export function ProvablyFairVerification() {
  const [requestId, setRequestId] = useState("");
  const [verification, setVerification] = useState<VerificationResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!requestId.trim()) {
      setError("Please enter a request ID");
      return;
    }

    setLoading(true);
    setError(null);
    setVerification(null);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.trim(),
        }),
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
    } catch (error) {
      console.error("Verification failed:", error);
      setError("Failed to verify bet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg">
      <h1 className="text-3xl font-bold text-white mb-4">
        Provably Fair Verification
      </h1>

      <p className="text-gray-400 mb-8">
        Verify any bet to ensure transparency and fairness. Enter the Request ID
        (bet ID) to verify the bet outcome and randomness.
      </p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Request ID (Bet ID):
          </label>
          <Input
            placeholder="Enter request ID (e.g., 0x...)"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleVerify();
              }
            }}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can find the request ID in your bet history or recent bets table
          </p>
        </div>

        <Button
          onClick={handleVerify}
          disabled={!requestId.trim() || loading}
          className="w-full"
          isLoading={loading}
        >
          {loading ? "Verifying..." : "Verify Bet"}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {verification && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              {verification.overallStatus}
            </h2>
            {verification.bet && (
              <div className="text-sm text-gray-400 space-y-1">
                <p>Player: {verification.bet.player}</p>
                <p>Bet Amount: {verification.bet.betAmount}</p>
                <p>
                  Target Multiplier:{" "}
                  {(Number(verification.bet.targetMultiplier) / 100).toFixed(2)}
                  x
                </p>
                <p>
                  Limbo Multiplier:{" "}
                  {verification.bet.limboMultiplier
                    ? (Number(verification.bet.limboMultiplier) / 100).toFixed(
                        2
                      ) + "x"
                    : "N/A"}
                </p>
                <p>Result: {verification.bet.win ? "🎉 WIN" : "❌ LOSS"}</p>
                <p>Payout: {verification.bet.payout}</p>
              </div>
            )}
          </div>

          {/* Verification Steps */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-4 py-3 text-left text-white">
                    Verification Step
                  </th>
                  <th className="px-4 py-3 text-center text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {verification.verificationSteps.map((step) => (
                  <tr key={step.step} className="border-t border-gray-700">
                    <td className="px-4 py-3 text-gray-300">
                      <div>
                        <p className="font-medium">
                          {step.step}. {step.description}
                        </p>
                        {step.data && Object.keys(step.data).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                              View details
                            </summary>
                            <div className="mt-2 text-xs text-gray-400 space-y-1 ml-4">
                              {Object.entries(step.data).map(([key, value]) => (
                                <p key={key}>
                                  <span className="font-medium">{key}:</span>{" "}
                                  {typeof value === "boolean"
                                    ? value
                                      ? "Yes"
                                      : "No"
                                    : String(value)}
                                </p>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-2xl">
                      {step.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
