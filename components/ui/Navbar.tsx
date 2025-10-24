"use client";

import { useState, useRef } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { Shield } from "lucide-react";
import { FundingModal } from "./FundingModal";
import { WithdrawModal } from "./WithdrawModal";

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
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(popoverRef as React.RefObject<HTMLElement>, () => {});

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
