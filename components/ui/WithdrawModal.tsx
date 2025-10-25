"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowUpRight, AlertTriangle } from "lucide-react";
import { getEthValueFromUsd, getUsdValueFromEth } from "@/lib/utils/price";
import { useWaitForTransactionReceipt } from "wagmi";
import { useOnClickOutside } from "usehooks-ts";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  currentBalance: string;
  onWithdraw: (amount: string, toAddress: string) => Promise<{ txHash: string }>;
  onSuccess?: () => void;
}

export function WithdrawModal({
  isOpen,
  onClose,
  currentBalance,
  onWithdraw,
  onSuccess,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState("");
  const [usdBalance, setUsdBalance] = useState<number | null>(null);
  const [ethAmount, setEthAmount] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Ref for click outside detection
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside (only if not withdrawing)
  useOnClickOutside(modalRef as React.RefObject<HTMLElement>, () => {
    if (!isWithdrawing && isOpen) {
      onClose();
    }
  });

  // Wait for transaction confirmation
  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Convert current balance to USD
  useEffect(() => {
    if (currentBalance) {
      const ethBalance = parseFloat(currentBalance);
      getUsdValueFromEth(ethBalance)
        .then(setUsdBalance)
        .catch(() => setUsdBalance(null));
    } else {
      setUsdBalance(null);
    }
  }, [currentBalance]);

  // Convert USD amount to ETH when amount changes
  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const usdValue = parseFloat(amount);
      if (usdValue > 0 && isFinite(usdValue)) {
        getEthValueFromUsd(usdValue)
          .then((ethValue) => {
            if (isFinite(ethValue) && ethValue > 0) {
              setEthAmount(ethValue);
            } else {
              setEthAmount(null);
            }
          })
          .catch(() => setEthAmount(null));
      } else {
        setEthAmount(null);
      }
    } else {
      setEthAmount(null);
    }
  }, [amount]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isTxConfirmed && txHash) {
      // Call onSuccess callback to refresh balance
      if (onSuccess) {
        onSuccess();
      }

      // Reset state and close modal
      setAmount("");
      setToAddress("");
      setTxHash(undefined);
      setIsWithdrawing(false);
      onClose();
    }
  }, [isTxConfirmed, txHash, onSuccess, onClose]);

  if (!isOpen) return null;

  const handleWithdraw = async () => {
    if (!amount || !toAddress) {
      setError("Please fill in all fields");
      return;
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (usdBalance && numAmount > usdBalance) {
      setError("Insufficient balance");
      return;
    }

    if (toAddress.length !== 42 || !toAddress.startsWith("0x")) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    setError("");
    setIsWithdrawing(true);

    try {
      const result = await onWithdraw(amount, toAddress);

      // Set the transaction hash to trigger waiting for confirmation
      setTxHash(result.txHash as `0x${string}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
      setIsWithdrawing(false);
    }
  };

  const handleMaxAmount = () => {
    // Leave some USD for gas fees (roughly $1-2)
    if (usdBalance) {
      const maxAmount = Math.max(0, usdBalance - 2);
      setAmount(maxAmount.toFixed(2));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full" ref={modalRef}>
        <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[0px_4px_0px_0px_#000000]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-bold text-black"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Withdraw Funds
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Balance */}
          <div className="p-3 bg-white rounded-lg border-2 border-black mb-4 shadow-[0px_2px_0px_0px_#000000]">
            <div
              className="text-xs text-gray-600 mb-1"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Available Balance
            </div>
            <div
              className="text-lg font-bold text-black"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              {parseFloat(currentBalance).toFixed(4)} ETH
            </div>
            {usdBalance !== null && (
              <div className="text-sm text-gray-600">
                ≈ ${usdBalance.toFixed(2)}
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2 mb-4">
            <div
              className="text-sm font-semibold text-black"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Amount to Withdraw (USD)
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                max={usdBalance || undefined}
                className="flex-1 px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2574ff]"
              />
              <button
                onClick={handleMaxAmount}
                className="px-3 py-2 text-xs bg-white text-black rounded-lg border-2 border-black hover:bg-gray-100 transition-colors"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                Max
              </button>
            </div>
            {ethAmount !== null && (
              <div className="text-xs text-gray-600">
                ≈ {ethAmount.toFixed(6)} ETH
              </div>
            )}
          </div>

          {/* Recipient Address */}
          <div className="space-y-2 mb-4">
            <div
              className="text-sm font-semibold text-black"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Recipient Address
            </div>
            <input
              type="text"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#2574ff]"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-100 border-2 border-black rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-black" />
                <span className="text-xs text-black">{error}</span>
              </div>
            </div>
          )}

          {/* Transaction Status Message */}
          {txHash && isWithdrawing && (
            <div className="p-3 bg-blue-50 border-2 border-black rounded-lg mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span
                    className="text-sm text-blue-900 font-semibold"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Waiting for confirmation...
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  Your withdrawal is being processed on the blockchain. This
                  may take a few moments.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isWithdrawing}
              className="flex-1 py-2 px-4 bg-white text-black rounded-lg border-2 border-black hover:bg-gray-100 disabled:opacity-50 transition-colors"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !amount || !toAddress}
              className="flex-1 py-2 px-4 bg-[#2574ff] text-white rounded-lg border-2 border-black shadow-[0px_2px_0px_0px_#000000] hover:translate-y-px hover:shadow-[0px_1px_0px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              {isWithdrawing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {txHash ? "Confirming..." : "Withdrawing..."}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ArrowUpRight className="w-3 h-3" />
                  Withdraw
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
