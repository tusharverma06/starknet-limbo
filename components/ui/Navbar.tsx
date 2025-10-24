"use client";

import { useState, useRef, useEffect } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { Button } from "./Button";
import { Card } from "./Card";
import {
  Copy,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Plus,
  Minus,
  Shield,
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
  onVerifyClick?: () => void;
  walletBalance?: string;
  onWithdraw?: (amount: string, toAddress: string) => Promise<void>;
  userId?: string | null;
}

export function Navbar({
  walletAddress,
  onActivityClick,
  onVerifyClick,
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
    <nav className="bg-white border-b-2 border-black px-4 py-3 relative">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#546473] text-center">
            by senyil.eth
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Verify Fairness Button */}
          {onVerifyClick && (
            <button
              onClick={onVerifyClick}
              className="w-[30px] h-[30px] border-2 border-black rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
              title="Verify Fairness"
            >
              <Shield className="w-4 h-4 text-black" />
            </button>
          )}

          <button
            onClick={onActivityClick}
            className="w-[30px] h-[30px] border-2 border-black rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Activity"
          >
            ⋯
          </button>
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
    </nav>
  );
}
