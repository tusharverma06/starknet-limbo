"use client";

import { useState, useCallback } from "react";
import { StarkZap, OnboardStrategy, type Wallet, mainnetTokens } from "starkzap";
import { toast } from "sonner";

/**
 * Hook for Cartridge Controller integration
 *
 * Cartridge provides:
 * - Social login (Google, Twitter, Face ID, Touch ID)
 * - Automatic gasless transactions (built-in paymaster)
 * - Session keys for seamless UX
 *
 * Perfect for gaming applications!
 */
export function useCartridgeWallet() {
  const [sdk, setSdk] = useState<StarkZap | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  /**
   * Connect with Cartridge Controller
   * Automatically enables gasless transactions for approved policies
   */
  const connect = useCallback(async (policies?: Array<{ target: string; method: string }>) => {
    try {
      setIsConnecting(true);

      const starkZapSdk = new StarkZap({
        network: "mainnet",
      });

      // Define default policies for the betting game
      const defaultPolicies = policies || [
        // Allow ETH transfers (for funding)
        {
          target: mainnetTokens.ETH.address,
          method: "transfer",
        },
        // Allow STRK transfers (for funding)
        {
          target: mainnetTokens.STRK.address,
          method: "transfer",
        },
        // Allow USDC transfers (for funding)
        {
          target: mainnetTokens.USDC.address,
          method: "transfer",
        },
        // Add your game contract here when deployed
        // {
        //   target: "0xYOUR_GAME_CONTRACT",
        //   method: "place_bet",
        // },
      ];

      const onboard = await starkZapSdk.onboard({
        strategy: OnboardStrategy.Cartridge,
        cartridge: {
          policies: defaultPolicies,
        },
        deploy: "if_needed",
      });

      const connectedWallet = onboard.wallet;
      const walletAddress = connectedWallet.address;

      setSdk(starkZapSdk);
      setWallet(connectedWallet as Wallet);
      setAddress(walletAddress);
      setIsConnected(true);

      toast.success("Connected with Cartridge", {
        description: "Gasless transactions enabled!",
      });

      return connectedWallet;
    } catch (error) {
      console.error("Cartridge connection error:", error);
      toast.error("Failed to connect with Cartridge");
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    setSdk(null);
    setWallet(null);
    setAddress(null);
    setIsConnected(false);
    toast.info("Disconnected from Cartridge");
  }, []);

  /**
   * Open Cartridge profile (settings, assets, etc.)
   * Note: This requires accessing Cartridge Controller directly
   */
  const openProfile = useCallback(() => {
    if (wallet) {
      // Access controller through the wallet's account if available
      const account = (wallet as any).account;
      if (account && typeof account.openProfile === 'function') {
        account.openProfile();
      }
    }
  }, [wallet]);

  return {
    sdk,
    wallet,
    isConnecting,
    isConnected,
    address,
    connect,
    disconnect,
    openProfile,
  };
}
