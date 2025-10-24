import { Wallet } from "ethers";
import { decryptPrivateKey } from "./encryption";

/**
 * Create a structured bet message for signing
 */
export function createBetMessage(params: {
  betId: string;
  wager: string;
  targetMultiplier: string;
  serverSeedHash: string;
  timestamp: number;
}): string {
  return JSON.stringify({
    betId: params.betId,
    wager: params.wager,
    targetMultiplier: params.targetMultiplier,
    serverSeedHash: params.serverSeedHash,
    timestamp: params.timestamp,
  });
}

/**
 * Sign a bet message using the custodial wallet's private key
 */
export async function signBetMessage(
  message: string,
  encryptedPrivateKey: string
): Promise<string> {
  try {
    // Decrypt the private key
    const privateKey = decryptPrivateKey(encryptedPrivateKey);

    // Create wallet instance
    const wallet = new Wallet(privateKey);

    // Sign the message
    const signature = await wallet.signMessage(message);

    return signature;
  } catch (error) {
    console.error("Error signing bet message:", error);
    throw new Error("Failed to sign bet message");
  }
}

/**
 * Verify a bet message signature
 */
export function verifyBetSignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const { verifyMessage } = require("ethers");
    const recoveredAddress = verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error("Error verifying bet signature:", error);
    return false;
  }
}

/**
 * Parse a bet message back to its components
 */
export function parseBetMessage(message: string): {
  betId: string;
  wager: string;
  targetMultiplier: string;
  serverSeedHash: string;
  timestamp: number;
} | null {
  try {
    const parsed = JSON.parse(message);
    if (
      !parsed.betId ||
      !parsed.wager ||
      !parsed.targetMultiplier ||
      !parsed.serverSeedHash ||
      !parsed.timestamp
    ) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Error parsing bet message:", error);
    return null;
  }
}
