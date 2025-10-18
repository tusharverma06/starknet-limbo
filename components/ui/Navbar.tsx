"use client";

import { useState, useRef, useEffect } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { Button } from "./Button";
import { Card } from "./Card";
import {
  Copy,
  ExternalLink,
  Wallet,
  ChevronDown,
  CheckCircle2,
  Plus,
  Minus,
} from "lucide-react";
import { CONTRACT_ADDRESS } from "@/lib/contract/config";
import { ActivityIcon } from "@/components/game/ActivityIcon";
import { FundingModal } from "./FundingModal";
import { WithdrawModal } from "./WithdrawModal";
import { getUsdValueFromEth } from "@/lib/utils/price";
import sdk from "@farcaster/miniapp-sdk";

interface NavbarProps {
  walletAddress?: string;
  onActivityClick?: () => void;
  walletBalance?: string;
  onWithdraw?: (amount: string, toAddress: string) => Promise<void>;
  userId?: string;
}

export function Navbar({
  walletAddress,
  onActivityClick,
  walletBalance = "0",
  onWithdraw,
  userId,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedItem, setCopiedItem] = useState<"wallet" | "contract" | null>(
    null
  );
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [usdBalance, setUsdBalance] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Convert ETH balance to USD
  useEffect(() => {
    if (walletBalance && parseFloat(walletBalance) > 0) {
      getUsdValueFromEth(parseFloat(walletBalance))
        .then((usdValue) => {
          if (isFinite(usdValue) && usdValue >= 0) {
            setUsdBalance(usdValue);
          } else {
            setUsdBalance(null);
          }
        })
        .catch(() => setUsdBalance(null));
    } else {
      setUsdBalance(null);
    }
  }, [walletBalance]);

  useOnClickOutside(popoverRef as React.RefObject<HTMLElement>, () =>
    setIsOpen(false)
  );

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopiedItem("wallet");
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  const handleCopyContractAddress = async () => {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopiedItem("contract");
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleFund = () => {
    setShowFundingModal(true);
    setIsOpen(false);
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 relative">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-black">Limbo</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Activity Icon */}

          {/* Wallet Balance */}
          {walletAddress && (
            <div className="relative" ref={popoverRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-gray-600 hover:text-black"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold">
                    {parseFloat(walletBalance).toFixed(4)} ETH
                  </span>
                  {usdBalance !== null && (
                    <span className="text-xs text-gray-400">
                      ≈ ${usdBalance.toFixed(2)}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
          )}

          <ActivityIcon
            userAddress={walletAddress ?? null}
            onClick={onActivityClick}
          />
        </div>
      </div>

      {/* Modals */}
      {walletAddress && (
        <>
          <FundingModal
            isOpen={showFundingModal}
            onClose={() => setShowFundingModal(false)}
            walletAddress={walletAddress}
            currentBalance={walletBalance}
            userId={userId}
          />
          <WithdrawModal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            walletAddress={walletAddress}
            currentBalance={walletBalance}
            onWithdraw={onWithdraw || (async () => {})}
          />
        </>
      )}

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full  w-full max-w-sm z-10"
        >
          <Card className="bg-white border border-gray-200 shadow-lg">
            <div className="space-y-4">
              {/* Wallet Address */}
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  Your Wallet Address
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
                    {copiedItem === "wallet" ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Balance */}
              <div>
                <div className="text-sm text-gray-600 mb-2">Balance</div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-black">
                    {parseFloat(walletBalance).toFixed(4)} ETH
                  </div>
                  {usdBalance !== null && (
                    <div className="text-sm text-gray-500">
                      ≈ ${usdBalance.toFixed(2)} USD
                    </div>
                  )}
                </div>
              </div>

              {/* Contract Address */}
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  Factory Address
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-gray-50 rounded text-xs text-gray-800 overflow-hidden text-ellipsis border border-gray-200">
                    {CONTRACT_ADDRESS}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyContractAddress}
                    className="px-2"
                  >
                    {copiedItem === "contract" ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Wallet Actions */}
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-2">Wallet Actions</div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleFund}
                    className="flex-1 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Fund
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleWithdraw}
                    className="flex-1 text-xs"
                  >
                    <Minus className="w-3 h-3 mr-1" />
                    Withdraw
                  </Button>
                </div>
              </div>

              {/* Contract Links */}
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-2">
                  View Contract on Explorer
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await sdk.actions.openUrl(
                        `https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`
                      );
                    }}
                    className="flex-1 text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    BaseScan
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </nav>
  );
}
