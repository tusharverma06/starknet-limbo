"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import {
  useAccount,
  useSendTransaction,
  useBalance,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CHAIN } from "@/lib/constants";
import { getEthValueFromUsd, getUsdValueFromEth } from "@/lib/utils/price";
import { ModalWrapper } from "./ModalWrapper";
import Image from "next/image";

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
  const [ethAmount, setEthAmount] = useState("");
  const [usdEquivalent, setUsdEquivalent] = useState<string>("0.00");
  const [isFunding, setIsFunding] = useState(false);
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState("");
  const [usdBalance, setUsdBalance] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { address: userAddress, isConnected, chainId } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const { data: userBalance } = useBalance({
    address: userAddress,
  });

  // Wait for transaction confirmation
  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
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

  // Update USD equivalent when ETH amount changes
  useEffect(() => {
    if (ethAmount && !isNaN(parseFloat(ethAmount))) {
      const ethVal = parseFloat(ethAmount);
      if (ethVal > 0) {
        getUsdValueFromEth(ethVal)
          .then((usdVal) => setUsdEquivalent(usdVal.toFixed(2)))
          .catch(() => setUsdEquivalent("0.00"));
      } else {
        setUsdEquivalent("0.00");
      }
    } else {
      setUsdEquivalent("0.00");
    }
  }, [ethAmount]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isTxConfirmed && txHash && userId) {
      // Log the deposit transaction
      const logDeposit = async () => {
        try {
          const response = await fetch("/api/wallet/log-deposit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              txHash,
              amount: ethAmount,
            }),
          });

          if (!response.ok) {
            console.error("Failed to log deposit");
          }
        } catch (err) {
          console.error("Error logging deposit:", err);
        }
      };

      logDeposit();

      // Call onSuccess callback to refresh balance
      if (onSuccess) {
        onSuccess();
      }

      // Stop loading state but don't close modal - let user close it manually
      setIsFunding(false);
    }
  }, [isTxConfirmed, txHash, userId, ethAmount, onSuccess]);

  if (!isOpen) return null;

  const handleSwitchToBaseSepolia = async () => {
    try {
      await switchChain({ chainId: CHAIN.id });
    } catch {
      setError(`Failed to switch to ${CHAIN.name} network`);
    }
  };

  const handleFund = async () => {
    // Comprehensive validation before allowing transaction
    if (!userAddress) {
      setError("Please connect your wallet");
      return;
    }

    if (!userId) {
      setError("User ID is required");
      return;
    }

    // Check if we're on the correct network
    if (chainId !== CHAIN.id) {
      setError(`Please switch to ${CHAIN.name} network to fund your wallet`);
      return;
    }

    // Validate ETH amount input
    if (!ethAmount || ethAmount.trim() === "") {
      setError("Please enter an amount");
      return;
    }

    const ethAmountNum = parseFloat(ethAmount);
    if (isNaN(ethAmountNum)) {
      setError("Please enter a valid number");
      return;
    }

    if (ethAmountNum <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    // Get USD value for validation
    let usdAmount: number;
    try {
      usdAmount = await getUsdValueFromEth(ethAmountNum);
    } catch (err) {
      setError("Failed to get USD price");
      return;
    }

    // Check minimum amount (at least $0.01 worth)
    if (usdAmount < 0.01) {
      setError("Minimum funding amount is $0.01");
      return;
    }

    // Check user balance
    if (usdBalance && usdAmount > usdBalance) {
      setError("Insufficient balance in your connected wallet");
      return;
    }

    // Check if amount is too large (sanity check)
    if (usdAmount > 10000) {
      setError("Amount exceeds maximum limit of $10,000");
      return;
    }

    setError("");
    setIsFunding(true);

    try {
      // Send transaction directly to server wallet with ETH amount
      const hash = await sendTransactionAsync({
        to: walletAddress as `0x${string}`,
        value: parseEther(ethAmount),
      });

      // Set the transaction hash to trigger waiting for confirmation
      setTxHash(hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Funding failed");
      setIsFunding(false);
    }
  };

  const handleClose = () => {
    // Reset all state when closing
    setEthAmount("");
    setUsdEquivalent("0.00");
    setTxHash(undefined);
    setIsFunding(false);
    setError("");
    setInputError("");
    onClose();
  };

  // Check if user has insufficient balance
  const usdEquivalentNum = parseFloat(usdEquivalent);
  const hasInsufficientBalance = Boolean(
    usdBalance &&
      !isNaN(usdEquivalentNum) &&
      usdEquivalentNum > 0 &&
      usdEquivalentNum > usdBalance
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      preventClose={isFunding && !isTxConfirmed}
    >
      <div className="border-2 border-black rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#2574ff] border-b-2 border-black px-4 py-4 flex items-center justify-between">
          <h2
            className="text-base text-white uppercase leading-normal"
            style={{
              fontFamily: "var(--font-lilita-one)",
              textShadow: "0px 1.6px 0px #000000",
            }}
          >
            {isTxConfirmed ? "Funding Successful!" : "Fund Wallet"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isFunding && !isTxConfirmed}
            className="flex items-center justify-center disabled:opacity-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="bg-white p-4 flex flex-col gap-4">
          {/* Wallet Address */}
          <div className="bg-[rgba(0,0,0,0.06)] rounded-lg px-[6px] py-[8px] h-[40px] flex items-center justify-between">
            <p
              className="text-[16px] text-[rgba(0,0,0,0.32)] leading-[0.9]"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Wallet:
            </p>
            <p
              className="text-[16px] text-black leading-[0.9]"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              {currentBalance
                ? `${parseFloat(currentBalance).toFixed(4)} ETH`
                : "0.0000 ETH"}
            </p>
          </div>

          {/* Network Status */}
          {isConnected && chainId !== CHAIN.id && (
            <div className="p-3 bg-red-100 border-2 border-black rounded-lg">
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

          {/* Fund Amount */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p
                className="text-[16px] text-black leading-[1.2]"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                Fund Amount
              </p>
              <p
                className="text-[16px] text-[rgba(0,0,0,0.32)] leading-[1.2]"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                {usdBalance ? `$${usdBalance.toFixed(2)}` : "$0.00"} Balance
              </p>
            </div>
            <div
              className={`border-2 ${
                hasInsufficientBalance ? "border-red-500" : "border-black"
              } rounded-xl h-[44px] px-3 py-[10px] flex items-center justify-between transition-colors`}
            >
              <div className="flex items-center gap-2 flex-1">
                <Image src="/eth-black.svg" alt="ETH" width={20} height={20} />
                <input
                  type="number"
                  placeholder="0.0234"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  disabled={isFunding}
                  className="text-[16px] text-black leading-[0.9] bg-transparent focus:outline-none w-full disabled:opacity-50"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                  step="any"
                />
              </div>
              <div className="flex items-center gap-2">
                <p
                  className={`text-[16px] leading-[0.9] ${
                    hasInsufficientBalance
                      ? "text-red-500"
                      : "text-[rgba(0,0,0,0.32)]"
                  }`}
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  ~${usdEquivalent}
                </p>
              </div>
            </div>

            {/* Insufficient Balance Warning */}
            {hasInsufficientBalance && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs">
                  Insufficient balance in your connected wallet
                </span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-100 border-2 border-black rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-black" />
                <span className="text-xs text-black">{error}</span>
              </div>
            </div>
          )}

          {/* Transaction Status Message */}
          {txHash && !isTxConfirmed && (
            <div className="p-3 bg-blue-50 border-2 border-black rounded-lg">
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
                  Your transaction is being processed on the blockchain. This
                  may take a few moments.
                </p>
              </div>
            </div>
          )}

          {/* Success Message with Explorer Link */}
          {txHash && isTxConfirmed && (
            <div className="p-3 bg-green-50 border-2 border-green-500 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span
                    className="text-sm text-green-900 font-semibold"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Transaction Confirmed!
                  </span>
                </div>
                <p className="text-xs text-green-700">
                  Your funds have been successfully deposited to your wallet.
                </p>
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-[36px] bg-green-600 hover:bg-green-700 text-white border-2 border-black rounded-lg transition-colors"
                >
                  <span
                    className="text-sm"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    View on Explorer
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Fund Button - Hide when transaction is confirmed */}
          {!isTxConfirmed && (
            <button
              onClick={handleFund}
              disabled={
                isFunding ||
                !isConnected ||
                chainId !== CHAIN.id ||
                !ethAmount ||
                parseFloat(ethAmount) <= 0 ||
                isNaN(parseFloat(ethAmount)) ||
                hasInsufficientBalance
              }
              className="relative w-full h-[43px] bg-gradient-to-b from-[#1499ff] to-[#094eed] border-2 border-black rounded-lg shadow-[0px_3px_0px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed active:shadow-none active:translate-y-[2px] transition-all"
            >
              <p
                className="text-base text-white uppercase leading-normal"
                style={{
                  textShadow: "0px 1.6px 0px #000000",
                  fontFamily: "var(--font-lilita-one)",
                }}
              >
                {isFunding ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {txHash ? "Confirming..." : "Funding..."}
                  </span>
                ) : (
                  "Fund Wallet"
                )}
              </p>
            </button>
          )}

          {/* Close Button - Show when transaction is confirmed */}
          {isTxConfirmed && (
            <button
              onClick={handleClose}
              className="relative w-full h-[43px] bg-gradient-to-b from-[#1499ff] to-[#094eed] border-2 border-black rounded-lg shadow-[0px_3px_0px_0px_#000000] active:shadow-none active:translate-y-[2px] transition-all"
            >
              <p
                className="text-base text-white uppercase leading-normal"
                style={{
                  textShadow: "0px 1.6px 0px #000000",
                  fontFamily: "var(--font-lilita-one)",
                }}
              >
                Close
              </p>
            </button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
