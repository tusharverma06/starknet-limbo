"use client";

import { useState, useEffect } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Input } from "./Input";
import { Copy, X, ArrowDown, AlertTriangle } from "lucide-react";
import {
  useAccount,
  useSendTransaction,
  useBalance,
  useSwitchChain,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { baseSepolia } from "wagmi/chains";
import { getEthValueFromUsd, getUsdValueFromEth } from "@/lib/utils/price";

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  currentBalance: string;
  userId?: string;
}

export function FundingModal({
  isOpen,
  onClose,
  walletAddress,
  currentBalance,
  userId,
}: FundingModalProps) {
  const [amount, setAmount] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [usdBalance, setUsdBalance] = useState<number | null>(null);
  const [ethAmount, setEthAmount] = useState<number | null>(null);

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
      await switchChain({ chainId: baseSepolia.id });
    } catch (error) {
      console.error("Failed to switch to Base Sepolia:", error);
      setError("Failed to switch to Base Sepolia network");
    }
  };

  const handleFund = async () => {
    if (!amount || !userAddress || !userId || !ethAmount) {
      setError("Please enter an amount and ensure wallet is connected");
      return;
    }

    // Check if we're on the correct network
    if (chainId !== baseSepolia.id) {
      setError("Please switch to Base Sepolia network to fund your wallet");
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
      await sendTransaction({
        to: walletAddress as `0x${string}`,
        value: parseEther(ethAmount.toString()),
      });

      setAmount("");
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
        <Card className="p-4 bg-white border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-black">Fund Wallet</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Balance */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="text-xs text-gray-600 mb-1">Current Balance</div>
            <div className="text-lg font-bold text-black">
              {parseFloat(currentBalance).toFixed(4)} ETH
            </div>
          </div>

          {/* Wallet Connection Status */}
          {!isConnected && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Connect your wallet to fund
                </span>
              </div>
            </div>
          )}

          {/* Network Status */}
          {isConnected && chainId !== baseSepolia.id && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">
                    Switch to Base Sepolia to fund
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSwitchToBaseSepolia}
                  className="text-xs px-2 py-1"
                >
                  Switch
                </Button>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-black">
                Amount to Fund (USD)
              </div>
              {usdBalance !== null && (
                <div className="text-xs text-gray-500">
                  Balance: ${usdBalance.toFixed(2)}
                </div>
              )}
            </div>
            <Input
              type="number"
              placeholder="10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
            {ethAmount !== null && (
              <div className="text-xs text-gray-500">
                ≈ {ethAmount.toFixed(6)} ETH
              </div>
            )}
          </div>

          {/* Server Wallet Address */}
          <div className="space-y-2 mb-4">
            <div className="text-sm font-semibold text-black">
              Server Wallet
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-gray-50 rounded text-xs text-gray-800 overflow-hidden text-ellipsis border border-gray-200">
                {walletAddress}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="px-2"
              >
                {copied ? (
                  <span className="text-xs text-green-600">Copied!</span>
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <span className="text-xs text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isFunding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFund}
              className="flex-1"
              disabled={
                isFunding ||
                !amount ||
                !isConnected ||
                chainId !== baseSepolia.id
              }
            >
              {isFunding ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Funding...
                </>
              ) : (
                <>
                  <ArrowDown className="w-3 h-3 mr-1" />
                  Fund
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
