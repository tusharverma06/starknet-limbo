"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { getEthValueFromUsd, getUsdValueFromEth } from "@/lib/utils/price";
import { useWaitForTransactionReceipt } from "wagmi";
import { ModalWrapper } from "./ModalWrapper";
import Image from "next/image";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  currentBalance: string;
  onWithdraw: (
    amount: string,
    toAddress: string
  ) => Promise<{ txHash: string }>;
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

      // Stop loading state but don't close modal - let user close it manually
      setIsWithdrawing(false);
    }
  }, [isTxConfirmed, txHash, onSuccess]);

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

  const handleClose = () => {
    // Reset all state when closing
    setAmount("");
    setToAddress("");
    setEthAmount(null);
    setTxHash(undefined);
    setIsWithdrawing(false);
    setError("");
    onClose();
  };

  // Check if user has insufficient balance
  const numAmount = parseFloat(amount);
  const hasInsufficientBalance =
    usdBalance && !isNaN(numAmount) && numAmount > 0 && numAmount > usdBalance
      ? true
      : false;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      preventClose={isWithdrawing && !isTxConfirmed}
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
            {isTxConfirmed ? "Withdrawal Successful!" : "Withdraw Funds"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isWithdrawing && !isTxConfirmed}
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

          {/* Withdraw Amount */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p
                className="text-[16px] text-black leading-[1.2]"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                Withdraw Amount
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
                  value={ethAmount !== null ? ethAmount.toFixed(6) : ""}
                  onChange={(e) => {
                    const ethVal = parseFloat(e.target.value);
                    if (!isNaN(ethVal) && ethVal > 0) {
                      setEthAmount(ethVal);
                      getUsdValueFromEth(ethVal).then((usdVal) => {
                        setAmount(usdVal.toFixed(2));
                      });
                    } else if (e.target.value === "") {
                      setEthAmount(null);
                      setAmount("");
                    }
                  }}
                  disabled={isWithdrawing}
                  className="text-[16px] text-black leading-[0.9] bg-transparent focus:outline-none w-full disabled:opacity-50"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
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
                  ~${amount || "0.00"}
                </p>
                <button
                  onClick={handleMaxAmount}
                  disabled={isWithdrawing}
                  className="border-2 border-black rounded-lg h-[24px] px-[6px] py-[8px] flex items-center justify-center disabled:opacity-50"
                >
                  <p
                    className="text-[12px] text-black leading-[0.9]"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    MAX
                  </p>
                </button>
              </div>
            </div>

            {/* Insufficient Balance Warning */}
            {hasInsufficientBalance && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs">
                  Insufficient balance in your wallet
                </span>
              </div>
            )}
          </div>

          {/* Recipient Address */}
          <div className="flex flex-col gap-2">
            <p
              className="text-[16px] text-black leading-[1.2]"
              style={{ fontFamily: "var(--font-lilita-one)" }}
            >
              Recipient Address
            </p>
            <div className="border-2 border-black rounded-xl h-[44px] px-3 py-[10px] flex items-center">
              <input
                type="text"
                placeholder="0x..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                disabled={isWithdrawing}
                className="text-[14px] text-black leading-[0.9] bg-transparent focus:outline-none w-full disabled:opacity-50"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              />
            </div>
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
                  Your withdrawal is being processed on the blockchain. This may
                  take a few moments.
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
                  Your withdrawal has been successfully processed.
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

          {/* Withdraw Button - Hide when transaction is confirmed */}
          {!isTxConfirmed && (
            <button
              onClick={handleWithdraw}
              disabled={
                isWithdrawing || !amount || !toAddress || hasInsufficientBalance
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
                {isWithdrawing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {txHash ? "Confirming..." : "Withdrawing..."}
                  </span>
                ) : (
                  "Withdraw Funds"
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
