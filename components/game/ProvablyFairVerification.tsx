"use client";

import { useState, useEffect, useCallback } from "react";
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

interface ProvablyFairVerificationProps {
  initialRequestId?: string;
  onClose?: () => void;
}

export function ProvablyFairVerification({
  initialRequestId = "",
  onClose
}: ProvablyFairVerificationProps = {}) {
  const [requestId, setRequestId] = useState(initialRequestId);
  const [verification, setVerification] = useState<VerificationResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
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
  }, [requestId]);

  // Auto-verify if initialRequestId is provided
  useEffect(() => {
    if (initialRequestId && initialRequestId.trim()) {
      handleVerify();
    }
  }, [initialRequestId, handleVerify]);

  return (
    <div className="w-full mx-auto p-4 sm:p-6 bg-white">
      <h1 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">
        Verify Bet Fairness
      </h1>

      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
        Verify this bet to ensure transparency and fairness. The system will check
        the VRF randomness and validate the bet outcome.
      </p>

      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            disabled={!!initialRequestId}
          />
          <p className="text-xs text-gray-500 mt-1">
            The request ID uniquely identifies this bet on the blockchain
          </p>
        </div>

        {!initialRequestId && (
          <Button
            onClick={handleVerify}
            disabled={!requestId.trim() || loading}
            className="w-full"
            isLoading={loading}
          >
            {loading ? "Verifying..." : "Verify Bet"}
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying bet fairness...</p>
          </div>
        </div>
      )}

      {verification && (
        <div className="space-y-4 sm:space-y-6">
          {/* Overall Status */}
          <div className={`p-3 sm:p-4 rounded-lg border ${
            verification.overallStatus.includes('✅')
              ? 'bg-green-50 border-green-300'
              : 'bg-gray-50 border-gray-300'
          }`}>
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-3">
              {verification.overallStatus}
            </h2>
            {verification.bet && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 text-xs">Player Address</span>
                    <p className="font-mono text-xs text-gray-900 break-all">
                      {verification.bet.player}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">Bet Amount</span>
                    <p className="font-semibold text-purple-600">
                      {(Number(verification.bet.betAmount) / 1e18).toFixed(6)} ETH
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{verification.bet.betAmount} wei</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">Target Multiplier</span>
                    <p className="font-semibold text-orange-600">
                      {(Number(verification.bet.targetMultiplier) / 100).toFixed(2)}x
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 text-xs">Limbo Multiplier</span>
                    <p className="font-semibold text-orange-600">
                      {verification.bet.limboMultiplier
                        ? (Number(verification.bet.limboMultiplier) / 100).toFixed(2) + "x"
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">Result</span>
                    <p className={`font-bold text-lg ${verification.bet.win ? "text-green-600" : "text-red-600"}`}>
                      {verification.bet.win ? "🎉 WIN" : "❌ LOSS"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">Payout</span>
                    <p className="font-semibold text-green-600">
                      {verification.bet.payout
                        ? `${(Number(verification.bet.payout) / 1e18).toFixed(6)} ETH`
                        : "0 ETH"}
                    </p>
                    {verification.bet.payout && (
                      <p className="text-xs text-gray-500 font-mono">{verification.bet.payout} wei</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Verification Steps */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-300">
              <h3 className="font-semibold text-black text-sm sm:text-base">Verification Steps</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {verification.verificationSteps.map((step) => (
                <div key={step.step} className="px-3 sm:px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black mb-1 text-sm sm:text-base">
                        {step.step}. {step.description}
                      </p>
                      {step.data && Object.keys(step.data).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800 flex items-center gap-1">
                            <span>View cryptographic proof</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <div className="mt-2 text-xs text-gray-700 space-y-3 ml-4 p-3 bg-gray-50 rounded border border-gray-200">
                            {/* Description */}
                            {step.data.description && (
                              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                <span className="font-medium">ℹ️ What happened: </span>
                                {String(step.data.description)}
                              </div>
                            )}

                            {/* Signature proof */}
                            {step.data.signature && typeof step.data.signature === 'object' && (
                              <div className="border-l-2 border-green-500 pl-3 space-y-2">
                                <div className="font-semibold text-green-700 flex items-center gap-1">
                                  🔐 Transaction Signature (Cryptographic Proof)
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  This ECDSA signature proves the transaction was signed by the custodial wallet's private key:
                                </div>
                                {Object.entries(step.data.signature as Record<string, unknown>).map(([sigKey, sigValue]) => (
                                  <div key={sigKey} className="flex flex-col gap-1 bg-white p-2 rounded border border-gray-200">
                                    <span className="font-medium text-gray-700 uppercase">{sigKey}:</span>
                                    <span className="font-mono text-xs text-green-600 break-all">
                                      {String(sigValue)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Event data */}
                            {step.data.eventData && typeof step.data.eventData === 'object' && (
                              <div className="border-l-2 border-purple-500 pl-3 space-y-2">
                                <div className="font-semibold text-purple-700 flex items-center gap-1">
                                  📡 Smart Contract Event Emitted
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  The smart contract emitted this event on-chain with the following data:
                                </div>
                                {Object.entries(step.data.eventData as Record<string, unknown>).map(([eventKey, eventValue]) => (
                                  <div key={eventKey} className="flex flex-col gap-1 bg-white p-2 rounded border border-gray-200">
                                    <span className="font-medium text-gray-700 capitalize">
                                      {eventKey.replace(/([A-Z])/g, ' $1').trim()}:
                                    </span>
                                    <span className="font-mono text-xs text-purple-600 break-all">
                                      {String(eventValue)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Other technical details */}
                            {Object.entries(step.data).filter(([key]) =>
                              key !== 'description' && key !== 'signature' && key !== 'eventData'
                            ).map(([key, value]) => {
                              // Format the value based on its type and content
                              let formattedValue = String(value);
                              let valueClass = "text-gray-900";
                              let isSpecialField = false;

                              if (typeof value === "boolean") {
                                formattedValue = value ? "✅ Yes" : "❌ No";
                                valueClass = value ? "text-green-600" : "text-red-600";
                              } else if (key === "transactionHash" || key === "vrfRequestTxHash" || key === "vrfFulfillTxHash" || key === "fulfillmentTxHash") {
                                // Format transaction hashes
                                const hash = String(value);
                                formattedValue = hash;
                                valueClass = "font-mono text-blue-600 text-xs";
                                isSpecialField = true;
                              } else if (key.toLowerCase().includes("amount") || key.toLowerCase().includes("payout")) {
                                // Format amounts in wei to ETH
                                try {
                                  const wei = BigInt(value);
                                  const eth = Number(wei) / 1e18;
                                  if (eth < 0.0001) {
                                    formattedValue = `${value} wei`;
                                  } else {
                                    formattedValue = `${eth.toFixed(6)} ETH (${value} wei)`;
                                  }
                                  valueClass = "font-mono text-purple-600";
                                } catch {
                                  formattedValue = String(value);
                                }
                              } else if (key.toLowerCase().includes("multiplier")) {
                                // Keep multiplier as is but highlight
                                valueClass = "font-semibold text-orange-600";
                              } else if (key === "blockNumber") {
                                valueClass = "font-mono text-indigo-600";
                              } else if (key.toLowerCase() === "matches" || key.toLowerCase() === "verified") {
                                formattedValue = value ? "✅ Yes" : "❌ No";
                                valueClass = value ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
                              } else if (key === "formula" || key === "proofOfRandomness") {
                                valueClass = "font-mono text-indigo-600 bg-indigo-50 p-1 rounded";
                              } else if (key === "randomWord" || key === "clientSeed") {
                                valueClass = "font-mono text-orange-600";
                                isSpecialField = true;
                              }

                              return (
                                <div key={key} className="flex flex-col gap-1">
                                  <span className="font-medium text-gray-600 capitalize text-xs">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className={`${valueClass} ${isSpecialField ? 'break-all' : 'break-words'}`}>
                                    {formattedValue}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      )}
                    </div>
                    <div className="ml-2 sm:ml-4 text-xl sm:text-2xl flex-shrink-0">
                      {step.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
