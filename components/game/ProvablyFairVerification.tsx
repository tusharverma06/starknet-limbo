"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Copy, ExternalLink, Check } from "lucide-react";

interface SignatureData {
  r: string;
  s: string;
  v: number;
}

interface EventData {
  requestId?: string;
  player?: string;
  betAmount?: string;
  targetMultiplier?: number;
  [key: string]: string | number | boolean | undefined;
}

interface StepData {
  description?: string;
  signature?: SignatureData;
  eventData?: EventData;
  transactionHash?: string;
  vrfRequestTxHash?: string;
  vrfFulfillTxHash?: string;
  fulfillmentTxHash?: string;
  blockNumber?: number;
  matches?: boolean;
  verified?: boolean;
  formula?: string;
  proofOfRandomness?: string;
  randomWord?: string;
  clientSeed?: string;
  [key: string]:
    | string
    | number
    | boolean
    | SignatureData
    | EventData
    | undefined;
}

interface VerificationStep {
  step: number;
  description: string;
  status: string | "loading";
  data: StepData;
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
}

// Helper function to safely convert unknown values to string
const safeToString = (value: unknown): string => {
  if (value === null || value === undefined) return "N/A";
  return String(value);
};

// Helper function to check if a value is a transaction hash field
const isTransactionHashField = (key: string): boolean => {
  return [
    "transactionHash",
    "vrfRequestTxHash",
    "vrfFulfillTxHash",
    "fulfillmentTxHash",
  ].includes(key);
};

// Helper function to check if a field should be excluded from display
const isExcludedField = (key: string): boolean => {
  return ["description", "signature", "eventData"].includes(key);
};

export function ProvablyFairVerification({
  initialRequestId = "",
}: ProvablyFairVerificationProps = {}) {
  const [requestId, setRequestId] = useState(initialRequestId);
  const [verification, setVerification] = useState<VerificationResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [manualVerify, setManualVerify] = useState(!initialRequestId);

  const handleVerify = useCallback(async () => {
    if (!requestId.trim()) {
      setError("Please enter a request ID");
      return;
    }

    setLoading(true);
    setError(null);
    setVerification(null);

    try {
      // Initialize with loading state for all steps
      const loadingSteps: VerificationStep[] = [
        {
          step: 1,
          description: "Verify bet placement transaction on blockchain",
          status: "loading",
          data: {},
        },
        {
          step: 2,
          description: "Verify BetPlaced event was emitted correctly",
          status: "loading",
          data: {},
        },
        {
          step: 3,
          description: "Verify Chainlink VRF provided randomness",
          status: "loading",
          data: {},
        },
        {
          step: 4,
          description: "Check that the bet's payout is correct",
          status: "loading",
          data: {},
        },
        {
          step: 5,
          description: "Check that the bet's settlement values are correct",
          status: "loading",
          data: {},
        },
        {
          step: 6,
          description:
            "Check that the settlement values match the on-chain transaction",
          status: "loading",
          data: {},
        },
      ];

      setVerification({
        verificationSteps: loadingSteps,
        overallStatus: "⏳ Verifying...",
      });

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
        setVerification(null);
      } else {
        setVerification(data);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setError("Failed to verify bet. Please try again.");
      setVerification(null);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Auto-verify if initialRequestId is provided and not in manual mode
  useEffect(() => {
    if (initialRequestId && initialRequestId.trim() && !manualVerify) {
      handleVerify();
    }
  }, [initialRequestId, handleVerify, manualVerify]);

  return (
    <div className="w-full mx-auto p-4 sm:p-6 bg-white">
      <h1 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">
        Verify Bet Fairness
      </h1>

      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
        Verify this bet to ensure transparency and fairness. The system will
        check the VRF randomness and validate the bet outcome.
      </p>

      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Request ID (Bet ID):
            </label>
            {initialRequestId && (
              <button
                onClick={() => setManualVerify(!manualVerify)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {manualVerify ? "Auto-verify" : "Manual input"}
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              placeholder="Enter request ID (e.g., 0x...)"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleVerify();
                }
              }}
              className="w-full pr-10"
              disabled={!!initialRequestId && !manualVerify}
            />
            {requestId && (
              <button
                onClick={() => copyToClipboard(requestId, "betId")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
                title="Copy Bet ID"
              >
                {copiedText === "betId" ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            The request ID uniquely identifies this bet on the blockchain
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
          <div
            className={`p-3 sm:p-4 rounded-lg border ${
              verification.overallStatus.includes("✅")
                ? "bg-green-50 border-green-300"
                : "bg-gray-50 border-gray-300"
            }`}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-3">
              {verification.overallStatus}
            </h2>
            {verification.bet && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 text-xs">
                      Player Address
                    </span>
                    <p className="font-mono text-xs text-gray-900 break-all">
                      {verification.bet.player}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">Bet Amount</span>
                    <p className="font-semibold text-purple-600">
                      {(Number(verification.bet.betAmount) / 1e18).toFixed(6)}{" "}
                      ETH
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {verification.bet.betAmount} wei
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">
                      Target Multiplier
                    </span>
                    <p className="font-semibold text-orange-600">
                      {(
                        Number(verification.bet.targetMultiplier) / 100
                      ).toFixed(2)}
                      x
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 text-xs">
                      Limbo Multiplier
                    </span>
                    <p className="font-semibold text-orange-600">
                      {verification.bet.limboMultiplier
                        ? (
                            Number(verification.bet.limboMultiplier) / 100
                          ).toFixed(2) + "x"
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">Result</span>
                    <p
                      className={`font-bold text-lg ${
                        verification.bet.win ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {verification.bet.win ? "🎉 WIN" : "❌ LOSS"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">Payout</span>
                    <p className="font-semibold text-green-600">
                      {verification.bet.payout
                        ? `${(Number(verification.bet.payout) / 1e18).toFixed(
                            6
                          )} ETH`
                        : "0 ETH"}
                    </p>
                    {verification.bet.payout && (
                      <p className="text-xs text-gray-500 font-mono">
                        {verification.bet.payout} wei
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Verification Steps */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-300">
              <h3 className="font-semibold text-black text-sm sm:text-base">
                Verification Steps
              </h3>
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
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </summary>
                          <div className="mt-2 text-xs text-gray-700 space-y-3 ml-4 p-3 bg-gray-50 rounded border border-gray-200">
                            {step.data.description && (
                              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                <span className="font-medium">
                                  ℹ️ What happened:{" "}
                                </span>
                                {step.data.description}
                              </div>
                            )}

                            {step.data.signature && (
                              <div className="border-l-2 border-green-500 pl-3 space-y-2">
                                <div className="font-semibold text-green-700 flex items-center gap-1">
                                  🔐 Transaction Signature (Cryptographic Proof)
                                </div>
                                <div className="text-xs text-gray-600 mb-2 space-y-2">
                                  <p>
                                    This ECDSA signature proves the transaction
                                    was signed by the custodial wallet&apos;s
                                    private key.
                                  </p>
                                  <div className="bg-blue-50 border border-blue-200 rounded p-2 space-y-1">
                                    <p className="font-medium text-blue-900">
                                      📚 What is RSV?
                                    </p>
                                    <p>
                                      <span className="font-semibold">R:</span>{" "}
                                      First part of the signature - a point on
                                      the elliptic curve derived from the random
                                      nonce used during signing
                                    </p>
                                    <p>
                                      <span className="font-semibold">S:</span>{" "}
                                      Second part of the signature - proves
                                      knowledge of the private key without
                                      revealing it
                                    </p>
                                    <p>
                                      <span className="font-semibold">V:</span>{" "}
                                      Recovery ID (27 or 28) - helps recover the
                                      public key from the signature, enabling
                                      address verification
                                    </p>
                                    <p className="text-blue-700 font-medium mt-1">
                                      Together, these three values
                                      cryptographically prove that only the
                                      holder of the private key could have
                                      created this transaction.
                                    </p>
                                  </div>
                                </div>
                                {Object.entries(step.data.signature).map(
                                  ([sigKey, sigValue]) => (
                                    <div
                                      key={sigKey}
                                      className="flex flex-col gap-1 bg-white p-2 rounded border border-gray-200"
                                    >
                                      <span className="font-medium text-gray-700 uppercase">
                                        {sigKey}:
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-green-600 break-all flex-1">
                                          {String(sigValue)}
                                        </span>
                                        <button
                                          onClick={() =>
                                            copyToClipboard(
                                              String(sigValue),
                                              `sig-${sigKey}`
                                            )
                                          }
                                          className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                                          title={`Copy ${sigKey}`}
                                        >
                                          {copiedText === `sig-${sigKey}` ? (
                                            <Check className="w-3 h-3 text-green-600" />
                                          ) : (
                                            <Copy className="w-3 h-3 text-gray-600" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                            {/* Event data */}
                            {step.data.eventData && (
                              <div className="border-l-2 border-purple-500 pl-3 space-y-2">
                                <div className="font-semibold text-purple-700 flex items-center gap-1">
                                  📡 Smart Contract Event Emitted
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  The smart contract emitted this event on-chain
                                  with the following data:
                                </div>
                                {Object.entries(step.data.eventData).map(
                                  ([eventKey, eventValue]) => (
                                    <div
                                      key={eventKey}
                                      className="flex flex-col gap-1 bg-white p-2 rounded border border-gray-200"
                                    >
                                      <span className="font-medium text-gray-700 capitalize">
                                        {eventKey
                                          .replace(/([A-Z])/g, " $1")
                                          .trim()}
                                        :
                                      </span>
                                      <span className="font-mono text-xs text-purple-600 break-all">
                                        {eventValue != null
                                          ? String(eventValue)
                                          : "N/A"}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                            {/* Other technical details */}
                            {Object.entries(step.data)
                              .filter(([key]) => !isExcludedField(key))
                              .map(([key, value]) => {
                                // Skip complex objects that have already been rendered
                                if (
                                  typeof value === "object" &&
                                  value !== null
                                ) {
                                  return null;
                                }

                                // Format the value based on its type and content
                                let formattedValue = safeToString(value);
                                let valueClass = "text-gray-900";
                                let isSpecialField = false;

                                if (typeof value === "boolean") {
                                  formattedValue = value ? "✅ Yes" : "❌ No";
                                  valueClass = value
                                    ? "text-green-600"
                                    : "text-red-600";
                                } else if (isTransactionHashField(key)) {
                                  // Format transaction hashes - will be handled specially below
                                  formattedValue = safeToString(value);
                                  valueClass =
                                    "font-mono text-blue-600 text-xs";
                                  isSpecialField = true;
                                } else if (
                                  key.toLowerCase().includes("amount") ||
                                  key.toLowerCase().includes("payout")
                                ) {
                                  // Format amounts in wei to ETH
                                  try {
                                    const valueStr = safeToString(value);
                                    const wei = BigInt(valueStr);
                                    const eth = Number(wei) / 1e18;
                                    if (eth < 0.0001) {
                                      formattedValue = `${valueStr} wei`;
                                    } else {
                                      formattedValue = `${eth.toFixed(
                                        6
                                      )} ETH (${valueStr} wei)`;
                                    }
                                    valueClass = "font-mono text-purple-600";
                                  } catch {
                                    formattedValue = safeToString(value);
                                  }
                                } else if (
                                  key.toLowerCase().includes("multiplier")
                                ) {
                                  // Keep multiplier as is but highlight
                                  valueClass = "font-semibold text-orange-600";
                                } else if (key === "blockNumber") {
                                  valueClass = "font-mono text-indigo-600";
                                } else if (
                                  key.toLowerCase() === "matches" ||
                                  key.toLowerCase() === "verified"
                                ) {
                                  formattedValue = value ? "✅ Yes" : "❌ No";
                                  valueClass = value
                                    ? "text-green-600 font-semibold"
                                    : "text-red-600 font-semibold";
                                } else if (
                                  key === "formula" ||
                                  key === "proofOfRandomness"
                                ) {
                                  valueClass =
                                    "font-mono text-indigo-600 bg-indigo-50 p-1 rounded";
                                } else if (
                                  key === "randomWord" ||
                                  key === "clientSeed"
                                ) {
                                  valueClass = "font-mono text-orange-600";
                                  isSpecialField = true;
                                }

                                // Special handling for transaction hashes
                                if (
                                  isTransactionHashField(key) &&
                                  typeof value === "string"
                                ) {
                                  const hash = value;
                                  return (
                                    <div
                                      key={key}
                                      className="flex flex-col gap-1"
                                    >
                                      <span className="font-medium text-gray-600 capitalize text-xs">
                                        {key.replace(/([A-Z])/g, " $1").trim()}:
                                      </span>
                                      <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                                        <span className="font-mono text-xs text-blue-600 break-all flex-1">
                                          {hash}
                                        </span>
                                        <div className="flex gap-1 flex-shrink-0">
                                          <button
                                            onClick={() =>
                                              copyToClipboard(
                                                hash,
                                                `hash-${key}`
                                              )
                                            }
                                            className="p-1 hover:bg-gray-100 rounded"
                                            title="Copy hash"
                                          >
                                            {copiedText === `hash-${key}` ? (
                                              <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                              <Copy className="w-3 h-3 text-gray-600" />
                                            )}
                                          </button>
                                          <a
                                            href={`https://sepolia.basescan.org/tx/${hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 hover:bg-gray-100 rounded"
                                            title="View on BaseScan"
                                          >
                                            <ExternalLink className="w-3 h-3 text-blue-600" />
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    key={key}
                                    className="flex flex-col gap-1"
                                  >
                                    <span className="font-medium text-gray-600 capitalize text-xs">
                                      {key.replace(/([A-Z])/g, " $1").trim()}:
                                    </span>
                                    <span
                                      className={`${valueClass} ${
                                        isSpecialField
                                          ? "break-all"
                                          : "break-words"
                                      }`}
                                    >
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
                      {step.status === "loading" ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      ) : (
                        step.status
                      )}
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
