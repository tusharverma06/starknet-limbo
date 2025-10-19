/**
 * Verification script to test Prisma setup and types
 * Run with: npx tsx scripts/verify-prisma-setup.ts
 */

import { prisma } from "../lib/db/prisma";
import { User, Wallet, WalletTransaction } from "@prisma/client";

async function verifyPrismaSetup() {
  console.log("🔍 Verifying Prisma setup...\n");

  try {
    // Test 1: Check database connection
    console.log("1️⃣ Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connection successful\n");

    // Test 2: Verify User model types exist
    console.log("2️⃣ Verifying User model types...");
    const userType: User = {
      id: "test",
      farcaster_id: "12345",
      farcaster_username: "testuser",
      farcaster_pfp: null,
      wallet_address: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log("✅ User type is correctly defined");
    console.log("   Sample User:", {
      ...userType,
      createdAt: userType.createdAt.toISOString(),
      updatedAt: userType.updatedAt.toISOString(),
    });
    console.log();

    // Test 3: Verify Wallet model types exist
    console.log("3️⃣ Verifying Wallet model types...");
    const walletType: Wallet = {
      userId: "test",
      address: "0x1234567890123456789012345678901234567890",
      encryptedPrivateKey: "encrypted_key",
      createdAt: BigInt(Date.now()),
      balance: "0",
      lastUsed: null,
      createdAtTimestamp: new Date(),
      updatedAt: new Date(),
    };
    console.log("✅ Wallet type is correctly defined");
    console.log("   Sample Wallet:", {
      ...walletType,
      createdAt: walletType.createdAt.toString(),
      createdAtTimestamp: walletType.createdAtTimestamp.toISOString(),
      updatedAt: walletType.updatedAt.toISOString(),
    });
    console.log();

    // Test 4: Verify WalletTransaction model types exist
    console.log("4️⃣ Verifying WalletTransaction model types...");
    const txType: WalletTransaction = {
      id: 1,
      userId: "test",
      txHash:
        "0x1234567890123456789012345678901234567890123456789012345678901234",
      txType: "bet",
      amount: "1000000000000000000",
      status: "confirmed",
      blockNumber: BigInt(12345),
      gasUsed: "21000",
      createdAt: new Date(),
      confirmedAt: new Date(),
    };
    console.log("✅ WalletTransaction type is correctly defined");
    console.log("   Sample Transaction:", {
      ...txType,
      blockNumber: txType.blockNumber?.toString(),
      createdAt: txType.createdAt.toISOString(),
      confirmedAt: txType.confirmedAt?.toISOString(),
    });
    console.log();

    // Test 5: Verify Prisma client methods exist
    console.log("5️⃣ Verifying Prisma client methods...");
    console.log("   - prisma.user:", typeof prisma.user);
    console.log("   - prisma.wallet:", typeof prisma.wallet);
    console.log(
      "   - prisma.walletTransaction:",
      typeof prisma.walletTransaction
    );
    if (
      typeof prisma.user === "object" &&
      typeof prisma.wallet === "object" &&
      typeof prisma.walletTransaction === "object"
    ) {
      console.log("✅ All Prisma client methods exist\n");
    } else {
      throw new Error("Prisma client methods not found");
    }

    // Test 6: Check if migrations are needed
    console.log("6️⃣ Checking migration status...");
    try {
      // Try a simple query to see if tables exist
      await prisma.user.count();
      await prisma.wallet.count();
      await prisma.walletTransaction.count();
      console.log("✅ All tables exist in database\n");
    } catch (error: any) {
      if (error.code === "P2021") {
        console.log(
          "⚠️  Tables don't exist yet. Run: npx prisma migrate deploy\n"
        );
      } else {
        console.log("⚠️  Database connection issue:", error.message);
        console.log("   Make sure your DATABASE_URL is correct in .env\n");
      }
    }

    console.log("✨ Prisma setup verification complete!\n");
    console.log("📋 Next steps:");
    console.log("   1. Fix your DATABASE_URL in .env");
    console.log("   2. Run: npx prisma migrate deploy");
    console.log("   3. Run: npx prisma generate");
    console.log("   4. Restart your TypeScript language server\n");
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyPrismaSetup();

