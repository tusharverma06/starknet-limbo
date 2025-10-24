"use client";

import { useState, useRef } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { Shield, Wallet, RefreshCw } from "lucide-react";
import { FundingModal } from "./FundingModal";
import { WithdrawModal } from "./WithdrawModal";
import { useBalance } from "@/hooks/useBalance";

interface NavbarProps {
  onActivityClick?: () => void;
  onVerifyClick?: () => void;
  onWithdraw?: (amount: string, toAddress: string) => Promise<void>;
  userId?: string | null;
}

export function Navbar({
  onActivityClick,
  onVerifyClick,
  onWithdraw,
  userId,
}: NavbarProps) {
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    balanceInUsd,
    balanceInEth,
    address,
    isLoading,
    isRefetching,
    refetch,
  } = useBalance(userId || null);

  useOnClickOutside(popoverRef as React.RefObject<HTMLElement>, () => {});
  useOnClickOutside(dropdownRef as React.RefObject<HTMLElement>, () =>
    setShowWalletDropdown(false)
  );

  const handleRefreshBalance = async () => {
    await refetch();
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
          {/* Wallet Balance Dropdown */}
          {userId && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                className="px-3 h-[30px] border-2 border-black rounded-md flex items-center gap-2 hover:bg-gray-100 transition-colors"
                title="USDC Balance"
              >
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isLoading ? "..." : <>${balanceInUsd.toFixed(2)}</>}
                </span>
              </button>

              {showWalletDropdown && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[280px] bg-white border-2 border-black rounded-lg shadow-lg p-4 z-50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Balance</span>
                      <button
                        onClick={handleRefreshBalance}
                        disabled={isRefetching}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Refresh balance"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${
                            isRefetching ? "animate-spin" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <div className="text-2xl font-bold">
                      ${balanceInUsd.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {balanceInEth.toFixed(6)} ETH
                    </div>
                    <div className="text-xs text-gray-400 font-mono break-all">
                      {address}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setShowFundingModal(true);
                          setShowWalletDropdown(false);
                        }}
                        className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        Add Funds
                      </button>
                      <button
                        onClick={() => {
                          setShowWithdrawModal(true);
                          setShowWalletDropdown(false);
                        }}
                        className="flex-1 px-4 py-2 border-2 border-black rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
      {address && (
        <>
          <FundingModal
            isOpen={showFundingModal}
            onClose={() => setShowFundingModal(false)}
            walletAddress={address}
            currentBalance={balanceInEth.toString()}
            userId={userId}
            onSuccess={handleRefreshBalance}
          />
          <WithdrawModal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            walletAddress={address}
            currentBalance={balanceInEth.toString()}
            onWithdraw={onWithdraw || (async () => {})}
          />
        </>
      )}
    </nav>
  );
}
