"use client";

import { useState, useEffect } from "react";
import { Copy, X, ArrowDown, AlertTriangle } from "lucide-react";
import {
  useAccount,
  useSendTransaction,
  useBalance,
  useSwitchChain,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CHAIN } from "@/lib/constants";
import { getEthValueFromUsd, getUsdValueFromEth } from "@/lib/utils/price";

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  currentBalance: string;
  userId?: string | null;
  onSuccess?: () => void;
}

export function FundingModal({
  isOpen,
  onClose,
  walletAddress,
  currentBalance,
  userId,
  onSuccess,
}: FundingModalProps) {
  const [amount, setAmount] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [usdBalance, setUsdBalance] = useState<number | null>(null);
  const [ethAmount, setEthAmount] = useState<number | null>(null);
  const [currentBalanceUsd, setCurrentBalanceUsd] = useState<number | null>(null);

  const { address: userAddress, isConnected, chainId } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const { data: userBalance } = useBalance({
    address: userAddress,
  });

  // Convert user balance to USD
  useEffect(() => {
    if (userBalance) {
      const ethBalance = parseFloat(formatEther(userBalance.value));
      getUsdValueFromEth(ethBalance)
        .then(setUsdBalance)
        .catch(() => setUsdBalance(null));
    } else {
      setUsdBalance(null);
    }
  }, [userBalance]);

  // Convert current balance to USD
  useEffect(() => {
    if (currentBalance) {
      const ethBalance = parseFloat(currentBalance);
      getUsdValueFromEth(ethBalance)
        .then(setCurrentBalanceUsd)
        .catch(() => setCurrentBalanceUsd(null));
    } else {
      setCurrentBalanceUsd(null);
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

  if (!isOpen) return null;

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchToBaseSepolia = async () => {
    try {
      await switchChain({ chainId: CHAIN.id });
    } catch (error) {
      console.error(`Failed to switch to ${CHAIN.name}:`, error);
      setError(`Failed to switch to ${CHAIN.name} network`);
    }
  };

  const handleFund = async () => {
    if (!amount || !userAddress || !userId || !ethAmount) {
      setError("Please enter an amount and ensure wallet is connected");
      return;
    }

    // Check if we're on the correct network
    if (chainId !== CHAIN.id) {
      setError(`Please switch to ${CHAIN.name} network to fund your wallet`);
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

    setError("");
    setIsFunding(true);

    try {
      // Send transaction directly to server wallet with ETH amount
      const txHash = await sendTransaction({
        to: walletAddress as `0x${string}`,
        value: parseEther(ethAmount.toString()),
      });

      console.log("✅ Funding transaction sent:", txHash);
      
      setAmount("");
      
      // Call onSuccess callback to refresh balance
      if (onSuccess) {
        console.log("🔄 Triggering balance refresh...");
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Funding failed");
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full">
        <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[0px_4px_0px_0px_#000000]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-bold text-black"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Fund Wallet
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
              Current Balance
            </div>
            <div
              className="text-lg font-bold text-black"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              {currentBalanceUsd !== null
                ? `$${currentBalanceUsd.toFixed(2)}`
                : "$0.00"}
            </div>
            <div className="text-xs text-gray-500">
              {parseFloat(currentBalance).toFixed(4)} ETH
            </div>
          </div>

          {/* Wallet Connection Status */}
          {!isConnected && (
            <div className="p-3 bg-yellow-100 border-2 border-black rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-black" />
                <span
                  className="text-sm text-black"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  Connect your wallet to fund
                </span>
              </div>
            </div>
          )}

          {/* Network Status */}
          {isConnected && chainId !== CHAIN.id && (
            <div className="p-3 bg-red-100 border-2 border-black rounded-lg mb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-black" />
                  <span
                    className="text-sm text-black"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Switch to {CHAIN.name} to fund
                  </span>
                </div>
                <button
                  onClick={handleSwitchToBaseSepolia}
                  className="text-xs px-3 py-1 bg-black text-white rounded-lg border-2 border-black hover:bg-gray-800 transition-colors"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  Switch
                </button>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div
                className="text-sm font-semibold text-black"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                Amount to Fund (USD)
              </div>
              {usdBalance !== null && (
                <div className="text-xs text-gray-600">
                  Balance: ${usdBalance.toFixed(2)}
                </div>
              )}
            </div>
            <input
              type="number"
              placeholder="10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2574ff]"
            />
            {ethAmount !== null && (
              <div className="text-xs text-gray-600">
                ≈ {ethAmount.toFixed(6)} ETH
              </div>
            )}
          </div>

          {/* Server Wallet Address */}
          <div className="space-y-2 mb-4">
            <div
              className="text-sm font-semibold text-black"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Server Wallet
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-white rounded text-xs text-gray-800 overflow-hidden text-ellipsis border-2 border-black">
                {walletAddress}
              </code>
              <button
                onClick={handleCopyAddress}
                className="px-2 py-2 border-2 border-black rounded hover:bg-gray-100 transition-colors"
              >
                {copied ? (
                  <span
                    className="text-xs text-green-600"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Copied!
                  </span>
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
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

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isFunding}
              className="flex-1 py-2 px-4 bg-white text-black rounded-lg border-2 border-black hover:bg-gray-100 disabled:opacity-50 transition-colors"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleFund}
              disabled={
                isFunding || !amount || !isConnected || chainId !== CHAIN.id
              }
              className="flex-1 py-2 px-4 bg-[#2574ff] text-white rounded-lg border-2 border-black shadow-[0px_2px_0px_0px_#000000] hover:translate-y-[1px] hover:shadow-[0px_1px_0px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              {isFunding ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Funding...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ArrowDown className="w-3 h-3" />
                  Fund
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
