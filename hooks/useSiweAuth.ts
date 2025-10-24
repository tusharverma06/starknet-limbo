import { useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useFarcaster } from "./useFarcaster";
import { createSiweMessage } from "@/lib/utils/siwe";

export function useSiweAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { user } = useFarcaster();
  const userId = user?.fid?.toString();

  const [isSigning, setIsSigning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [custodialWallet, setCustodialWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/auth/status?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
          setCustodialWallet(data.custodialWallet);
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
      }
    };

    checkAuth();
  }, [userId]);

  const signIn = async () => {
    if (!address || !userId) {
      setError("Wallet not connected or user not found");
      return false;
    }

    setIsSigning(true);
    setError(null);

    try {
      // First, get or create the custodial wallet
      console.log("🔐 Getting/creating custodial wallet for user:", userId);
      const walletResponse = await fetch("/api/wallet/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      let custodialAddress: string;
      if (walletResponse.status === 409) {
        // Wallet already exists
        const walletData = await walletResponse.json();
        custodialAddress = walletData.address;
        console.log("✅ Using existing custodial wallet:", custodialAddress);
      } else if (walletResponse.ok) {
        // New wallet created
        const walletData = await walletResponse.json();
        custodialAddress = walletData.address;
        console.log("✅ New custodial wallet created:", custodialAddress);
      } else {
        throw new Error("Failed to get or create custodial wallet");
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      const message = createSiweMessage({
        userWalletAddress: address,
        custodialWalletAddress: custodialAddress,
        expiresAt,
        domain: window.location.host,
        issuedAt: new Date(),
      });

      console.log("📝 SIWE message created:", message);

      // Sign the message
      const signature = await signMessageAsync({ message });

      console.log("✍️ Message signed");

      // Send to backend to save authentication
      const response = await fetch("/api/auth/siwe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message,
          signature,
          userWalletAddress: address,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Authentication failed");
      }

      const data = await response.json();
      console.log("✅ SIWE authentication successful:", data);

      setIsAuthenticated(true);
      setCustodialWallet(data.user.custodialWalletAddress);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ SIWE authentication failed:", errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsSigning(false);
    }
  };

  const signOut = async () => {
    if (!userId) return;

    try {
      // Clear SIWE data from backend
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      setIsAuthenticated(false);
      setCustodialWallet(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return {
    isConnected,
    connectedAddress: address,
    isAuthenticated,
    custodialWallet,
    isSigning,
    error,
    signIn,
    signOut,
  };
}
