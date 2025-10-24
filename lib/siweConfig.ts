import { getCsrfToken, signIn, signOut } from "next-auth/react";
import type {
  SIWESession,
  SIWEVerifyMessageArgs,
  SIWECreateMessageArgs,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import { SiweMessage } from "siwe";

export const siweConfig = {
  getNonce: async () => {
    const nonce = await getCsrfToken();
    return nonce ?? "";
  },
  createMessage: ({ nonce, address, chainId }: SIWECreateMessageArgs) => {
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in with Ethereum to Based Limbo",
      uri: window.location.origin,
      version: "1",
      chainId,
      nonce,
    });
    return message.prepareMessage();
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
      const response = await fetch("/api/auth/verify-siwe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  },
  getSession: async (): Promise<SIWESession | null> => {
    try {
      const response = await fetch("/api/auth/session");
      if (!response.ok) return null;
      const data = await response.json();
      return data.address ? { address: data.address, chainId: data.chainId } : null;
    } catch {
      return null;
    }
  },
  signOut: async () => {
    await fetch("/api/auth/signout", { method: "POST" });
  },
};
