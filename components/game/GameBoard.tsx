'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance, useSwitchChain, useChainId } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MultiplierSelector } from './MultiplierSelector';
import { BetControls } from './BetControls';
import { GameResult } from './GameResult';
import { RecentBets } from './RecentBets';
import { HouseStats } from './HouseStats';
import { useGameContract } from '@/hooks/useGameContract';
import { useBetResultPoller } from '@/hooks/useBetResultPoller';
import { useGameState } from '@/hooks/useGameState';
import { useFarcaster } from '@/hooks/useFarcaster';
import { calculatePayout } from '@/lib/utils/multiplier';
import { formatETH } from '@/lib/utils/format';
import { Dice6, Loader2, AlertTriangle } from 'lucide-react';
import { CHAIN } from '@/lib/contract/config';
import Link from 'next/link';

export function GameBoard() {
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  
  const isCorrectChain = chainId === CHAIN.id;
  
  const {
    placeBet,
    isPlacingBet,
    isConfirming,
    isConfirmed,
    lastTxHash,
    placeBetError,
    houseBalance,
    reset: resetContract,
  } = useGameContract();

  const { latestBet, resolvedBets, isPolling, startPolling, stopPolling, clearLatestBet, clearAll } = useBetResultPoller(address);

  const {
    betAmount,
    targetMultiplier,
    setBetAmount,
    setTargetMultiplier,
    lastWin,
    lastPayout,
    setLastResult,
    reset: resetGameState,
  } = useGameState();

  const [showResult, setShowResult] = useState(false);

  // Handle bet confirmation - START POLLING!
  useEffect(() => {
    if (isConfirmed) {
      console.log('✅ Bet confirmed, starting polling for result...');
      startPolling();
    }
  }, [isConfirmed, startPolling]);
  
  // Log transaction states for debugging
  useEffect(() => {
    console.log('📊 Transaction states:', {
      isPlacingBet,
      isConfirming,
      isConfirmed,
      isPolling,
      lastTxHash,
    });
  }, [isPlacingBet, isConfirming, isConfirmed, isPolling, lastTxHash]);

  // Handle bet resolution - SHOW RESULT INSTANTLY!
  useEffect(() => {
    if (latestBet) {
      console.log('🎉 RESULT FOUND!', latestBet);
      console.log(latestBet.win ? '✅ YOU WIN!' : '❌ YOU LOSE');

      // STOP POLLING - we got the result!
      stopPolling();

      // Use the actual payout from the contract event
      setLastResult(latestBet.win, latestBet.payout);
      setShowResult(true);

      // Haptic feedback
      // hapticNotification(latestBet.win ? 'success' : 'error');
    }
  }, [latestBet, setLastResult, stopPolling]);

  const handlePlaceBet = async () => {
    if (!address) {
      console.warn('⚠️ No wallet connected');
      return;
    }

    console.log('🎲 Starting bet placement...');

    // Check if on correct chain, switch if needed
    if (!isCorrectChain) {
      console.log('🔄 Wrong chain, switching to Base Sepolia...');
      try {
        await switchChain?.({ chainId: CHAIN.id });
        // Wait a bit for chain switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Chain switched successfully');
      } catch (error) {
        console.error('❌ Chain switch error:', error);
        // hapticNotification('error');
        return;
      }
    }

    try {
      console.log('📝 Calling placeBet with:', { betAmount, targetMultiplier });
      // hapticImpact('light');
      await placeBet(betAmount, targetMultiplier);
      console.log('✅ Bet transaction initiated! Watch for transaction hash in next log...');
    } catch (error) {
      console.error('❌ Place bet error:', error);
      // hapticNotification('error');
    }
  };

  const handleResultClose = () => {
    setShowResult(false);
    clearLatestBet(); // Clear the latest bet result
    resetGameState();
    resetContract();
  };

  const handleManualReset = () => {
    console.log('🔄 Manual reset triggered');
    stopPolling();
    clearLatestBet();
    resetGameState();
    resetContract();
  };

  const handleShare = async () => {
    if (lastWin !== null) {
      const emoji = lastWin ? '🎉' : '😢';
      const text = lastWin 
        ? `${emoji} Just won ${formatETH(lastPayout!)} ETH playing Limbo! Target: ${targetMultiplier.toFixed(2)}x`
        : `${emoji} Tried ${targetMultiplier.toFixed(2)}x on Limbo! Better luck next time!`;
      
      // await shareCast(text, [`${process.env.NEXT_PUBLIC_APP_URL}/game`]);
    }
  };

  const potentialPayout = calculatePayout(
    BigInt(Math.floor(parseFloat(betAmount) * 1e18)),
    targetMultiplier * 100
  );

  const isDisabled = isPlacingBet || isConfirming || isPolling;

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Dice6 className="w-10 h-10 text-white" />
            LIMBO GAME
          </h1>
          <p className="text-gray-400">Provably Fair • Powered by Chainlink VRF</p>
          <div className="mt-4">
            <Link href="/admin" className="text-sm text-gray-300 hover:text-white transition-colors border-b border-gray-600 hover:border-white">
              Admin Panel →
            </Link>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card glow>
              <div className="space-y-6">
                <MultiplierSelector
                  value={targetMultiplier}
                  onChange={setTargetMultiplier}
                  disabled={isDisabled}
                />

                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

                <BetControls
                  value={betAmount}
                  onChange={setBetAmount}
                  disabled={isDisabled}
                  balance={balanceData?.value}
                />

                {/* Potential Payout */}
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Potential Payout:</span>
                    <span className="text-xl font-bold text-white">
                      {formatETH(potentialPayout)} ETH
                    </span>
                  </div>
                </div>

                {/* Wrong Network Warning */}
                {address && !isCorrectChain && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gray-900 border border-gray-600 flex items-center gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
                    <div className="text-sm text-gray-300">
                      <strong className="font-semibold">Wrong Network</strong>
                      <p className="text-gray-400 mt-1">
                        Please switch to Base Sepolia to place bets
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Place Bet Button */}
                <Button
                  size="lg"
                  onClick={handlePlaceBet}
                  disabled={isDisabled || !address || isSwitchingChain}
                  isLoading={isPlacingBet || isConfirming || isSwitchingChain}
                  className="w-full"
                >
                  {!address ? (
                    'Connect Wallet'
                  ) : !isCorrectChain ? (
                    isSwitchingChain ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Switching Network...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Switch to Base Sepolia
                      </>
                    )
                  ) : isPolling ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Getting Result...
                    </>
                  ) : isConfirming ? (
                    'Confirming...'
                  ) : isPlacingBet ? (
                    'Placing Bet...'
                  ) : (
                    '🎲 Place Bet'
                  )}
                </Button>

                {placeBetError && (
                  <div className="text-sm text-white text-center p-3 bg-gray-900 border border-gray-700 rounded-lg">
                    {placeBetError.message}
                  </div>
                )}

                {/* Polling Info */}
                {isPolling && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="text-center text-sm text-gray-400 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Getting your result...</span>
                      </div>
                      <p className="text-xs mt-1">Result appears in ~2 seconds</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleManualReset}
                      className="w-full border border-gray-700 text-gray-400 hover:text-white hover:border-white"
                    >
                      Cancel & Reset
                    </Button>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <HouseStats houseBalance={houseBalance} totalBets={resolvedBets.length} />
            <RecentBets bets={resolvedBets.slice(0, 10)} />
          </motion.div>
        </div>

        {/* Game Result Modal */}
        <AnimatePresence>
          {showResult && lastWin !== null && latestBet && (
            <GameResult
              win={latestBet.win}
              amount={latestBet.amount}
              targetMultiplier={latestBet.targetMultiplier}
              randomResult={latestBet.limboMultiplier}
              payout={latestBet.payout}
              onClose={handleResultClose}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


