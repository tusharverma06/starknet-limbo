"use client";

import { useStarknet } from "@/components/providers/StarknetProvider";
import { useSession } from "@/hooks/useSession";
import { useState, useEffect, createContext, useContext } from "react";
import { toast } from "sonner";

interface DeploymentStatus {
  custodialWalletAddress: string;
  isDeployed: boolean;
  strkBalance: string;
  strkBalanceFormatted: string;
}

interface DeploymentContextType {
  deploymentStatus: DeploymentStatus | null;
  isDeploying: boolean;
  handleDeploy: () => Promise<void>;
  isLoading: boolean;
  needsDeployment: boolean;
}

const DeploymentContext = createContext<DeploymentContextType | null>(null);

export function useDeployment() {
  const context = useContext(DeploymentContext);
  if (!context) {
    throw new Error("useDeployment must be used within DeploymentGate");
  }
  return context;
}

export function DeploymentGate({ children }: { children: React.ReactNode }) {
  const { starknetWallet, address } = useStarknet();
  const { hasCompletedSiwe } = useSession();
  const [deploymentStatus, setDeploymentStatus] =
    useState<DeploymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  // Fetch deployment status when authenticated
  useEffect(() => {
    if (hasCompletedSiwe && address) {
      fetchDeploymentStatus();
    } else {
      setIsLoading(false);
    }
  }, [hasCompletedSiwe, address]);

  const fetchDeploymentStatus = async () => {
    if (!address) {
      console.log("⚠️ No address available for deployment status check");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔍 Fetching deployment status for address:", address);
      const url = `/api/wallet/deployment-status?address=${encodeURIComponent(address)}`;
      console.log("📡 Fetching:", url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Deployment status error:", {
          status: response.status,
          error: errorData,
          address: address,
        });
        throw new Error(errorData.error || "Failed to fetch deployment status");
      }

      const data = await response.json();
      console.log("✅ Deployment status:", data);
      setDeploymentStatus(data);
    } catch (error) {
      console.error("❌ Error fetching deployment status:", error);
      // Keep deploymentStatus as null, which will prevent needsDeployment from being true
      setDeploymentStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!starknetWallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!address) {
      toast.error("Wallet address not found");
      return;
    }

    // If we don't have deployment status yet, fetch it first
    if (!deploymentStatus) {
      await fetchDeploymentStatus();
      if (!deploymentStatus) {
        toast.error("Failed to check wallet status. Please try again.");
        return;
      }
    }

    setIsDeploying(true);

    try {
      // STRK token contract address
      const STRK_ADDRESS =
        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

      // Amount: 0.5 STRK (enough for deployment + initial balance)
      const amountInStrk = 0.5;
      const amount = BigInt(Math.floor(amountInStrk * 1e18));

      // Convert to Uint256 (low, high)
      const low = amount & ((BigInt(1) << BigInt(128)) - BigInt(1));
      const high = amount >> BigInt(128);

      console.log("💰 Sending", amountInStrk, "STRK to custodial wallet...");

      // User sends STRK from their connected wallet to custodial wallet
      const tx = await starknetWallet.account.execute({
        contractAddress: STRK_ADDRESS,
        entrypoint: "transfer",
        calldata: [
          deploymentStatus.custodialWalletAddress, // to
          low.toString(), // amount low
          high.toString(), // amount high
        ],
      });

      console.log("📤 Transfer tx:", tx.transaction_hash);
      toast.success("Transfer sent! Waiting for confirmation...");

      // Wait for transfer confirmation
      await starknetWallet.provider.waitForTransaction(tx.transaction_hash);

      console.log("✅ Transfer confirmed! Now deploying wallet...");
      toast.success("Deploying wallet...");

      // Tell backend to deploy the custodial wallet now
      const deployResponse = await fetch("/api/wallet/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
        }),
      });

      if (!deployResponse.ok) {
        const error = await deployResponse.json();
        throw new Error(error.message || "Deployment failed");
      }

      const deployResult = await deployResponse.json();

      console.log("✅ Wallet deployed!", deployResult.txHash);
      toast.success("Wallet deployed! You can now place bets.");

      // Refresh deployment status
      await fetchDeploymentStatus();
    } catch (error) {
      console.error("❌ Deploy failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to deploy wallet"
      );
    } finally {
      setIsDeploying(false);
    }
  };

  const needsDeployment =
    hasCompletedSiwe &&
    deploymentStatus !== null &&
    !deploymentStatus.isDeployed;

  const value: DeploymentContextType = {
    deploymentStatus,
    isDeploying,
    handleDeploy,
    isLoading,
    needsDeployment,
  };

  return (
    <DeploymentContext.Provider value={value}>
      {children}
    </DeploymentContext.Provider>
  );
}
