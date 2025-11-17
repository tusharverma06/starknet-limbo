import { useState, useEffect, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useFarcaster } from "./useFarcaster";

interface UseSimpleSiweReturn {
  isAuthenticated: boolean;
  custodialWallet: string | null;
  isLoading: boolean;
  isSigning: boolean;
  error: string | null;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  userAddress: string | null;
}

/**
 * Simple SIWE authentication hook with cookie-based sessions
 * Flow:
 * 1. Connect wallet (Farcaster connector via wagmi)
 * 2. Get custodial wallet address from backend
 * 3. Sign SIWE message showing custodial wallet
 * 4. Backend stores signature + creates HttpOnly session cookie (SameSite=None for iframe)
 */
export function useSimpleSiwe(): UseSimpleSiweReturn {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { user } = useFarcaster();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [custodialWallet, setCustodialWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount and when user changes
  useEffect(() => {
    const checkAuth = async () => {
      // If no user FID, can't check auth
      if (!user?.fid) {
        setIsAuthenticated(false);
        setCustodialWallet(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Check session-based auth by FID (session cookie sent automatically)
        const params = new URLSearchParams();
        params.append("userId", user.fid.toString());

        const response = await fetch(`/api/auth/status?${params.toString()}`);

        if (response.ok) {
          const data = await response.json();
          const isAuthValid = data.isAuthenticated && !data.isExpired;

          console.log("🔐 Session check:", {
            isAuthenticated: data.isAuthenticated,
            isExpired: data.isExpired,
            isAuthValid,
            custodialWallet: data.custodialWallet,
          });

          setIsAuthenticated(isAuthValid);
          setCustodialWallet(data.custodialWallet);

          if (data.isExpired) {
            setError("Session expired. Please sign in again.");
          }
        } else {
          console.log("❌ Session check failed:", response.status);
          setIsAuthenticated(false);
          setCustodialWallet(null);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        setIsAuthenticated(false);
        setCustodialWallet(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user?.fid, address]);

  const signIn = useCallback(async (): Promise<boolean> => {
    if (!address || !isConnected) {
      setError("Please connect your wallet first");
      return false;
    }

    setIsSigning(true);
    setError(null);

    try {
      // Step 1: Get custodial wallet address from backend
      console.log("📝 Getting custodial wallet address...");

      const custodialResponse = await fetch("/custodial-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address.toLowerCase(),
          fid: user?.fid || null,
          username: user?.username || null,
          pfp: user?.pfpUrl || null,
        }),
      });

      if (!custodialResponse.ok) {
        throw new Error("Failed to get custodial wallet");
      }

      const { custodialWalletAddress } = await custodialResponse.json();
      console.log("✅ Custodial wallet:", custodialWalletAddress);

      // Step 2: Create SIWE message with custodial wallet address
      const domain = window.location.host;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
      const issuedAt = new Date();

      const message = `Based Limbo wants you to sign in with your Ethereum account:
${address}

By signing, you authorize custodial wallet ${custodialWalletAddress} to place bets on your behalf until ${expiresAt.toISOString().replace("T", " ").substring(0, 19)}.

Withdrawals can only be sent back to ${address}.

URI: https://${domain}
Version: 1
Chain ID: 8453
Nonce: ${Math.floor(Math.random() * 1000000)}
Issued At: ${issuedAt.toISOString()}
Expiration Time: ${expiresAt.toISOString()}`;

      console.log("📝 Signing SIWE message...");

      // Step 3: Sign the message
      const signature = await signMessageAsync({ message });

      console.log("✍️ Message signed");

      // Step 4: Send to backend to store signature
      const response = await fetch("/siwe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address.toLowerCase(),
          signature,
          message,
          fid: user?.fid || null,
          username: user?.username || null,
          pfp: user?.pfpUrl || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Authentication failed");
      }

      const data = await response.json();
      console.log("✅ SIWE authentication successful - session cookie set");

      setIsAuthenticated(true);
      setCustodialWallet(data.user.custodialWalletAddress);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ SIWE sign-in failed:", errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsSigning(false);
    }
  }, [address, isConnected, signMessageAsync, user]);

  const signOut = useCallback(async () => {
    if (!address && !user?.fid) return;

    try {
      await fetch("/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address?.toLowerCase(),
          fid: user?.fid || null,
        }),
      });

      setIsAuthenticated(false);
      setCustodialWallet(null);
      console.log("✅ Signed out successfully - session cookie cleared");
    } catch (err) {
      console.error("❌ Sign out error:", err);
    }
  }, [address, user?.fid]);

  return {
    isAuthenticated,
    custodialWallet,
    isLoading,
    isSigning,
    error,
    signIn,
    signOut,
    userAddress: address || null,
  };
}

/**
 * Helper function to get auth headers for API requests
 * Cookies are sent automatically by the browser
 */
export function getAuthHeaders(_connectedAddress?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}
