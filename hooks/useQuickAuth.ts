import { useState, useEffect, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useFarcaster } from "./useFarcaster";

/**
 * Hook for Farcaster Quick Auth
 * Provides persistent authentication using JWT tokens
 * No more auto sign-outs!
 */
export function useQuickAuth() {
  const { user } = useFarcaster();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [custodialWallet, setCustodialWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated and get custodial wallet
  const checkAuth = useCallback(async () => {
    if (!user?.fid) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Use Quick Auth SDK to make authenticated request
      const response = await sdk.quickAuth.fetch("/api/auth/me");

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setCustodialWallet(data.custodialWallet);
      } else {
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
  }, [user?.fid]);

  // Check auth on mount and when user changes
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Sign in - creates custodial wallet if needed
   * Uses Quick Auth automatically for token management
   */
  const signIn = async (): Promise<boolean> => {
    if (!user?.fid) {
      setError("No Farcaster user found");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get or create custodial wallet using Quick Auth
      const response = await sdk.quickAuth.fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid: user.fid }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Sign in failed");
      }

      const data = await response.json();
      setIsAuthenticated(true);
      setCustodialWallet(data.custodialWallet);

      console.log("✅ Quick Auth sign in successful:", data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Quick Auth sign in failed:", errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out - clears authentication
   */
  const signOut = useCallback(async () => {
    try {
      await sdk.quickAuth.fetch("/api/auth/signout", {
        method: "POST",
      });

      setIsAuthenticated(false);
      setCustodialWallet(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  }, []);

  return {
    isAuthenticated,
    custodialWallet,
    isLoading,
    error,
    signIn,
    signOut,
    refetch: checkAuth,
  };
}
