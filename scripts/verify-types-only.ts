/**
 * Type-only verification (no database connection needed)
 * Run with: npx tsc --noEmit scripts/verify-types-only.ts
 */

import {
  User,
  Wallet,
  WalletTransaction,
  PrismaClient,
} from "@/lib/generated/prisma-client";

// This will fail at compile time if types don't exist
const userExample: User = {
  id: "test",
  farcaster_id: "12345",
  farcaster_username: "testuser",
  farcaster_pfp: null,
  wallet_address: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const walletExample: Wallet = {
  userId: "test",
  address: "0x1234567890123456789012345678901234567890",
  encryptedPrivateKey: "encrypted",
  createdAt: BigInt(Date.now()),
  balance: "0",
  lastUsed: null,
  createdAtTimestamp: new Date(),
  updatedAt: new Date(),
};

const txExample: WalletTransaction = {
  id: 1,
  userId: "test",
  txHash: "0x123",
  txType: "bet",
  amount: "1000000",
  status: "confirmed",
  blockNumber: null,
  gasUsed: null,
  createdAt: new Date(),
  confirmedAt: null,
};

const prisma = new PrismaClient();

// These should all be defined
const _user = prisma.user;
const _wallet = prisma.wallet;
const _tx = prisma.walletTransaction;

console.log("✅ All Prisma types are correctly defined!");
console.log("✅ User type:", Object.keys(userExample));
console.log("✅ Wallet type:", Object.keys(walletExample));
console.log("✅ WalletTransaction type:", Object.keys(txExample));
