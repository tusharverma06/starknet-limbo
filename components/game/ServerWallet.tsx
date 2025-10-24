"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FundingModal } from "@/components/ui/FundingModal";
import { WithdrawModal } from "@/components/ui/WithdrawModal";
import { useServerWallet } from "@/hooks/useServerWallet";
import { usePendingSettlements } from "@/hooks/usePendingSettlements";
import {
  Copy,
  ExternalLink,
  Wallet,
  RefreshCw,
  Plus,
  Clock,
  Loader2,
} from "lucide-react";
import { formatETH } from "@/lib/utils/format";

interface ServerWalletProps {
  userId: string | null;
  onWalletReady?: (address: string) => void;
}

export function ServerWallet({ userId, onWalletReady }: ServerWalletProps) {
  const {
    wallet,
    balanceInEth,
    balanceInUsd,
    isLoading,
    isInitialLoading,
    error,
    createWallet,
    refreshBalance,
    withdraw,
  } = useServerWallet(userId);

  const {
    pendingCount,
    totalLocked,
    bets: pendingBets,
  } = usePendingSettlements();

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showFunding, setShowFunding] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (wallet?.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateWallet = async () => {
    try {
      await createWallet();
      if (wallet?.address && onWalletReady) {
        onWalletReady(wallet.address);
      }
    } catch (err) {
      console.error("Failed to create wallet:", err);
    }
  };

  const handleWithdraw = async (usdAmount: string, toAddress: string) => {
    try {
      await withdraw(toAddress, usdAmount);
      setShowWithdraw(false);
      await refreshBalance();
    } catch (err) {
      console.error("Withdrawal failed:", err);
      throw err;
    }
  };

  if (!userId) {
    return (
      <Card className="p-6 bg-white border border-gray-200">
        <div className="text-center text-gray-600">
          Please connect with Farcaster to manage your wallet
        </div>
      </Card>
    );
  }

  // If initial loading, show loading state
  if (isInitialLoading) {
    return null;
  }

  // If no wallet, show create button
  if (!wallet) {
    return (
      <Card className="p-6 bg-white border border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">Server Wallet</h3>
              <p className="text-sm text-gray-600">
                Create a secure server-side wallet to play
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            onClick={handleCreateWallet}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Creating Wallet..." : "Create Wallet"}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Your wallet will be created and secured on our servers</p>
            <p>• Private keys are encrypted and never exposed</p>
            <p>• You can fund and withdraw anytime</p>
            <p>
              • After creating, use &ldquo;Fund Wallet&rdquo; to add ETH for
              playing
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Wallet exists, show wallet info
  return (
    <Card className="p-6 space-y-4 bg-white border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500/20 rounded-lg">
            <Wallet className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black">Server Wallet</h3>
            <p className="text-sm text-gray-600">Ready to play</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshBalance}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Balance */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">Available Balance</div>
        <div className="text-3xl font-bold text-black">
          {balanceInUsd !== null ? `$${balanceInUsd.toFixed(2)}` : "$0.00"}
        </div>
        {balanceInEth && (
          <div className="text-sm text-gray-500">
            ≈ {parseFloat(balanceInEth).toFixed(4)} ETH
          </div>
        )}
      </div>

      {/* Pending Settlements */}
      {pendingCount > 0 && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
            <div className="text-sm font-semibold text-yellow-700">
              {pendingCount} Bet{pendingCount > 1 ? "s" : ""} Settling
            </div>
          </div>
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Pending Winnings:</span>
              <span className="font-medium text-yellow-700">
                {formatETH(BigInt(totalLocked))}
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Settlement in progress (~10-30s)</span>
            </div>
          </div>
        </div>
      )}

      {/* Address */}
      <div className="space-y-2">
        <div className="text-sm text-gray-600">Address</div>
        <div className="flex items-center gap-2">
          <code className="flex-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-800 overflow-hidden text-ellipsis border border-gray-200">
            {wallet.address}
          </code>
          <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
            <Copy className="w-4 h-4" />
            {copied && (
              <span className="ml-2 text-xs text-green-600">Copied!</span>
            )}
          </Button>
        </div>
      </div>

      {/* Funding Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <div className="text-sm font-semibold text-blue-600">
          How to Fund Your Wallet
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p>1. Copy your wallet address above</p>
          <p>2. Send Base Sepolia ETH from any wallet</p>
          <p>
            3. Need testnet ETH?{" "}
            <a
              href="https://www.alchemy.com/faucets/base-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 underline inline-flex items-center gap-1"
            >
              Get from faucet
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFunding(true)}
            className="flex-1"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Fund Wallet
          </Button>
          <Button
            onClick={refreshBalance}
            disabled={isLoading}
            className="flex-1"
            size="sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={() => setShowWithdraw(true)}
          className="w-full"
          size="sm"
        >
          Withdraw Funds
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Funding Modal */}
      <FundingModal
        isOpen={showFunding}
        onClose={() => setShowFunding(false)}
        walletAddress={wallet.address}
        currentBalance={balanceInEth || "0"}
        userId={userId}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        walletAddress={wallet.address}
        currentBalance={balanceInEth || "0"}
        onWithdraw={handleWithdraw}
      />
    </Card>
  );
}
