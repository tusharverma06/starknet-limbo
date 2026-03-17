"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { getUsdValueFromEth } from "@/lib/utils/price";
import { ModalWrapper } from "./ModalWrapper";
import Image from "next/image";
import { useStarknet } from "@/components/providers/StarknetProvider";
import { useStarknetWallet } from "@/hooks/useStarknetWallet";
import { Amount, mainnetTokens } from "starkzap";

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
  const [txSuccess, setTxSuccess] = useState(false);

  const {
    isConnected: isStarknetConnected,
    connect: connectStarknet,
    hasWallet,
    address: starknetAddress,
  } = useStarknet();
  const {
    wallet: starknetWallet,
    transferToken,
    isLoading: isStarknetLoading,
    getBalance,
  } = useStarknetWallet();
  const [starknetBalance, setStarknetBalance] = useState<string | null>(null);
  const [starknetBalanceUsd, setStarknetBalanceUsd] = useState<number | null>(
    null,
  );

  // Fetch Starknet balance when wallet is connected or modal opens
  useEffect(() => {
    const fetchStarknetBalance = async () => {
      if (starknetWallet && isStarknetConnected && isOpen) {
        const balance = await getBalance(mainnetTokens.ETH);
        if (balance) {
          // Convert Amount to string (in ETH)
          const ethValue = balance.toBase().toString();
          const ethFormatted = (Number(ethValue) / 1e18).toFixed(4);
          setStarknetBalance(ethFormatted);

          // Get USD value
          try {
            const usdVal = await getUsdValueFromEth(parseFloat(ethFormatted));
            setStarknetBalanceUsd(usdVal);
          } catch {
            setStarknetBalanceUsd(null);
          }
        } else {
          setStarknetBalance(null);
          setStarknetBalanceUsd(null);
        }
      } else if (!isStarknetConnected || !isOpen) {
        setStarknetBalance(null);
        setStarknetBalanceUsd(null);
      }
    };

    fetchStarknetBalance();
  }, [starknetWallet, isStarknetConnected, getBalance, isOpen]);

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

  if (!isOpen) return null;

  const handleFund = async () => {
    if (!starknetWallet) {
      setError("Wallet not connected");
      return;
    }

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
    } catch {
      setError("Failed to get USD price");
      return;
    }

    // Check minimum amount
    if (usdAmount < 0.01) {
      setError("Minimum funding amount is $0.01");
      return;
    }

    // Check balance
    if (starknetBalance && ethAmountNum > parseFloat(starknetBalance)) {
      setError("Insufficient balance in your Starknet wallet");
      return;
    }

    // Check USD balance
    if (starknetBalanceUsd && usdAmount > starknetBalanceUsd) {
      setError("Insufficient balance");
      return;
    }

    setError("");
    setIsFunding(true);

    try {
      const tx = await transferToken(
        mainnetTokens.ETH,
        walletAddress,
        Amount.parse(ethAmount, mainnetTokens.ETH),
      );

      if (tx) {
        setTxSuccess(true);

        // Log the deposit transaction
        if (starknetAddress) {
          try {
            await fetch("/api/wallet/log-deposit", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                wallet_address: starknetAddress,
                txHash: tx.hash,
                amount: ethAmount,
              }),
            });
          } catch (err) {
            console.error("Error logging deposit:", err);
          }
        }

        // Call onSuccess callback to refresh balance
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
      setTxSuccess(false);
    } finally {
      setIsFunding(false);
    }
  };

  const handleClose = () => {
    // Reset all state when closing
    setEthAmount("");
    setUsdEquivalent("0.00");
    setIsFunding(false);
    setError("");
    setTxSuccess(false);
    onClose();
  };

  // Check if user has insufficient balance
  const usdEquivalentNum = parseFloat(usdEquivalent);
  const hasInsufficientBalance = Boolean(
    starknetBalanceUsd &&
    !isNaN(usdEquivalentNum) &&
    usdEquivalentNum > 0 &&
    usdEquivalentNum > starknetBalanceUsd,
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      preventClose={isFunding}
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
            {txSuccess ? "Funding Successful!" : "Fund Wallet"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isFunding}
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
          {/* No Wallet Detected - Show Download Button */}
          {!hasWallet ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <p
                className="text-lg text-black"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                Install Braavos Wallet
              </p>
              <a
                href="https://braavos.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full max-w-xs h-[43px] bg-gradient-to-b from-[#1499ff] to-[#094eed] border-2 border-black rounded-lg shadow-[0px_3px_0px_0px_#000000] active:shadow-none active:translate-y-[2px] transition-all flex items-center justify-center"
              >
                <p
                  className="text-base text-white uppercase leading-normal"
                  style={{
                    textShadow: "0px 1.6px 0px #000000",
                    fontFamily: "var(--font-lilita-one)",
                  }}
                >
                  Download Braavos
                </p>
              </a>
            </div>
          ) : !isStarknetConnected ? (
            /* Wallet Detected but Not Connected */
            <div className="flex flex-col gap-4 py-4">
              <button
                onClick={connectStarknet}
                className="relative w-full h-[43px] bg-gradient-to-b from-[#1499ff] to-[#094eed] border-2 border-black rounded-lg shadow-[0px_3px_0px_0px_#000000] active:shadow-none active:translate-y-[2px] transition-all"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                <p
                  className="text-base text-white uppercase leading-normal"
                  style={{
                    textShadow: "0px 1.6px 0px #000000",
                    fontFamily: "var(--font-lilita-one)",
                  }}
                >
                  Connect Starknet
                </p>
              </button>
            </div>
          ) : (
            /* Wallet Connected - Show Transfer Form */
            <>
              {/* Starknet Wallet Balance */}
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
                  {starknetBalance ? `${starknetBalance} ETH` : "0.0000 ETH"}
                </p>
              </div>

              {/* Custodial Wallet Address */}
              <div className="bg-[rgba(0,0,0,0.06)] rounded-lg px-[6px] py-[8px] h-[40px] flex items-center justify-between border-2 border-black">
                <p
                  className="text-[16px] text-[rgba(0,0,0,0.32)] leading-[0.9]"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  To:
                </p>
                <p
                  className="text-[14px] text-black leading-[0.9] font-mono"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>

              {/* Amount Input */}
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
                    {starknetBalanceUsd
                      ? `$${starknetBalanceUsd.toFixed(2)}`
                      : "$0.00"}{" "}
                    Balance
                  </p>
                </div>
                <div
                  className={`border-2 ${
                    hasInsufficientBalance ? "border-red-500" : "border-black"
                  } rounded-xl h-[44px] px-3 py-[10px] flex items-center justify-between transition-colors`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Image
                      src="/eth-black.svg"
                      alt="ETH"
                      width={20}
                      height={20}
                    />
                    <input
                      type="number"
                      placeholder="0.0234"
                      value={ethAmount}
                      onChange={(e) => setEthAmount(e.target.value)}
                      disabled={isStarknetLoading || isFunding}
                      className="text-[16px] text-black leading-[0.9] bg-transparent focus:outline-none w-full disabled:opacity-50"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                      step="any"
                    />
                  </div>
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

                {/* Insufficient Balance Warning */}
                {hasInsufficientBalance && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-xs">
                      Insufficient balance in your Starknet wallet
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

              {/* Success Message */}
              {txSuccess && (
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
                        Transaction Successful!
                      </span>
                    </div>
                    <p className="text-xs text-green-700">
                      Your funds have been successfully deposited to your
                      custodial wallet.
                    </p>
                  </div>
                </div>
              )}

              {/* Fund Button - Hide when transaction is successful */}
              {!txSuccess && (
                <button
                  onClick={handleFund}
                  disabled={
                    isStarknetLoading ||
                    isFunding ||
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
                        <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Fund Wallet"
                    )}
                  </p>
                </button>
              )}

              {/* Close Button - Show when transaction is successful */}
              {txSuccess && (
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
            </>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
