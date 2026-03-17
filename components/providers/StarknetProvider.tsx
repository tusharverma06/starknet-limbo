"use client";

import { StarkZap, type Wallet } from "starkzap";
import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { getStarknet } from "get-starknet-core";
import type { ConnectedStarknetWindowObject } from "get-starknet-core";

interface StarknetContextType {
  sdk: StarkZap | null;
  wallet: Wallet | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  address: string | null;
  hasWallet: boolean;
  starknetWallet: ConnectedStarknetWindowObject | null;
}

const StarknetContext = createContext<StarknetContextType>({
  sdk: null,
  wallet: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  address: null,
  hasWallet: false,
  starknetWallet: null,
});

export function StarknetProvider({ children }: { children: ReactNode }) {
  const [sdk, setSdk] = useState<StarkZap | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [hasWallet, setHasWallet] = useState(false);
  const [starknetWalletObject, setStarknetWalletObject] =
    useState<ConnectedStarknetWindowObject | null>(null);

  // Check if wallet extension is installed
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const starknetManager = getStarknet();
        const availableWallets = await starknetManager.getAvailableWallets();

        setHasWallet(availableWallets.length > 0);
      } catch (error) {
        setHasWallet(false);
      }
    };

    checkWallet();
  }, []);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);

      // Initialize StarkZap SDK with AVNU Paymaster for gasless transactions
      const starkZapSdk = new StarkZap({
        network: "mainnet",
        paymaster: {
          nodeUrl: "https://starknet.paymaster.avnu.fi",
          // No API key needed for gasless mode - users pay gas in USDC/USDT/etc instead of STRK
        },
      });

      // Get available wallets using get-starknet-core
      const starknetManager = getStarknet();
      const availableWallets = await starknetManager.getAvailableWallets();

      if (availableWallets.length === 0) {
        throw new Error(
          "No Starknet wallets found. Please install Argent X or Braavos.",
        );
      }

      // Connect to the first available wallet
      const selectedWallet = availableWallets[0];
      const connectedWallet = await starknetManager.enable(selectedWallet);

      if (!connectedWallet?.isConnected) {
        throw new Error("Failed to connect wallet");
      }

      const walletAddress =
        connectedWallet.selectedAddress || connectedWallet.account?.address;

      if (!walletAddress) {
        throw new Error("Could not get wallet address");
      }

      // For now, just store the raw wallet without Starkzap wrapper
      // We'll use the account directly for transfers
      setSdk(starkZapSdk);
      setWallet(null); // Skip Starkzap wallet wrapper for now
      setAddress(walletAddress);
      setIsConnected(true);
      setStarknetWalletObject(connectedWallet);
    } catch (error) {
      console.error("Error connecting to Starknet:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const starknetManager = getStarknet();
      await starknetManager.disconnect();
      setSdk(null);
      setWallet(null);
      setAddress(null);
      setIsConnected(false);
      setStarknetWalletObject(null);
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  const value: StarknetContextType = {
    sdk,
    wallet,
    isConnected,
    isConnecting,
    connect: handleConnect,
    disconnect: handleDisconnect,
    address,
    hasWallet,
    starknetWallet: starknetWalletObject,
  };

  return (
    <StarknetContext.Provider value={value}>
      {children}
    </StarknetContext.Provider>
  );
}

export function useStarknet() {
  const context = useContext(StarknetContext);
  if (!context) {
    throw new Error("useStarknet must be used within StarknetProvider");
  }
  return context;
}
