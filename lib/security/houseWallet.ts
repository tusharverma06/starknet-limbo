import { Wallet, JsonRpcProvider } from "ethers";
import { decryptPrivateKey } from "@/lib/utils/encryption";

/**
 * Secure house wallet manager
 * - Never logs private keys
 * - Clears private key from memory after use
 * - Provides safe transaction execution
 */

let cachedHouseWalletAddress: string | null = null;

/**
 * Get the house wallet address (safe to cache and log)
 */
export function getHouseWalletAddress(): string {
  if (!cachedHouseWalletAddress) {
    const encryptedKey = process.env.ENCRYPTED_HOUSE_WALLET_KEY;
    if (!encryptedKey) {
      throw new Error("ENCRYPTED_HOUSE_WALLET_KEY not set in environment");
    }

    // Temporarily decrypt to get address, then clear
    let privateKey: string | null = null;
    try {
      privateKey = decryptPrivateKey(encryptedKey);
      const tempWallet = new Wallet(privateKey);
      cachedHouseWalletAddress = tempWallet.address;
    } finally {
      // Clear private key from memory
      privateKey = null;
    }
  }

  return cachedHouseWalletAddress;
}

/**
 * Execute a function with the house wallet
 * Private key is loaded only during execution and immediately cleared
 *
 * @param callback Function that receives the wallet and provider
 * @returns Result of the callback
 */
export async function withHouseWallet<T>(
  callback: (wallet: Wallet, provider: JsonRpcProvider) => Promise<T>
): Promise<T> {
  let privateKey: string | null = null;
  let wallet: Wallet | null = null;

  try {
    // Get encrypted key from environment
    const encryptedKey = process.env.ENCRYPTED_HOUSE_WALLET_KEY;
    if (!encryptedKey) {
      throw new Error("ENCRYPTED_HOUSE_WALLET_KEY not set in environment");
    }

    // Decrypt private key
    privateKey = decryptPrivateKey(encryptedKey);

    // Create provider
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL ||
      `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

    if (!rpcUrl || rpcUrl.includes("undefined")) {
      throw new Error("RPC URL not configured");
    }

    const provider = new JsonRpcProvider(rpcUrl);

    // Create wallet
    wallet = new Wallet(privateKey, provider);

    // Execute callback
    const result = await callback(wallet, provider);

    return result;
  } catch (error) {
    // Never log the error if it contains the private key
    if (error instanceof Error) {
      // Create safe error message
      const safeMessage = error.message.replace(
        /0x[a-fA-F0-9]{64}/g,
        "[REDACTED]"
      );
      throw new Error(`House wallet operation failed: ${safeMessage}`);
    }
    throw new Error("House wallet operation failed");
  } finally {
    // Clear sensitive data from memory
    privateKey = null;
    wallet = null;
  }
}

/**
 * Get house wallet balance safely
 */
export async function getHouseWalletBalance(): Promise<bigint> {
  return await withHouseWallet(async (wallet, provider) => {
    return await provider.getBalance(wallet.address);
  });
}

/**
 * Send ETH from house wallet to a recipient
 *
 * @param to Recipient address
 * @param amount Amount in wei
 * @returns Transaction hash
 */
export async function sendFromHouseWallet(
  to: string,
  amount: bigint
): Promise<string> {
  return await withHouseWallet(async (wallet) => {
    // Validate inputs (never log private keys)
    if (!to || !/^0x[a-fA-F0-9]{40}$/.test(to)) {
      throw new Error("Invalid recipient address");
    }

    if (amount <= BigInt(0)) {
      throw new Error("Amount must be greater than 0");
    }
    const nonce = await wallet.getNonce();
    console.log("🔑 Nonce:", nonce);

    // Send transaction
    const tx = await wallet.sendTransaction({
      to,
      value: amount,
      // Add reasonable gas settings
      gasLimit: 21000,
      nonce: nonce,
    });

    // Return only the transaction hash (safe to log)
    return tx.hash;
  });
}

/**
 * Check if house wallet has sufficient balance
 */
export async function hasHouseSufficientBalance(
  requiredAmount: bigint
): Promise<boolean> {
  const balance = await getHouseWalletBalance();
  return balance >= requiredAmount;
}

/**
 * Send ETH from user's wallet to house wallet
 *
 * @param userEncryptedKey User's encrypted private key
 * @param amount Amount in wei to send
 * @returns Transaction hash
 */
export async function sendToHouseWallet(
  userEncryptedKey: string,
  amount: bigint
): Promise<string> {
  let privateKey: string | null = null;
  let userWallet: Wallet | null = null;

  try {
    const { decryptPrivateKey } = await import("@/lib/utils/encryption");

    // Decrypt user's private key
    privateKey = decryptPrivateKey(userEncryptedKey);

    // Create provider
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL ||
      `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

    if (!rpcUrl || rpcUrl.includes("undefined")) {
      throw new Error("RPC URL not configured");
    }

    const provider = new JsonRpcProvider(rpcUrl);

    // Create user's wallet
    userWallet = new Wallet(privateKey, provider);

    // Get house wallet address
    const houseWalletAddress = getHouseWalletAddress();

    // Validate inputs
    if (amount <= BigInt(0)) {
      throw new Error("Amount must be greater than 0");
    }

    console.log("📤 Sending bet from user to house wallet:", {
      from: userWallet.address,
      to: houseWalletAddress,
      amount: amount.toString(),
    });

    // Send transaction from user's wallet to house wallet
    const tx = await userWallet.sendTransaction({
      to: houseWalletAddress,
      value: amount,
      gasLimit: 21000,
    });

    console.log("✅ Bet sent to house wallet:", tx.hash);

    // Return transaction hash
    return tx.hash;
  } catch (error) {
    // Never log the error if it contains the private key
    if (error instanceof Error) {
      const safeMessage = error.message.replace(
        /0x[a-fA-F0-9]{64}/g,
        "[REDACTED]"
      );
      throw new Error(`Failed to send to house wallet: ${safeMessage}`);
    }
    throw new Error("Failed to send to house wallet");
  } finally {
    // Clear sensitive data from memory
    privateKey = null;
    userWallet = null;
  }
}
