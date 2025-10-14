"use client";

import { useEffect, useState } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { useFarcaster } from "@/hooks/useFarcaster";
import { useAccount, useConnect, useWatchContractEvent } from "wagmi";
import { Button } from "@/components/ui/Button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";
import { ResolvedBet } from "@/lib/contract/types";
import { CHAIN, CONTRACT_ADDRESS } from "@/lib/contract/config";
import { LIMBO_GAME_ABI } from "@/lib/contract/abi";

export default function GamePage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { isInMiniApp } = useFarcaster();
  const { openConnectModal } = useConnectModal();

  const [resolvedBets, setResolvedBets] = useState<ResolvedBet[]>([]);
  const [latestBet, setLatestBet] = useState<ResolvedBet | null>(null);

   // Watch BetResolved events - filtered by player address at the RPC level
   useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIMBO_GAME_ABI,
    eventName: 'BetResolved',
    chainId: CHAIN.id,
    // Use args to filter by indexed parameters (topic[2] = player address)
    // args: address ? { player: address } : undefined,
    onLogs(logs) {
      console.log('📡 BetResolved event received (filtered by player):', logs.length, 'logs');

      logs.forEach((log) => {
        console.log(log);
        
        // const { requestId, player, betAmount, targetMultiplier, limboMultiplier, win, payout, timestamp } =
        //   log.topics;

        // const reqId = requestId as bigint;
        // const reqIdStr = reqId.toString();

        // console.log('🎰 BetResolved:', {
        //   requestId: reqIdStr,
        //   player,
        //   betAmount: betAmount?.toString(),
        //   targetMultiplier: targetMultiplier?.toString(),
        //   limboMultiplier: limboMultiplier?.toString(),
        //   win,
        //   payout: payout?.toString(),
        //   txHash: log.transactionHash,
        // });

        // // // Prevent duplicate processing
        // // if (processedRequestIds.current.has(reqIdStr)) {
        // //   console.log('⚠️ Already processed this bet, skipping');
        // //   return;
        // // }
        // // processedRequestIds.current.add(reqIdStr);

        // const resolved: ResolvedBet = {
        //   requestId: reqId,
        //   player: player as string,
        //   amount: betAmount as bigint,
        //   targetMultiplier: Number(targetMultiplier),
        //   limboMultiplier: limboMultiplier as bigint,
        //   win: win as boolean,
        //   payout: payout as bigint,
        //   timestamp: Number(timestamp) * 1000, // Convert to milliseconds
        //   txHash: log.transactionHash as `0x${string}`,
        // };

        // console.log('✅ Bet resolved! Result:', {
        //   win: resolved.win ? '🎉 WIN' : '😢 LOSE',
        //   limboMultiplier: Number(resolved.limboMultiplier) / 100,
        //   targetMultiplier: resolved.targetMultiplier / 100,
        //   payout: resolved.payout.toString(),
        // });

        // // Update latest bet (for immediate UI response)
        // setLatestBet(resolved);

        // // Add to history
        // setResolvedBets((prev) => {
        //   const exists = prev.some((b) => b.requestId === resolved.requestId);
        //   if (exists) {
        //     console.log('⚠️ Bet already in history, skipping');
        //     return prev;
        //   }
        //   return [resolved, ...prev].slice(0, 50);
        // });
      });
    },
  });

  const handleConnect = () => {
    if (isInMiniApp) {
      connect({ connector: farcasterFrame() });
    }
    if (openConnectModal) openConnectModal();
  };
  useEffect(() => {
    if (isInMiniApp && !address && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [isInMiniApp, address, connect, connectors]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">Connect Your Wallet</h2>
          <p className="text-slate-400">
            You need to connect your wallet to play
          </p>
          <Button size="lg" onClick={handleConnect}>
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return <GameBoard />;
}
