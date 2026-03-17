import { Account, RpcProvider, uint256 } from "starknet";
import { decryptPrivateKey } from "@/lib/utils/encryption";
import { getStarknetProvider } from "./provider";

/**
 * Secure Starknet house wallet manager
 * - Never logs private keys
 * - Clears private key from memory after use
 * - Provides safe transaction execution
 */

let cachedStarknetHouseWalletAddress: string | null = null;

/**
 * Get the Starknet house wallet address (safe to cache and log)
 */
export function getStarknetHouseWalletAddress(): string {
  const address = process.env.STARKNET_HOUSE_WALLET_ADDRESS;

  if (!address) {
    throw new Error("STARKNET_HOUSE_WALLET_ADDRESS not set in environment");
  }

  cachedStarknetHouseWalletAddress = address;
  return cachedStarknetHouseWalletAddress;
}

/**
 * Execute a function with the Starknet house wallet
 * Private key is loaded only during execution and immediately cleared
 */
export async function withStarknetHouseWallet<T>(
  callback: (account: Account, provider: RpcProvider) => Promise<T>
): Promise<T> {
  let privateKey: string | null = null;
  let account: Account | null = null;

  try {
    // Get encrypted key from environment
    const encryptedKey = process.env.ENCRYPTED_STARKNET_HOUSE_WALLET_KEY;
    if (!encryptedKey) {
      throw new Error("ENCRYPTED_STARKNET_HOUSE_WALLET_KEY not set in environment");
    }

    const houseWalletAddress = getStarknetHouseWalletAddress();

    // Decrypt private key
    privateKey = decryptPrivateKey(encryptedKey);

    // Create provider
    const provider = getStarknetProvider();

    // Create account (Starknet.js v9 signature)
    account = new Account({
      provider: provider,
      address: houseWalletAddress,
      signer: privateKey,
    });

    // Execute callback
    const result = await callback(account, provider);

    return result;
  } catch (error) {
    // Never log the error if it contains the private key
    if (error instanceof Error) {
      // Create safe error message
      const safeMessage = error.message.replace(
        /0x[a-fA-F0-9]{64}/g,
        "[REDACTED]"
      );
      throw new Error(`Starknet house wallet operation failed: ${safeMessage}`);
    }
    throw new Error("Starknet house wallet operation failed");
  } finally {
    // Clear sensitive data from memory
    privateKey = null;
    account = null;
  }
}

/**
 * Get Starknet house wallet balance safely
 * Returns balance in wei (smallest unit of STRK)
 */
export async function getStarknetHouseWalletBalance(): Promise<bigint> {
  return await withStarknetHouseWallet(async (account, provider) => {
    const houseAddress = getStarknetHouseWalletAddress();

    // Get ETH balance on Starknet
    // ETH contract address on Starknet mainnet
    const ethContractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

    try {
      const balance = await provider.callContract({
        contractAddress: ethContractAddress,
        entrypoint: "balanceOf",
        calldata: [houseAddress],
      });

      // Parse uint256 result
      const balanceLow = BigInt(balance[0]);
      const balanceHigh = BigInt(balance[1] || 0);
      return balanceLow + (balanceHigh << BigInt(128));
    } catch (error) {
      console.error("Failed to get Starknet house wallet balance:", error);
      return BigInt(0);
    }
  });
}

/**
 * Send tokens from Starknet house wallet to a recipient
 *
 * @param to Recipient address (Starknet address)
 * @param amount Amount in wei
 * @param tokenContractAddress Token contract address (defaults to ETH)
 * @returns Transaction hash
 */
export async function sendTokenFromStarknetHouseWallet(
  to: string,
  amount: bigint,
  tokenContractAddress?: string
): Promise<string> {
  return await withStarknetHouseWallet(async (account) => {
    // Validate inputs
    if (!to || to.length <= 42) {
      throw new Error("Invalid Starknet recipient address");
    }

    if (amount <= BigInt(0)) {
      throw new Error("Amount must be greater than 0");
    }

    // Default to ETH contract address on Starknet mainnet
    const contractAddress = tokenContractAddress || "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

    console.log("📤 Sending from Starknet house wallet:", {
      to,
      amount: amount.toString(),
      token: contractAddress,
    });

    // Prepare transfer call
    const transferCall = {
      contractAddress,
      entrypoint: "transfer",
      calldata: [to, uint256.bnToUint256(amount)],
    };

    // Execute transaction
    const tx = await account.execute(transferCall);

    console.log("✅ Starknet transfer transaction sent:", tx.transaction_hash);

    return tx.transaction_hash;
  });
}

/**
 * Send ETH from Starknet house wallet to a recipient
 *
 * @param to Recipient address (Starknet address)
 * @param amount Amount in wei
 * @returns Transaction hash
 */
export async function sendFromStarknetHouseWallet(
  to: string,
  amount: bigint
): Promise<string> {
  // ETH contract address on Starknet mainnet
  const ethContractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
  return sendTokenFromStarknetHouseWallet(to, amount, ethContractAddress);
}

/**
 * Send STRK from Starknet house wallet to a recipient
 *
 * @param to Recipient address (Starknet address)
 * @param amount Amount in wei
 * @returns Transaction hash
 */
export async function sendStrkFromStarknetHouseWallet(
  to: string,
  amount: bigint
): Promise<string> {
  // STRK contract address on Starknet mainnet
  const strkContractAddress = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
  return sendTokenFromStarknetHouseWallet(to, amount, strkContractAddress);
}

/**
 * Check if Starknet house wallet has sufficient balance
 */
export async function hasStarknetHouseSufficientBalance(
  requiredAmount: bigint
): Promise<boolean> {
  const balance = await getStarknetHouseWalletBalance();
  return balance >= requiredAmount;
}

/**
 * Send ETH from user's Starknet wallet to house wallet
 *
 * @param userEncryptedKey User's encrypted private key
 * @param userAddress User's Starknet address
 * @param amount Amount in wei to send
 * @returns Transaction hash
 */
export async function sendToStarknetHouseWallet(
  userEncryptedKey: string,
  userAddress: string,
  amount: bigint
): Promise<string> {
  let privateKey: string | null = null;
  let userAccount: Account | null = null;

  try {
    const { decryptPrivateKey } = await import("@/lib/utils/encryption");

    // Decrypt user's private key
    privateKey = decryptPrivateKey(userEncryptedKey);

    // Create provider
    const provider = getStarknetProvider();

    // Create user's account (Starknet.js v9 signature)
    userAccount = new Account({
      provider: provider,
      address: userAddress,
      signer: privateKey,
    });

    // Get house wallet address
    const houseWalletAddress = getStarknetHouseWalletAddress();

    // Validate inputs
    if (amount <= BigInt(0)) {
      throw new Error("Amount must be greater than 0");
    }

    console.log("📤 Sending bet from user to Starknet house wallet:", {
      from: userAddress,
      to: houseWalletAddress,
      amount: amount.toString(),
    });

    // ETH contract address on Starknet mainnet
    const ethContractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

    // Prepare transfer call
    const transferCall = {
      contractAddress: ethContractAddress,
      entrypoint: "transfer",
      calldata: [houseWalletAddress, uint256.bnToUint256(amount)],
    };

    // Execute transaction
    const tx = await userAccount.execute(transferCall);

    console.log("✅ Bet sent to Starknet house wallet:", tx.transaction_hash);

    // Return transaction hash
    return tx.transaction_hash;
  } catch (error) {
    // Never log the error if it contains the private key
    if (error instanceof Error) {
      const safeMessage = error.message.replace(
        /0x[a-fA-F0-9]{64}/g,
        "[REDACTED]"
      );
      throw new Error(`Failed to send to Starknet house wallet: ${safeMessage}`);
    }
    throw new Error("Failed to send to Starknet house wallet");
  } finally {
    // Clear sensitive data from memory
    privateKey = null;
    userAccount = null;
  }
}
