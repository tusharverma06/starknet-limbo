"use client";

import { useStarknet } from "@/components/providers/StarknetProvider";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Amount, Token } from "starkzap";
import { CallData, uint256 } from "starknet";

export function useStarknetWallet() {
  const { sdk, wallet, isConnected, address, starknetWallet } = useStarknet();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Transfer ERC20 tokens on Starknet using raw wallet account
   * Note: Requires a connected wallet
   */
  const transferToken = useCallback(
    async (token: Token, recipient: string, amount: Amount) => {
      if (!starknetWallet?.account) {
        toast.error("Wallet not connected");
        return null;
      }

      try {
        setIsLoading(true);

        // Convert amount to uint256 format
        const amountBN = amount.toBase();
        const amountU256 = uint256.bnToUint256(amountBN);

        // Execute transfer via wallet account
        const tx = await starknetWallet.account.execute({
          contractAddress: token.address.toString(),
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient,
            amount: amountU256,
          }),
        });

        toast.success("Transfer initiated", {
          description: `Transaction: ${tx.transaction_hash}`,
        });

        return { hash: tx.transaction_hash };
      } catch (error) {
        console.error("Transfer error:", error);
        toast.error(error instanceof Error ? error.message : "Transfer failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [starknetWallet]
  );

  /**
   * Get token balance using Starknet RPC
   * Note: Requires a connected wallet
   */
  const getBalance = useCallback(
    async (token: Token) => {
      if (!starknetWallet?.account || !address) {
        return null;
      }

      try {
        // Call balanceOf on the token contract
        const result = await starknetWallet.account.callContract({
          contractAddress: token.address.toString(),
          entrypoint: "balanceOf",
          calldata: CallData.compile({ account: address }),
        });

        // Parse result as uint256
        const balanceBN = uint256.uint256ToBN({
          low: result[0],
          high: result[1],
        });

        // Convert balance BigNumber to ETH string
        const balanceInEth = (Number(balanceBN) / 1e18).toFixed(18);

        // Parse back to Amount to maintain API compatibility
        return Amount.parse(balanceInEth, token);
      } catch (error) {
        console.error("Balance fetch error:", error);
        return null;
      }
    },
    [starknetWallet, address]
  );

  return {
    sdk,
    wallet: starknetWallet,
    isConnected,
    address,
    isLoading,
    transferToken,
    getBalance,
  };
}
