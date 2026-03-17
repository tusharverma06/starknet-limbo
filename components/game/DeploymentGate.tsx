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
  const { starknetWallet } = useStarknet();
  const { hasCompletedSiwe } = useSession();
  const [deploymentStatus, setDeploymentStatus] =
    useState<DeploymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  // Fetch deployment status when authenticated
  useEffect(() => {
    if (hasCompletedSiwe) {
      fetchDeploymentStatus();
    } else {
      setIsLoading(false);
    }
  }, [hasCompletedSiwe]);

  const fetchDeploymentStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/wallet/deployment-status");

      if (!response.ok) {
        throw new Error("Failed to fetch deployment status");
      }

      const data = await response.json();
      setDeploymentStatus(data);
    } catch (error) {
      console.error("Error fetching deployment status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!starknetWallet || !deploymentStatus) {
      toast.error("Please connect your wallet first");
      return;
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
