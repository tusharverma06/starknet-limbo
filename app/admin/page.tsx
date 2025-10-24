"use client";

import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { parseEther, formatEther } from "viem";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useGameContract } from "@/hooks/useGameContract";
import { Wallet, TrendingUp, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CHAIN } from "@/lib/constants";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const {
    fundHouse,
    houseBalance,
    owner,
    refetchHouseBalance,
    isPlacingBet: isFunding,
    placeBetError: fundError,
  } = useGameContract();

  const [fundAmount, setFundAmount] = useState("0.1");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  const handleFundHouse = async () => {
    if (!address || !isConnected) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    if (balanceData && parseEther(fundAmount) > balanceData.value) {
      setErrorMessage("Insufficient balance");
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");

      console.log("💰 Funding house with:", fundAmount, "ETH");
      await fundHouse(fundAmount);

      setSuccessMessage(`Successfully added ${fundAmount} ETH to house!`);
      setFundAmount("0.1");

      // Refresh house balance after a delay
      setTimeout(() => {
        refetchHouseBalance();
      }, 2000);
    } catch (error) {
      console.error("❌ Fund house error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to fund house"
      );
    }
  };

  const handleQuickAmount = (multiplier: number) => {
    const current = parseFloat(fundAmount) || 0.1;
    const newAmount = current * multiplier;
    setFundAmount(newAmount.toString());
  };

  const handleMaxAmount = () => {
    if (balanceData) {
      // Leave some for gas
      const maxAmount = Math.max(
        0,
        parseFloat(formatEther(balanceData.value)) - 0.001
      );
      setFundAmount(maxAmount.toFixed(4));
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">
            Wallet Not Connected
          </h2>
          <p className="text-slate-400">
            Please connect your wallet to access the admin panel.
          </p>
          <Link href="/game">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  //   if (!isOwner) {
  //     return (
  //       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
  //         <Card className="max-w-md w-full text-center space-y-4">
  //           <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
  //           <h2 className="text-2xl font-bold text-white">Access Denied</h2>
  //           <p className="text-slate-400">
  //             You are not the contract owner. Only the owner can fund the house.
  //           </p>
  //           <div className="text-xs text-slate-500 break-all">
  //             <p>Your address: {address}</p>
  //             <p>Owner address: {owner || 'Loading...'}</p>
  //           </div>
  //           <Link href="/game">
  //             <Button variant="ghost" className="w-full">
  //               <ArrowLeft className="w-4 h-4 mr-2" />
  //               Back to Game
  //             </Button>
  //           </Link>
  //         </Card>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-slate-400">
              Manage house balance and contract funds
            </p>
          </div>
          <Link href="/game">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game
            </Button>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* House Balance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card glow>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Wallet className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">House Balance</p>
                  <p className="text-3xl font-bold text-white">
                    {parseFloat(formatEther(houseBalance)).toFixed(4)} ETH
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Your Balance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Your Balance</p>
                  <p className="text-3xl font-bold text-white">
                    {balanceData
                      ? parseFloat(formatEther(balanceData.value)).toFixed(4)
                      : "0.0000"}{" "}
                    ETH
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Fund House Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glow>
            <h2 className="text-2xl font-bold text-white mb-6">Fund House</h2>

            <div className="space-y-6">
              {/* Amount Input */}
              <div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  label="Amount (ETH)"
                  placeholder="0.1"
                  className="text-xl font-semibold"
                  disabled={isFunding}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAmount(0.5)}
                  disabled={isFunding}
                  className="border border-slate-700"
                >
                  1/2
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAmount(2)}
                  disabled={isFunding}
                  className="border border-slate-700"
                >
                  2x
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAmount(5)}
                  disabled={isFunding}
                  className="border border-slate-700"
                >
                  5x
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxAmount}
                  disabled={isFunding}
                  className="border border-slate-700"
                >
                  MAX
                </Button>
              </div>

              {/* Estimated New Balance */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">New House Balance:</span>
                  <span className="text-xl font-bold text-blue-400">
                    {(
                      parseFloat(formatEther(houseBalance)) +
                      parseFloat(fundAmount || "0")
                    ).toFixed(4)}{" "}
                    ETH
                  </span>
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
                >
                  ✅ {successMessage}
                </motion.div>
              )}

              {/* Error Message */}
              {(errorMessage || fundError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                >
                  ❌ {errorMessage || fundError?.message}
                </motion.div>
              )}

              {/* Fund Button */}
              <Button
                size="lg"
                onClick={handleFundHouse}
                disabled={
                  isFunding || !fundAmount || parseFloat(fundAmount) <= 0
                }
                isLoading={isFunding}
                className="w-full"
              >
                {isFunding ? "Funding House..." : "💰 Fund House"}
              </Button>

              {/* Info */}
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  ℹ️ Funding the house increases the maximum payout available
                  for players.
                </p>
                <p>🔒 Only the contract owner can fund the house.</p>
                <p>⚠️ Make sure to keep enough ETH for gas fees.</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contract Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">
              Contract Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Contract Address:</span>
                <span className="text-white font-mono text-xs">
                  {process.env.NEXT_PUBLIC_LIMBO_CONTRACT_ADDRESS}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Owner Address:</span>
                <span className="text-white font-mono text-xs">
                  {owner ? String(owner) : "Loading..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Your Address:</span>
                <span className="text-white font-mono text-xs">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="text-white">{CHAIN.name} ({CHAIN.id})</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
