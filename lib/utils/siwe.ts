import { CHAIN } from "@/lib/constants";

/**
 * Create a SIWE (Sign-In with Ethereum) message for authorizing custodial wallet
 */
export function createSiweMessage(params: {
  userWalletAddress: string; // User's initial wallet address
  custodialWalletAddress: string; // Server-side custodial wallet
  expiresAt: Date;
  domain: string;
  issuedAt: Date;
}): string {
  const message = `
You are approving wallet ${
    params.custodialWalletAddress
  } to login and sign bets until ${params.expiresAt
    .toISOString()
    .replace("T", " ")
    .substring(0, 19)}.
Allowed to initiate withdrawals back to ${params.userWalletAddress}.

URI: https://${params.domain}
Version: 1
Chain ID: ${CHAIN.id}
Nonce: ${Math.floor(Math.random() * 1000000)}
Issued At: ${params.issuedAt.toISOString()}
Expiration Time: ${params.expiresAt.toISOString()}`;

  return message;
}

/**
 * Verify a SIWE signature
 */
export function verifySiweSignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const { verifyMessage } = require("ethers");
    const recoveredAddress = verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error("Error verifying SIWE signature:", error);
    return false;
  }
}

/**
 * Parse custodial wallet address from SIWE message
 */
export function parseCustodialWalletFromSiwe(message: string): string | null {
  try {
    const match = message.match(/approving wallet (0x[a-fA-F0-9]{40})/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error parsing custodial wallet from SIWE:", error);
    return null;
  }
}

/**
 * Parse initial wallet address from SIWE message
 */
export function parseInitialWalletFromSiwe(message: string): string | null {
  try {
    const match = message.match(/withdrawals back to (0x[a-fA-F0-9]{40})/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error parsing initial wallet from SIWE:", error);
    return null;
  }
}
