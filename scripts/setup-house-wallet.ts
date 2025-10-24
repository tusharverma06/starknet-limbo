/**
 * Setup House Wallet Script
 *
 * This script helps you:
 * 1. Generate a new house wallet OR encrypt an existing one
 * 2. Generate secure API keys for payout endpoints
 * 3. Output the values to add to your .env or .env.local file
 *
 * Run: npx tsx scripts/setup-house-wallet.ts
 */

// Load environment variables from .env, .env.local, etc.
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Try to load environment files in order of priority
const envFiles = [".env.local", ".env"];
for (const file of envFiles) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    config({ path });
    console.log(`📄 Loaded environment from ${file}`);
    break;
  }
}

import { Wallet } from "ethers";
import { encryptPrivateKey } from "../lib/utils/encryption";
import { generateApiKey } from "../lib/security/apiAuth";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log("=".repeat(60));
  console.log("🏦 House Wallet & API Key Setup");
  console.log("=".repeat(60));
  console.log();

  // Check if encryption secret exists
  if (!process.env.WALLET_ENCRYPTION_SECRET) {
    console.error(
      "❌ Error: WALLET_ENCRYPTION_SECRET not found in environment"
    );
    console.log(
      "\n💡 Please add WALLET_ENCRYPTION_SECRET to your .env or .env.local file first:"
    );
    console.log(`   WALLET_ENCRYPTION_SECRET="${generateApiKey()}"`);
    console.log();
    console.log("💡 You can create either .env or .env.local file");
    console.log();
    process.exit(1);
  }

  console.log("✅ WALLET_ENCRYPTION_SECRET found");
  console.log();

  // Step 1: House Wallet
  console.log("📝 Step 1: House Wallet Setup");
  console.log("-".repeat(60));

  const choice = await question(
    "Do you want to (1) Generate new wallet or (2) Encrypt existing private key? [1/2]: "
  );

  let privateKey: string;
  let wallet: Wallet;

  // Use existing private key
  console.log(
    "\n⚠️  WARNING: Your input will be visible. Make sure no one is watching."
  );
  privateKey = await question(
    "Enter your existing private key (with or without 0x): "
  );

  // Validate private key
  try {
    if (!privateKey.startsWith("0x")) {
      privateKey = "0x" + privateKey;
    }

    wallet = new Wallet(privateKey);
    console.log("\n✅ Valid private key");
    console.log("Address:", wallet.address);
  } catch (error) {
    console.error("\n❌ Invalid private key format");
    process.exit(1);
  }

  // Encrypt the private key
  console.log("\n🔐 Encrypting private key...");
  const encryptedKey = encryptPrivateKey(privateKey);
  console.log("✅ Private key encrypted successfully");

  // Step 2: Generate API Keys
  console.log("\n📝 Step 2: API Key Generation");
  console.log("-".repeat(60));

  const payoutApiKey = generateApiKey();
  const workerApiKey = generateApiKey();

  console.log("✅ API keys generated successfully");

  // Step 3: Output configuration
  console.log("\n" + "=".repeat(60));
  console.log("✅ Setup Complete! Add these to your .env or .env.local file:");
  console.log("=".repeat(60));
  console.log();
  console.log("# House Wallet Configuration");
  console.log(`ENCRYPTED_HOUSE_WALLET_KEY="${encryptedKey}"`);
  console.log();
  console.log("# API Keys for Protected Endpoints");
  console.log(`PAYOUT_API_KEY="${payoutApiKey}"`);
  console.log(`WORKER_API_KEY="${workerApiKey}"`);
  console.log();
  console.log("=".repeat(60));
  console.log("⚠️  SECURITY NOTES:");
  console.log("=".repeat(60));
  console.log("1. Never commit these values to git");
  console.log("2. Never log or expose these values in your application");
  console.log(
    "3. Store WALLET_ENCRYPTION_SECRET securely (different from these)"
  );
  console.log("4. Fund the house wallet address:", wallet.address);
  console.log("5. Use PAYOUT_API_KEY in x-api-key header for payout requests");
  console.log(
    "6. Keep a backup of the original private key in a secure location"
  );
  console.log("=".repeat(60));
  console.log();

  // Step 4: Test encryption
  console.log("🧪 Testing encryption...");
  try {
    const { decryptPrivateKey } = await import("../lib/utils/encryption");
    const decrypted = decryptPrivateKey(encryptedKey);
    if (decrypted === privateKey) {
      console.log("✅ Encryption test passed!");
    } else {
      console.error("❌ Encryption test failed!");
    }
  } catch (error) {
    console.error("❌ Encryption test error:", error);
  }

  rl.close();
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
