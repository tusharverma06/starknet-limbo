/**
 * Test Security Setup
 *
 * This script verifies your security setup is working correctly
 *
 * Run: npx tsx scripts/test-security-setup.ts
 */

// Load environment variables from .env, .env.local, etc.
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Try to load environment files in order of priority
const envFiles = [".env.local", ".env"];
let loadedEnvFile: string | null = null;
for (const file of envFiles) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    config({ path });
    loadedEnvFile = file;
    break;
  }
}

import { testEncryption } from "../lib/utils/encryption";
import { isValidApiKeyFormat } from "../lib/security/apiAuth";
import {
  getHouseWalletAddress,
  getHouseWalletBalance,
} from "../lib/security/houseWallet";

async function testSecuritySetup() {
  console.log("=".repeat(60));
  console.log("🧪 Testing Security Setup");
  console.log("=".repeat(60));

  if (loadedEnvFile) {
    console.log(`📄 Loaded environment from ${loadedEnvFile}`);
  } else {
    console.log("⚠️  No .env or .env.local file found");
  }
  console.log();

  let passed = 0;
  let failed = 0;

  // Test 1: Encryption Secret
  console.log("Test 1: Wallet Encryption Secret");
  console.log("-".repeat(60));
  if (process.env.WALLET_ENCRYPTION_SECRET) {
    console.log("✅ WALLET_ENCRYPTION_SECRET is set");
    passed++;
  } else {
    console.log("❌ WALLET_ENCRYPTION_SECRET is missing");
    failed++;
  }
  console.log();

  // Test 2: Encryption/Decryption
  console.log("Test 2: Encryption/Decryption");
  console.log("-".repeat(60));
  try {
    const result = testEncryption();
    if (result) {
      console.log("✅ Encryption/decryption working correctly");
      passed++;
    } else {
      console.log("❌ Encryption/decryption failed");
      failed++;
    }
  } catch (error) {
    console.log("❌ Encryption test error:", error);
    failed++;
  }
  console.log();

  // Test 3: House Wallet Key
  console.log("Test 3: Encrypted House Wallet Key");
  console.log("-".repeat(60));
  if (process.env.ENCRYPTED_HOUSE_WALLET_KEY) {
    console.log("✅ ENCRYPTED_HOUSE_WALLET_KEY is set");
    try {
      const address = getHouseWalletAddress();
      console.log("✅ House wallet address:", address);
      passed++;
    } catch (error) {
      console.log("❌ Failed to decrypt house wallet key");
      console.log(
        "   Error:",
        error instanceof Error ? error.message : "Unknown error"
      );
      failed++;
    }
  } else {
    console.log("❌ ENCRYPTED_HOUSE_WALLET_KEY is missing");
    console.log("   Run: pnpm security:setup");
    failed++;
  }
  console.log();

  // Test 4: House Wallet Balance
  console.log("Test 4: House Wallet Balance");
  console.log("-".repeat(60));
  if (process.env.ENCRYPTED_HOUSE_WALLET_KEY) {
    try {
      const balance = await getHouseWalletBalance();
      console.log("✅ Balance check successful");
      console.log(
        `   Balance: ${balance.toString()} wei (${Number(balance) / 1e18} ETH)`
      );

      if (balance === BigInt(0)) {
        console.log(
          "⚠️  Warning: House wallet has 0 balance - fund it before processing payouts"
        );
      }
      passed++;
    } catch (error) {
      console.log("❌ Failed to get house wallet balance");
      console.log(
        "   Error:",
        error instanceof Error ? error.message : "Unknown error"
      );
      failed++;
    }
  } else {
    console.log("⏭️  Skipping (no house wallet configured)");
  }
  console.log();

  // Test 5: Payout API Key
  console.log("Test 5: Payout API Key");
  console.log("-".repeat(60));
  if (process.env.PAYOUT_API_KEY) {
    const key = process.env.PAYOUT_API_KEY;
    if (isValidApiKeyFormat(key)) {
      console.log("✅ PAYOUT_API_KEY is set and valid format");
      console.log(
        `   Key: ${key.substring(0, 8)}...${key.substring(key.length - 8)}`
      );
      passed++;
    } else {
      console.log("❌ PAYOUT_API_KEY has invalid format");
      console.log("   Expected: 64 hex characters");
      failed++;
    }
  } else {
    console.log("❌ PAYOUT_API_KEY is missing");
    console.log("   Run: pnpm security:setup");
    failed++;
  }
  console.log();

  // Test 6: Worker API Key
  console.log("Test 6: Worker API Key");
  console.log("-".repeat(60));
  if (process.env.WORKER_API_KEY) {
    const key = process.env.WORKER_API_KEY;
    if (isValidApiKeyFormat(key)) {
      console.log("✅ WORKER_API_KEY is set and valid format");
      console.log(
        `   Key: ${key.substring(0, 8)}...${key.substring(key.length - 8)}`
      );
      passed++;
    } else {
      console.log("❌ WORKER_API_KEY has invalid format");
      console.log("   Expected: 64 hex characters");
      failed++;
    }
  } else {
    console.log("❌ WORKER_API_KEY is missing");
    console.log("   Run: pnpm security:setup");
    failed++;
  }
  console.log();

  // Test 7: RPC URL
  console.log("Test 7: RPC Configuration");
  console.log("-".repeat(60));
  if (process.env.NEXT_PUBLIC_RPC_URL) {
    console.log("✅ NEXT_PUBLIC_RPC_URL is set");
    passed++;
  } else {
    console.log("⚠️  NEXT_PUBLIC_RPC_URL is missing (may use default)");
  }
  console.log();

  // Summary
  console.log("=".repeat(60));
  console.log("📊 Test Summary");
  console.log("=".repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log();

  if (failed === 0) {
    console.log("🎉 All tests passed! Your security setup is ready.");
    console.log();
    console.log("Next steps:");
    console.log("1. Ensure house wallet is funded");
    console.log("2. Test payout endpoints with API keys");
    console.log("3. Set up monitoring and alerts");
  } else {
    console.log("⚠️  Some tests failed. Please review the errors above.");
    console.log();
    console.log("Common fixes:");
    console.log("1. Run: pnpm security:setup");
    console.log("2. Check .env.local has all required variables");
    console.log("3. Restart your dev server after adding env vars");
  }
  console.log("=".repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testSecuritySetup().catch((error) => {
  console.error("Test error:", error);
  process.exit(1);
});
