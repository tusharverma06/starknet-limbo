import { config } from "dotenv";
import { encryptPrivateKey } from "@/lib/utils/encryption";
import * as readline from "readline";

// Load environment variables from .env file
config();

/**
 * Script to encrypt Starknet house wallet private key
 * Usage: npm run encrypt-starknet-key
 */

console.log("\n🔐 Starknet House Wallet Key Encryption");
console.log("=====================================\n");

// Check if ENCRYPTION_KEY or WALLET_ENCRYPTION_SECRET is set
const encryptionKey = process.env.ENCRYPTION_KEY || process.env.WALLET_ENCRYPTION_SECRET;

if (!encryptionKey) {
  console.error("❌ ERROR: No encryption key found in environment!");
  console.error("\nPlease add one of these to your .env file:");
  console.error("  ENCRYPTION_KEY=<your-key>");
  console.error("  OR");
  console.error("  WALLET_ENCRYPTION_SECRET=<your-key>");
  console.error("\nGenerate a new key with:");
  console.error("  openssl rand -hex 32");
  process.exit(1);
}

console.log("✅ Encryption key loaded from environment\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter your Starknet private key (0x...): ", (privateKey) => {
  try {
    // Validate private key format
    if (!privateKey.startsWith("0x") || privateKey.length < 60) {
      console.error("\n❌ Invalid private key format. Should start with 0x and be at least 60 characters.");
      rl.close();
      process.exit(1);
    }

    // Encrypt the private key
    console.log("\n🔒 Encrypting private key...");
    const encryptedKey = encryptPrivateKey(privateKey);

    console.log("\n✅ Private key encrypted successfully!\n");
    console.log("📋 Add this to your .env file:\n");
    console.log("ENCRYPTED_STARKNET_HOUSE_WALLET_KEY=" + encryptedKey);
    console.log("\n⚠️  IMPORTANT: Keep this encrypted key safe and never commit it to Git!");
    console.log("⚠️  Also add your wallet address to .env:\n");
    console.log("STARKNET_HOUSE_WALLET_ADDRESS=0x...\n");

    rl.close();
  } catch (error) {
    console.error("\n❌ Encryption failed:", error);
    rl.close();
    process.exit(1);
  }
});
