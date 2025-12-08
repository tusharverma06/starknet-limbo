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
      txDirectionValid: boolean;
      txDirectionError: string | null;
      houseWalletAddress: string;
      userCustodialWallet: string | null;
    };
    step6: {
      balanceDeltasMatch: boolean | null;
      verified: string | boolean;
      settlementVerified: boolean;
      requiresTxHash: boolean;
      hasTxHash: boolean;
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
            {/* Step 0: User Authentication */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {` >>> Checking message signature`}
              </h3>

              <div className="space-y-3 text-sm">
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
                <div className="flex items-center gap-2">
                  <StatusIcon
                    status={
                      !!verificationData.steps.step0.signerAddress &&
                      !verificationData.steps.step0.signatureError
                    }
                  />
                  {`>>> 1. Check that the login message (containing authentication key) is signed by wallet: ${
                    verificationData.steps.step0.signerAddress
                      ? "True"
                      : "False"
                  }`}
                </div>
              </div>
            </div>

            {/* Step 1 & 2: Bet Signature */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {` >>> Checking message signature`}
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
                  {`>>> 2. Check that the bet message (containing bet details) is signed by custodial wallet: ${
                    verificationData.steps.step2.betSignatureValid
                      ? "True"
                      : "False"
                  }`}
                </div>
                {/* <div className="flex items-center gap-2">
                  <StatusIcon
                    status={verificationData.steps.step2.hashMatches}
                  />
                  <span>Server seed hash matches message</span>
                </div> */}
              </div>
            </div>

            {/* Step 3: Random Number Generation */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {`>>> Fetching from bet details and verifying server seed hash`}
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
                  {`>>> 3. Check that the server seed hash (commitment) matches the hash in the bet message: ${
                    verificationData.steps.step3.serverSeedHashMatches
                      ? "True"
                      : "False"
                  }`}
                </div>
                <div>
                  <span className="text-white/50">Random Value Calculation:</span>
                  <div className="mt-2 space-y-2">
                    <div className="bg-[#1a1a1a] p-3 rounded">
                      <p className="text-xs text-white/50 mb-2">Formula:</p>
                      <code className="block font-mono text-xs text-blue-300">
                        randomValue = SHA256(serverSeed + playerId + betId)
                      </code>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded space-y-3">
                      <div>
                        <p className="text-xs text-white/50 mb-1">Server Seed:</p>
                        <code className="block font-mono text-xs break-all text-green-300">
                          {verificationData.steps.step3.serverSeed || "N/A"}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Player ID:</p>
                        <code className="block font-mono text-xs break-all text-green-300">
                          {verificationData.bet.id ?
                            JSON.parse(verificationData.steps.step1.betMessage || '{}')?.playerId ||
                            verificationData.steps.step0.custodialWalletAddress || "N/A"
                            : "N/A"}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Bet ID:</p>
                        <code className="block font-mono text-xs break-all text-green-300">
                          {verificationData.bet.id}
                        </code>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded">
                      <p className="text-xs text-white/50 mb-2">
                        Calculated Random Value:
                      </p>
                      <code className="block font-mono text-xs break-all">
                        {verificationData.steps.step3.randomValue}
                      </code>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-white/50">Random Float (0-1) Calculation:</span>
                  <div className="mt-2 space-y-2">
                    <div className="bg-[#1a1a1a] p-3 rounded">
                      <p className="text-xs text-white/50 mb-2">Formula:</p>
                      <code className="block font-mono text-xs text-blue-300">
                        randomFloat = BigInt(randomValue) / 2^256
                      </code>
                      <p className="text-xs text-white/40 mt-2">
                        Converts full 256-bit hash to float between 0-1
                      </p>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded space-y-3">
                      <div>
                        <p className="text-xs text-white/50 mb-1">Full random value (hex):</p>
                        <code className="block font-mono text-xs break-all text-green-300">
                          {verificationData.steps.step3.randomValue}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Random value as BigInt (decimal):</p>
                        <code className="block font-mono text-xs break-all text-green-300">
                          {BigInt("0x" + verificationData.steps.step3.randomValue).toLocaleString()}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Max value (2^256):</p>
                        <code className="block font-mono text-xs break-all text-green-300">
                          115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457,584,007,913,129,639,936
                        </code>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded">
                      <p className="text-xs text-white/50 mb-2">
                        Calculated Random Float:
                      </p>
                      <code className="block font-mono text-xs text-yellow-300">
                        {verificationData.steps.step3.randomFloat.toFixed(10)}
                      </code>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-white/50">Game Number Calculation:</span>
                  <div className="mt-2 space-y-2">
                    <div className="bg-[#1a1a1a] p-3 rounded">
                      <p className="text-xs text-white/50 mb-2">Formula:</p>
                      <code className="block font-mono text-xs text-blue-300">
                        gameNumber = (BigInt(randomValue) % 1,000,000,000) + 1
                      </code>
                      <p className="text-xs text-white/40 mt-2">
                        Converts random value to a number between 1 and 1 billion
                      </p>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded space-y-3">
                      <div>
                        <p className="text-xs text-white/50 mb-1">Random value (BigInt):</p>
                        <code className="block font-mono text-xs break-all text-green-300">
                          {BigInt("0x" + verificationData.steps.step3.randomValue).toLocaleString()}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Modulo 1 billion:</p>
                        <code className="block font-mono text-xs break-all text-green-300">
                          {(BigInt("0x" + verificationData.steps.step3.randomValue) % BigInt(1e9)).toLocaleString()}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Game number (add 1):</p>
                        <code className="block font-mono text-xs break-all text-yellow-300">
                          {((BigInt("0x" + verificationData.steps.step3.randomValue) % BigInt(1e9)) + BigInt(1)).toLocaleString()}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-white/50">Limbo Multiplier Calculation:</span>
                  <div className="mt-2 space-y-2">
                    <div className="bg-[#1a1a1a] p-3 rounded">
                      <p className="text-xs text-white/50 mb-2">Formula:</p>
                      <code className="block font-mono text-xs text-blue-300">
                        multiplier = (1 - houseEdge) * 1,000,000,000 / gameNumber
                      </code>
                      <p className="text-xs text-white/40 mt-2">
                        Lower game numbers = higher multipliers
                      </p>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded space-y-3">
                      <div>
                        <p className="text-xs text-white/50 mb-1">House edge:</p>
                        <code className="block font-mono text-xs text-green-300">
                          {(verificationData.steps.step3.houseEdge * 100).toFixed(0)}% (factor: {1 - verificationData.steps.step3.houseEdge})
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Game number:</p>
                        <code className="block font-mono text-xs text-green-300">
                          {((BigInt("0x" + verificationData.steps.step3.randomValue) % BigInt(1e9)) + BigInt(1)).toLocaleString()}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Calculation:</p>
                        <code className="block font-mono text-xs text-green-300">
                          {(1 - verificationData.steps.step3.houseEdge).toFixed(2)} × 1,000,000,000 / {((BigInt("0x" + verificationData.steps.step3.randomValue) % BigInt(1e9)) + BigInt(1)).toLocaleString()}
                        </code>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded">
                      <p className="text-xs text-white/50 mb-2">
                        Calculated Limbo Multiplier:
                      </p>
                      <code className="block font-mono text-lg text-yellow-300 font-bold">
                        {verificationData.steps.step3.simulatedMultiplier.toFixed(2)}x
                      </code>
                    </div>
                  </div>
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
                {`>>> Checking payout correctness`}
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
                  {`>>> 4. Check that the payout values match the simulated payout: ${
                    verificationData.steps.step4.payoutMatches
                      ? "True"
                      : "False"
                  }`}
                </div>
              </div>
            </div>

            {/* Step 5: Transaction Verification */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {`>>> Checking on-chain transaction verification`}
              </h3>

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
                    <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs text-yellow-400">
                      {verificationData.bet.outcome === "win"
                        ? "⏳ Pending - Payout not yet executed"
                        : "No transaction (loss - no payout)"}
                    </code>
                  )}
                </div>

                {verificationData.steps.step5.txHash && (
                  <>
                    <div>
                      <span className="text-white/50">
                        Expected Payout (Wei):
                      </span>
                      <code className="block mt-1 bg-[#1a1a1a] p-2 rounded font-mono text-xs">
                        {verificationData.steps.step5.expectedPayout}
                      </code>
                      <span className="text-xs text-white/40 mt-1 block">
                        {(
                          Number(verificationData.steps.step5.expectedPayout) /
                          1e18
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
                  </>
                )}

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
                {`>>> Checking that the settlement values match the on-chain transaction values`}
              </h3>

              {/* Pending Settlement Warning */}
              {verificationData.steps.step6.requiresTxHash &&
                !verificationData.steps.step6.hasTxHash && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 mb-4 text-sm text-yellow-200">
                    <strong>⚠️ Pending Settlement:</strong> This is a winning
                    bet that hasn&apos;t been paid out yet. The payout
                    transaction will be executed shortly. You can verify again
                    once the transaction is completed.
                  </div>
                )}

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <StatusIcon
                    status={
                      verificationData.steps.step6.settlementVerified
                        ? true
                        : verificationData.steps.step6.requiresTxHash &&
                          !verificationData.steps.step6.hasTxHash
                        ? null
                        : false
                    }
                  />
                  <div className="flex-1">
                    <span className="text-white/90">
                      Settlement verification:{" "}
                      <strong>
                        {verificationData.steps.step6.settlementVerified
                          ? "✅ VERIFIED"
                          : verificationData.steps.step6.requiresTxHash &&
                            !verificationData.steps.step6.hasTxHash
                          ? "⏳ PENDING"
                          : "❌ FAILED"}
                      </strong>
                    </span>
                    {verificationData.steps.step6.requiresTxHash && (
                      <div className="mt-2 text-xs text-white/60">
                        <div>
                          Requires payout transaction:{" "}
                          {verificationData.steps.step6.hasTxHash
                            ? "✅ Yes (found)"
                            : "⏳ Yes (pending)"}
                        </div>
                        {typeof verificationData.steps.step6.verified ===
                          "string" && (
                          <div className="mt-1 text-yellow-200">
                            Note: {verificationData.steps.step6.verified}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {verificationData.steps.step6.hasTxHash && (
                  <div className="mt-3 p-3 bg-[#1a1a1a] rounded space-y-3">
                    <div>
                      <span className="text-white/50 text-xs">
                        Expected Payout (calculated from bet):
                      </span>
                      <code className="block mt-1 bg-[#0a0a0a] p-2 rounded font-mono text-xs">
                        {verificationData.steps.step5.expectedPayout} wei
                      </code>
                      <span className="text-xs text-white/40 mt-1 block">
                        {(
                          Number(verificationData.steps.step5.expectedPayout) /
                          1e18
                        ).toFixed(8)}{" "}
                        ETH
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50 text-xs">
                        Actual Payout (on-chain transaction value):
                      </span>
                      <code className="block mt-1 bg-[#0a0a0a] p-2 rounded font-mono text-xs">
                        {verificationData.steps.step5.actualTxValue || "0"} wei
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
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-white/50 text-xs">
                        Net Profit (payout - wager):
                      </span>
                      <code className="block mt-1 bg-[#0a0a0a] p-2 rounded font-mono text-xs">
                        {verificationData.steps.step5.settlementDelta} wei
                      </code>
                      <span className="text-xs text-white/40 mt-1 block">
                        {(
                          Number(verificationData.steps.step5.settlementDelta) /
                          1e18
                        ).toFixed(8)}{" "}
                        ETH (your actual profit after deducting original bet)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <StatusIcon
                        status={verificationData.steps.step6.balanceDeltasMatch}
                      />
                      <span className="text-xs text-white/70">
                        Payout amount matches transaction:{" "}
                        <strong>
                          {verificationData.steps.step6.balanceDeltasMatch
                            ? "✅ Yes"
                            : "❌ No"}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Finished */}
            <div
              className={`${
                verificationData.verified
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : verificationData.steps.step6.requiresTxHash &&
                    !verificationData.steps.step6.hasTxHash
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              } border rounded-lg p-6 text-center`}
            >
              <h2 className="text-2xl font-bold">
                {verificationData.verified
                  ? "✓ Verified"
                  : verificationData.steps.step6.requiresTxHash &&
                    !verificationData.steps.step6.hasTxHash
                  ? "⏳ Pending Settlement"
                  : "❌ Verification Failed"}
              </h2>
              <p className="text-white/70 mt-2">
                {verificationData.verified
                  ? "Verification process completed. All cryptographic proofs have been checked and the payout transaction has been verified."
                  : verificationData.steps.step6.requiresTxHash &&
                    !verificationData.steps.step6.hasTxHash
                  ? "This bet is resolved and fair, but the payout transaction hasn't been executed yet. Check back soon."
                  : "Some verification checks failed. Please contact support for assistance."}
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
