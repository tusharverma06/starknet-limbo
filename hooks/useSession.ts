import { useState, useEffect, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { getOrCreateSessionId } from "@/lib/utils/session";

/**
 * Hook to manage wallet-based authentication
 * - Links connected wallet to custodial wallet automatically
 * - Handles SIWE authentication
 * - No more session IDs - wallet address is the primary identifier
 */
export function useSession() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
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
        setHasCompletedSiwe(true);
        // Load custodial wallet info
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
          })
          .catch((err) => console.error("Failed to load wallet info:", err))
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

  // Link connected wallet to custodial wallet (with SIWE)
  const linkWalletToSession = useCallback(async () => {
    if (!address) return;

    // Check if SIWE already completed
    const siweKey = `siwe_completed_${address.toLowerCase()}`;
    if (hasCompletedSiwe || localStorage.getItem(siweKey) === "true") {
      console.log("⏭️ Skipping SIWE - already completed");
      return;
    }

    setIsLinking(true);
    try {
      const sessionId = getOrCreateSessionId();
      // STEP 1: Create/get custodial wallet first (without SIWE)
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

      // STEP 2: Create SIWE message with custodial wallet address
      console.log("🔏 Step 2: Creating SIWE message...");
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement = `I authorize my custodial wallet (${custodialWalletAddress}) to place bets on my behalf on ${domain}.`;
      const issuedAt = new Date().toISOString();
      const expirationTime = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(); // 30 days

      const siweMessage = `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${origin}
Version: 1
Chain ID: 1
Nonce: ${Math.random().toString(36).substring(7)}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}
Resources:
- Custodial Wallet: ${custodialWalletAddress}`;

      // STEP 3: Sign the SIWE message
      console.log("✍️ Step 3: Requesting signature...");
      const signature = await signMessageAsync({ message: siweMessage });
      console.log("✅ Message signed");

      // STEP 4: Update with SIWE data
      console.log("💾 Step 4: Saving SIWE signature...");
      const finalResponse = await fetch("/api/session/link-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          session_id: sessionId,
          siwe_message: siweMessage,
          siwe_signature: signature,
        }),
      });

      if (!finalResponse.ok) {
        throw new Error("Failed to save SIWE signature");
      }

      const finalData = await finalResponse.json();
      setCustodialWallet(finalData.custodial_wallet);

      // Mark SIWE as completed
      const siweKey = `siwe_completed_${address.toLowerCase()}`;
      localStorage.setItem(siweKey, "true");
      setHasCompletedSiwe(true);

      console.log("✅ Wallet linked with SIWE:", {
        wallet: address,
        custodialWallet: finalData.custodial_wallet,
      });
    } catch (error) {
      console.error("Error linking wallet:", error);
    } finally {
      setIsLinking(false);
    }
  }, [address, signMessageAsync, hasCompletedSiwe]);

  return {
    custodialWallet,
    isLinking,
    hasCompletedSiwe,
    linkWalletToSession, // Call this to trigger SIWE sign-in
  };
}
