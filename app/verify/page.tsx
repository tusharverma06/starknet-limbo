"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Check, X, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface VerificationData {
  success: boolean;
  betId: string;
  verified: boolean;
  steps: {
    step0: {
      userWalletAddress: string | null;
      custodialWalletAddress: string | null;
      signerAddress: string | null;
      siweSignature: string | null;
      siweMessage: string | null;
      siweExpiresAt: Date | null;
      signatureError: string | null;
    };
    step1: {
      betMessage: string | null;
      betSignature: string | null;
      custodialWalletAddress: string | null;
    };
    step2: {
      betSignatureValid: boolean;
      serverSeedHashInMessage: string | undefined;
      serverSeedHashInBet: string;
      hashMatches: boolean;
    };
    step3: {
      serverSeed: string | null;
      serverSeedHash: string;
      calculatedHash: string | null;
      serverSeedHashMatches: boolean;
      randomValue: string;
      randomFloat: number;
      simulatedMultiplier: number;
      targetMultiplier: number;
      simulatedPayout: string;
      houseEdge: number;
    };
    step4: {
      actualPayout: string;
      simulatedPayout: string;
      payoutMatches: boolean;
    };
    step5: {
      txHash: string | null;
      transactionData: Record<string, unknown> | null;
      expectedPayout: string;
      actualTxValue: string;
      settlementDelta: string;
    };
    step6: {
      balanceDeltasMatch: boolean | null;
      verified: string | boolean;
    };
  };
  bet: {
    id: string;
    wager: string;
    wagerUsd: string | null;
    payout: string;
    payoutUsd: string | null;
    outcome: string;
    targetMultiplier: string;
    limboMultiplier: string | null;
    ethPriceUsd: string | null;
    createdAt: Date;
  };
}

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const [betId, setBetId] = useState("");

  // Auto-load from URL params
  useEffect(() => {
    const betIdParam = searchParams.get("betId");
    if (betIdParam) {
      setBetId(betIdParam);
    }
  }, [searchParams]);

  // Auto-verify when betId changes from URL
  useEffect(() => {
    if (betId && searchParams.get("betId")) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betId, searchParams]);

  // Use React Query for verification
  const {
    data: verificationData,
    isLoading: isVerifying,
    error: queryError,
    refetch,
  } = useQuery<VerificationData>({
    queryKey: ["betVerification", betId],
    queryFn: async () => {
      if (!betId.trim()) {
        throw new Error("Please enter a bet ID");
      }

      const response = await fetch("/api/verify-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betId: betId.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      return data;
    },
    enabled: false, // Don't auto-fetch, only on manual trigger
    retry: false,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  const handleVerify = () => {
    refetch();
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <span className="text-yellow-400">-</span>;
    return status ? (
      <Check className="w-5 h-5 text-green-400" />
    ) : (
      <X className="w-5 h-5 text-red-400" />
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white/70 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">
              Provably Fair Verification
            </h1>
          </div>
          <p className="text-white/50">
            Verify the fairness of any bet using cryptographic proofs
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-[#2a2a2a] border border-white/10 rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Bet ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={betId}
              onChange={(e) => setBetId(e.target.value)}
              placeholder="Enter bet ID..."
              className="flex-1 bg-[#1a1a1a] border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-green-400"
              onKeyPress={(e) => e.key === "Enter" && handleVerify()}
            />
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Verification Results */}
        {verificationData && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div
              className={`p-6 rounded-lg border-2 ${
                verificationData.verified
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-yellow-500/10 border-yellow-500/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={verificationData.verified} />
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {verificationData.verified
                      ? "✅ Verification Passed"
                      : "⚠️ Verification Issues Found"}
                  </h2>
                  <p className="text-sm">Bet ID: {verificationData.betId}</p>
                </div>
              </div>
            </div>

            {/* Step 0: User Authentication */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <StatusIcon
                  status={
                    !!verificationData.steps.step0.signerAddress &&
                    !verificationData.steps.step0.signatureError
                  }
                />
                Step 0: User Authentication & Authorization
              </h3>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mb-4 text-sm text-blue-200">
                <strong>ℹ️ How it works:</strong> You signed a message with your{" "}
                <strong>external wallet</strong> (e.g., MetaMask) to authorize
                us to use your <strong>custodial wallet</strong> for placing
                bets. The signature proves that YOU gave permission.
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-white/50">
                    Your External Wallet (the one that signed):
                  </span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step0.userWalletAddress || "N/A"}
                  </code>
                  <span className="text-xs text-white/40 mt-1 block">
                    ✍️ This is the wallet you used to sign the authorization
                    message
                  </span>
                </div>
                <div>
                  <span className="text-white/50">
                    Custodial Wallet (authorized to place bets):
                  </span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step0.custodialWalletAddress ||
                      "N/A"}
                  </code>
                  <span className="text-xs text-white/40 mt-1 block">
                    🔐 This is the server-managed wallet that places bets on
                    your behalf
                  </span>
                </div>
                <div>
                  <span className="text-white/50">
                    Signer (wallet that authorized):
                  </span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step0.signerAddress || "N/A"}
                  </code>
                  <span className="text-xs text-white/40 mt-1 block">
                    ✍️ This is the wallet that signed the authorization message
                  </span>
                </div>
                {verificationData.steps.step0.signatureError && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                    <span className="text-xs text-red-300">
                      ⚠️ {verificationData.steps.step0.signatureError}
                    </span>
                  </div>
                )}
                {verificationData.steps.step0.siweMessage && (
                  <details className="mt-3">
                    <summary className="text-white/50 cursor-pointer hover:text-white/70">
                      View Authorization Message
                    </summary>
                    <pre className="mt-2 bg-[#1a1a1a] p-3 rounded font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                      {verificationData.steps.step0.siweMessage}
                    </pre>
                  </details>
                )}
                {verificationData.steps.step0.siweSignature && (
                  <details className="mt-3">
                    <summary className="text-white/50 cursor-pointer hover:text-white/70">
                      View Signature (Cryptographic Proof)
                    </summary>
                    <code className="block mt-2 bg-[#1a1a1a] p-2 rounded font-mono text-xs break-all">
                      {verificationData.steps.step0.siweSignature}
                    </code>
                  </details>
                )}
              </div>
            </div>

            {/* Step 1 & 2: Bet Signature */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <StatusIcon
                  status={verificationData.steps.step2.betSignatureValid}
                />
                Step 1-2: Bet Signature Verification
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-white/50">Bet Message:</span>
                  <pre className="mt-1 bg-[#1a1a1a] p-3 rounded font-mono text-xs overflow-x-auto">
                    {verificationData.steps.step1.betMessage
                      ? JSON.stringify(
                          JSON.parse(verificationData.steps.step1.betMessage),
                          null,
                          2
                        )
                      : "N/A"}
                  </pre>
                </div>
                <div>
                  <span className="text-white/50">Bet Signature:</span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs break-all">
                    {verificationData.steps.step1.betSignature || "N/A"}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon
                    status={verificationData.steps.step2.betSignatureValid}
                  />
                  <span>Signature signed by custodial wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon
                    status={verificationData.steps.step2.hashMatches}
                  />
                  <span>Server seed hash matches message</span>
                </div>
              </div>
            </div>

            {/* Step 3: Random Number Generation */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <StatusIcon
                  status={verificationData.steps.step3.serverSeedHashMatches}
                />
                Step 3: Random Number Generation
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-white/50">Server Seed:</span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step3.serverSeed || "N/A"}
                  </code>
                </div>
                <div>
                  <span className="text-white/50">
                    Server Seed Hash (SHA256):
                  </span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step3.serverSeedHash}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon
                    status={verificationData.steps.step3.serverSeedHashMatches}
                  />
                  <span>
                    Hash verification:{" "}
                    {verificationData.steps.step3.serverSeedHashMatches
                      ? "MATCH"
                      : "MISMATCH"}
                  </span>
                </div>
                <div>
                  <span className="text-white/50">Random Value:</span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step3.randomValue}
                  </code>
                </div>
                <div>
                  <span className="text-white/50">Random Float (0-1):</span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step3.randomFloat.toFixed(10)}
                  </code>
                </div>
                <div>
                  <span className="text-white/50">
                    Simulated Limbo Multiplier:
                  </span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step3.simulatedMultiplier.toFixed(
                      2
                    )}
                    x
                  </code>
                </div>
                <div>
                  <span className="text-white/50">Target Multiplier:</span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step3.targetMultiplier.toFixed(2)}x
                  </code>
                </div>
                <div>
                  <span className="text-white/50">House Edge:</span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {(verificationData.steps.step3.houseEdge * 100).toFixed(0)}%
                  </code>
                </div>
              </div>
            </div>

            {/* Step 4: Payout Verification */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <StatusIcon
                  status={verificationData.steps.step4.payoutMatches}
                />
                Step 4: Payout Correctness
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-white/50">Actual Payout (Wei):</span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step4.actualPayout}
                  </code>
                </div>
                <div>
                  <span className="text-white/50">Simulated Payout (Wei):</span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step4.simulatedPayout}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon
                    status={verificationData.steps.step4.payoutMatches}
                  />
                  <span>
                    Payout values match:{" "}
                    {verificationData.steps.step4.payoutMatches
                      ? "TRUE"
                      : "FALSE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 5: Transaction Verification */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Step 5: On-Chain Transaction Verification
              </h3>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mb-4 text-sm text-blue-200">
                <strong>ℹ️ What we&apos;re checking:</strong> For winning bets,
                we verify that the payout transaction on the blockchain matches
                the expected payout amount.
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-white/50">Transaction Hash:</span>
                  {verificationData.steps.step5.txHash ? (
                    <a
                      href={`https://basescan.org/tx/${verificationData.steps.step5.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs text-blue-400 hover:text-blue-300 break-all"
                    >
                      {verificationData.steps.step5.txHash}
                    </a>
                  ) : (
                    <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                      No transaction (loss - no payout)
                    </code>
                  )}
                </div>
                <div>
                  <span className="text-white/50">Expected Payout (Wei):</span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step5.expectedPayout}
                  </code>
                  <span className="text-xs text-white/40 mt-1 block">
                    {(
                      Number(verificationData.steps.step5.expectedPayout) / 1e18
                    ).toFixed(8)}{" "}
                    ETH
                  </span>
                </div>
                <div>
                  <span className="text-white/50">
                    Actual Transaction Value (Wei):
                  </span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step5.actualTxValue || "0"}
                  </code>
                  <span className="text-xs text-white/40 mt-1 block">
                    {(
                      Number(
                        verificationData.steps.step5.actualTxValue || "0"
                      ) / 1e18
                    ).toFixed(8)}{" "}
                    ETH
                  </span>
                </div>
                <div>
                  <span className="text-white/50">
                    Net Balance Change (Settlement Delta):
                  </span>
                  <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                    {verificationData.steps.step5.settlementDelta}
                  </code>
                  <span className="text-xs text-white/40 mt-1 block">
                    {(
                      Number(verificationData.steps.step5.settlementDelta) /
                      1e18
                    ).toFixed(8)}{" "}
                    ETH (payout - wager for wins, -wager for losses)
                  </span>
                </div>
                {verificationData.steps.step5.transactionData && (
                  <details className="mt-3">
                    <summary className="text-white/50 cursor-pointer hover:text-white/70">
                      View Raw Transaction Data
                    </summary>
                    <pre className="mt-2 bg-[#1a1a1a] p-3 rounded font-mono text-xs overflow-x-auto max-h-96">
                      {JSON.stringify(
                        verificationData.steps.step5.transactionData,
                        null,
                        2
                      )}
                    </pre>
                  </details>
                )}
              </div>
            </div>

            {/* Step 6: Final Verification */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <StatusIcon
                  status={
                    typeof verificationData.steps.step6.verified === "boolean"
                      ? verificationData.steps.step6.verified
                      : null
                  }
                />
                Step 6: Final Settlement Verification
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <StatusIcon
                    status={verificationData.steps.step6.balanceDeltasMatch}
                  />
                  <span>
                    Settlement values match on-chain transaction:{" "}
                    {String(
                      verificationData.steps.step6.verified
                    ).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Finished */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-green-400">✓ Finished</h2>
              <p className="text-white/70 mt-2">
                Verification process completed. All cryptographic proofs have
                been checked.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
