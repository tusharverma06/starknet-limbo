"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useStarknet } from "@/components/providers/StarknetProvider";
import { Button } from "./Button";
import { formatStarknetAddress } from "@/lib/starknet/betting";

type NetworkType = "evm" | "starknet";

export function NetworkSelector() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>("evm");

  // EVM (wagmi)
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { disconnect: evmDisconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  // Starknet
  const {
    address: starknetAddress,
    isConnected: isStarknetConnected,
    isConnecting: isStarknetConnecting,
    connect: starknetConnect,
    disconnect: starknetDisconnect,
  } = useStarknet();

  const handleNetworkChange = (network: NetworkType) => {
    setSelectedNetwork(network);
  };

  const handleConnect = () => {
    if (selectedNetwork === "evm") {
      openConnectModal?.();
    } else {
      starknetConnect();
    }
  };

  const handleDisconnect = () => {
    if (selectedNetwork === "evm") {
      evmDisconnect();
    } else {
      starknetDisconnect();
    }
  };

  const isConnected = selectedNetwork === "evm" ? isEvmConnected : isStarknetConnected;
  const address = selectedNetwork === "evm" ? evmAddress : starknetAddress;
  const isLoading = selectedNetwork === "starknet" && isStarknetConnecting;

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Network Selector Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
        <button
          onClick={() => handleNetworkChange("evm")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            selectedNetwork === "evm"
              ? "bg-white/10 text-white"
              : "text-white/60 hover:text-white/80"
          }`}
        >
          EVM
        </button>
        <button
          onClick={() => handleNetworkChange("starknet")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            selectedNetwork === "starknet"
              ? "bg-white/10 text-white"
              : "text-white/60 hover:text-white/80"
          }`}
        >
          Starknet
        </button>
      </div>

      {/* Connection Status */}
      {isConnected ? (
        <div className="flex items-center justify-between gap-2 p-3 bg-white/5 rounded-lg">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-white/60">Connected</span>
            <span className="text-sm font-medium text-white">
              {selectedNetwork === "evm"
                ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                : formatStarknetAddress(address || "")}
            </span>
          </div>
          <Button onClick={handleDisconnect} variant="secondary" size="sm">
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading
            ? "Connecting..."
            : `Connect ${selectedNetwork === "evm" ? "Wallet" : "Starknet"}`}
        </Button>
      )}

      {/* Network Info */}
      <div className="text-xs text-white/40 text-center">
        {selectedNetwork === "evm" ? (
          <span>Using Base Sepolia (EVM)</span>
        ) : (
          <span>Using Starknet Mainnet</span>
        )}
      </div>
    </div>
  );
}
