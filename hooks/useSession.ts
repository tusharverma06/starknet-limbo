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
        console.log("✅ SIWE completed (localStorage) - loading wallet info");
        // Load custodial wallet info first, then set hasCompletedSiwe
        setIsLinking(true);
        fetch("/api/session/link-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet_address: address,
            session_id: sessionId,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setCustodialWallet(data.custodial_wallet);
            console.log("✅ Custodial wallet loaded:", data.custodial_wallet);
            // Only set hasCompletedSiwe after user is confirmed in database
            setHasCompletedSiwe(true);
          })
          .catch((err) => {
            console.error("Failed to load wallet info:", err);
            // Clear localStorage if verification fails
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
      // STEP 1: Create/get custodial wallet first (without signature)
      console.log("🔗 Step 1: Creating/getting custodial wallet...");
      const initialResponse = await fetch("/api/session/link-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          session_id: sessionId,
        }),
      });

      if (!initialResponse.ok) {
        throw new Error("Failed to create custodial wallet");
      }

      const initialData = await initialResponse.json();
      const custodialWalletAddress = initialData.custodial_wallet;

      console.log(
        "✅ Custodial wallet created/retrieved:",
        custodialWalletAddress,
      );

      // STEP 2: Create signature message for Starknet
      console.log("🔏 Step 2: Creating signature message...");
      const domain = window.location.host;
      const origin = window.location.origin;

      // Shorten addresses to fit Starknet felt constraints (31 chars max)
      // Format: "0x123...abc" (fits in 14 chars including 0x)
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
      const shortCustodial = `${custodialWalletAddress.slice(0, 6)}...${custodialWalletAddress.slice(-4)}`;
      const nonce = Math.random().toString(36).substring(2, 9); // 7 chars
      const timestamp = Date.now().toString(); // Unix timestamp

      // Full message for storage (contains complete context)
      const siweMessage = `${domain} wants you to sign in with your Starknet account:
${address}

I authorize custodial wallet ${custodialWalletAddress} to place bets on my behalf.

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
          name: domain, // Use string type
          version: "1",
        },
        message: {
          action: "Authorize betting",
          wallet: shortAddress, // Shortened wallet
          custodial: shortCustodial, // Shortened custodial
          nonce: nonce, // Short nonce
          timestamp: timestamp, // Timestamp as string
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
            { name: "custodial", type: "felt" },
            { name: "nonce", type: "felt" },
            { name: "timestamp", type: "felt" },
          ],
        },
      });

      console.log("✅ Message signed");

      // STEP 4: Update with signature data
      console.log("💾 Step 4: Saving signature...");
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
        throw new Error("Failed to save signature");
      }

      const finalData = await finalResponse.json();
      setCustodialWallet(finalData.custodial_wallet);

      // Mark signature as completed
      const siweKey = `siwe_completed_${address.toLowerCase()}`;
      localStorage.setItem(siweKey, "true");
      setHasCompletedSiwe(true);

      console.log("✅ Wallet linked with signature:", {
        wallet: address,
        custodialWallet: finalData.custodial_wallet,
      });
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
