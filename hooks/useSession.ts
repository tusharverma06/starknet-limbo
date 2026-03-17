import { useState, useEffect, useCallback } from "react";
import { useStarknet } from "@/components/providers/StarknetProvider";
import { getOrCreateSessionId } from "@/lib/utils/session";

/**
 * Hook to manage wallet-based authentication
 * - Links connected Starknet wallet to custodial wallet automatically
 * - Handles SIWE-like authentication for Starknet
 * - Wallet address is the primary identifier
 */
export function useSession() {
  const { address, isConnected, starknetWallet } = useStarknet();
  const [isLinking, setIsLinking] = useState(false);
  const [custodialWallet, setCustodialWallet] = useState<string | null>(null);
  const [hasCompletedSiwe, setHasCompletedSiwe] = useState(false);

  // Check if SIWE was already completed (from localStorage OR database)
  useEffect(() => {
    if (address) {
      const sessionId = getOrCreateSessionId();
      const siweKey = `siwe_completed_${address.toLowerCase()}`;
      const localCompleted = localStorage.getItem(siweKey) === "true";
      if (localCompleted) {
        console.log("✅ SIWE marked as completed (localStorage) - verifying with backend...");
        // Verify with backend that SIWE is still valid
        setIsLinking(true);
        fetch("/api/session/link-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet_address: address,
            session_id: sessionId,
          }),
        })
          .then(async (res) => {
            const data = await res.json();
            if (res.ok && data.has_siwe) {
              setCustodialWallet(data.custodial_wallet);
              console.log("✅ SIWE verified, wallet loaded:", data.custodial_wallet);
              setHasCompletedSiwe(true);
            } else {
              console.log("⚠️  SIWE signature missing or expired");
              // Clear localStorage if SIWE not valid
              localStorage.removeItem(siweKey);
              setHasCompletedSiwe(false);
            }
          })
          .catch((err) => {
            console.error("Failed to verify SIWE:", err);
            // Clear localStorage on error
            localStorage.removeItem(siweKey);
            setHasCompletedSiwe(false);
          })
          .finally(() => setIsLinking(false));
      } else {
        // Check database for SIWE signature
        console.log("🔍 Checking database for existing SIWE...");
        fetch(`/api/session/check-siwe?wallet_address=${address}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.hasSiwe) {
              console.log("✅ SIWE found in database - loading wallet info");
              // Update localStorage
              localStorage.setItem(siweKey, "true");
              setHasCompletedSiwe(true);
              setCustodialWallet(data.custodial_wallet);
            } else {
              console.log("⚠️ SIWE not completed - user needs to sign in");
              setHasCompletedSiwe(false);
            }
          })
          .catch((err) => {
            console.error("Failed to check SIWE:", err);
            setHasCompletedSiwe(false);
          });
      }
    }
  }, [address]);

  // Link connected wallet to custodial wallet (with Starknet signature)
  const linkWalletToSession = useCallback(async () => {
    if (!address) return;

    // Check if SIWE already completed
    const siweKey = `siwe_completed_${address.toLowerCase()}`;
    if (hasCompletedSiwe || localStorage.getItem(siweKey) === "true") {
      console.log("⏭️ Skipping signature - already completed");
      return;
    }

    setIsLinking(true);
    try {
      const sessionId = getOrCreateSessionId();

      // STEP 1: Try to get/create custodial wallet first (without signature for existing users)
      console.log("🔗 Step 1: Checking for existing wallet...");
      const initialResponse = await fetch("/api/session/link-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          session_id: sessionId,
        }),
      });

      // Check if SIWE signature is required
      const initialData = await initialResponse.json();

      if (!initialResponse.ok && initialData.requires_siwe) {
        console.log("🔐 SIWE signature required - prompting user to sign...");

        // STEP 2: Create signature message for Starknet
        console.log("🔏 Step 2: Creating signature message...");
        const domain = window.location.host;
        const origin = window.location.origin;

        // Use a placeholder custodial address for the message
        const nonce = Math.random().toString(36).substring(2, 9); // 7 chars
        const timestamp = Date.now().toString(); // Unix timestamp

        // Shorten addresses to fit Starknet felt constraints (31 chars max)
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

        // Full message for storage
        const siweMessage = `${domain} wants you to sign in with your Starknet account:
${address}

I authorize the creation of a custodial wallet to place bets on my behalf.

URI: ${origin}
Nonce: ${nonce}
Timestamp: ${timestamp}`;

        // STEP 3: Sign the message with Starknet wallet
        console.log("✍️ Step 3: Requesting signature...");

        if (!starknetWallet?.account) {
          throw new Error("Starknet wallet not available");
        }

        // Typed data with shortened addresses and proper types
        const signature = await starknetWallet.account.signMessage({
          domain: {
            name: domain,
            version: "1",
          },
          message: {
            action: "Authorize betting",
            wallet: shortAddress,
            nonce: nonce,
            timestamp: timestamp,
          },
          primaryType: "Message",
          types: {
            StarkNetDomain: [
              { name: "name", type: "string" },
              { name: "version", type: "felt" },
            ],
            Message: [
              { name: "action", type: "string" },
              { name: "wallet", type: "felt" },
              { name: "nonce", type: "felt" },
              { name: "timestamp", type: "felt" },
            ],
          },
        });

        console.log("✅ Message signed");

        // STEP 4: Create wallet with signature data
        console.log("💾 Step 4: Creating wallet with signature...");
        const finalResponse = await fetch("/api/session/link-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet_address: address,
            session_id: sessionId,
            siwe_message: siweMessage,
            siwe_signature: JSON.stringify(signature),
          }),
        });

        if (!finalResponse.ok) {
          throw new Error("Failed to create custodial wallet with signature");
        }

        const finalData = await finalResponse.json();
        setCustodialWallet(finalData.custodial_wallet);

        // Only mark signature as completed if backend confirms it
        if (finalData.has_siwe) {
          localStorage.setItem(siweKey, "true");
          setHasCompletedSiwe(true);
          console.log("✅ Wallet created with signature:", {
            wallet: address,
            custodialWallet: finalData.custodial_wallet,
          });
        } else {
          console.warn("⚠️  Wallet created but SIWE not confirmed");
        }
      } else if (initialResponse.ok) {
        // Existing user - check if they have SIWE
        if (initialData.has_siwe) {
          console.log("✅ Existing wallet found with valid SIWE");
          setCustodialWallet(initialData.custodial_wallet);

          // Mark signature as completed
          localStorage.setItem(siweKey, "true");
          setHasCompletedSiwe(true);
        } else {
          console.log("⚠️  Existing wallet found but missing SIWE - should not reach here");
          // This should not happen due to backend 401, but handle it gracefully
          throw new Error("SIWE signature required");
        }
      } else {
        // Other error
        throw new Error(initialData.message || "Failed to create custodial wallet");
      }
    } catch (error) {
      console.error("Error linking wallet:", error);
    } finally {
      setIsLinking(false);
    }
  }, [address, hasCompletedSiwe, starknetWallet]);

  return {
    custodialWallet,
    isLinking,
    hasCompletedSiwe,
    linkWalletToSession, // Call this to trigger SIWE sign-in
  };
}
