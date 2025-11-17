import { prisma } from "./prisma";
import { Wallet } from "ethers";
import { encryptPrivateKey } from "@/lib/utils/encryption";

/**
 * Wallet data structure (matches Prisma model)
 */
export interface WalletData {
  userId: string; // References User.id (must create User first via getOrCreateUser)
  address: string; // Ethereum address (0x...)
  encryptedPrivateKey: string; // Encrypted private key
  createdAt: number; // Timestamp
  balance?: string; // Optional cached balance
  lockedBalance?: string; // Locked balance (pending bets)
  lastUsed?: number; // Last transaction timestamp
}

/**
 * Prisma-based Database for Wallet Management
 */
class WalletDatabase {
  /**
   * Initialize the database (run migrations)
   */
  async init(): Promise<void> {
    try {
      // Test connection
      await prisma.$connect();
      console.log("✅ Prisma connected to database");

      // Run migrations if needed
      // Note: In production, run `prisma migrate deploy` instead
      console.log("✅ Database ready");
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);
      throw new Error("Database initialization failed");
    }
  }

  /**
   * Create a new wallet for a user
   * @param userId - Must be a valid User.id (create User first via getOrCreateUser)
   * @param address - Ethereum wallet address
   * @param encryptedPrivateKey - AES-256-GCM encrypted private key
   */
  async createWallet(
    userId: string,
    address: string,
    encryptedPrivateKey: string
  ): Promise<WalletData> {
    try {
      const wallet = await prisma.wallet.create({
        data: {
          userId,
          address,
          encryptedPrivateKey,
          createdAt: BigInt(Date.now()),
          balance: "0",
        },
      });

      return {
        userId: wallet.userId,
        address: wallet.address,
        encryptedPrivateKey: wallet.encryptedPrivateKey,
        createdAt: Number(wallet.createdAt),
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
      };
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        // Unique constraint violation
        throw new Error("Wallet already exists for this user");
      }
      console.error("Failed to create wallet:", error);
      throw new Error("Failed to create wallet");
    }
  }

  /**
   * Create a new custodial wallet with auto-generated keys
   * This is a convenience method that generates a wallet, encrypts the key, and stores it
   * @param userId - Must be a valid User.id (create User first via getOrCreateUser)
   */
  async createCustodialWallet(userId: string): Promise<WalletData> {
    try {
      // Check if wallet already exists
      const existing = await this.getWallet(userId);
      if (existing) {
        throw new Error("Wallet already exists for this user");
      }

      // Generate new random wallet
      console.log("🔐 Generating new custodial wallet...");
      const wallet = Wallet.createRandom();
      const address = wallet.address;
      const privateKey = wallet.privateKey;
      console.log("✅ Wallet generated:", address);

      // Encrypt the private key
      console.log("🔒 Encrypting private key...");
      const encryptedPrivateKey = encryptPrivateKey(privateKey);
      console.log("✅ Private key encrypted");

      // Store in database
      console.log("💾 Storing wallet in database for user ID:", userId);
      const walletData = await this.createWallet(
        userId,
        address,
        encryptedPrivateKey
      );

      // Update user with server wallet address
      await prisma.user.update({
        where: { id: userId },
        data: { server_wallet_address: address },
      });
      console.log("✅ Updated user with server wallet address");

      return walletData;
    } catch (error) {
      console.error("Failed to create custodial wallet:", error);
      throw error;
    }
  }

  /**
   * Get wallet for a user
   */
  async getWallet(userId: string): Promise<WalletData | null> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        return null;
      }

      return {
        userId: wallet.userId,
        address: wallet.address,
        encryptedPrivateKey: wallet.encryptedPrivateKey,
        createdAt: Number(wallet.createdAt),
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
      };
    } catch (error) {
      console.error("Failed to get wallet:", error);
      return null;
    }
  }

  /**
   * Get wallet by address
   */
  async getWalletByAddress(address: string): Promise<WalletData | null> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { address },
      });

      if (!wallet) {
        return null;
      }

      return {
        userId: wallet.userId,
        address: wallet.address,
        encryptedPrivateKey: wallet.encryptedPrivateKey,
        createdAt: Number(wallet.createdAt),
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
      };
    } catch (error) {
      console.error("Failed to get wallet by address:", error);
      return null;
    }
  }

  /**
   * Update wallet data
   */
  async updateWallet(
    userId: string,
    updates: Partial<WalletData>
  ): Promise<WalletData> {
    try {
      const updateData: {
        balance?: string;
        lastUsed?: bigint;
      } = {};

      if (updates.balance !== undefined) {
        updateData.balance = updates.balance;
      }

      if (updates.lastUsed !== undefined) {
        updateData.lastUsed = BigInt(updates.lastUsed);
      }

      const wallet = await prisma.wallet.update({
        where: { userId },
        data: updateData,
      });

      return {
        userId: wallet.userId,
        address: wallet.address,
        encryptedPrivateKey: wallet.encryptedPrivateKey,
        createdAt: Number(wallet.createdAt),
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
      };
    } catch (error) {
      if ((error as { code?: string }).code === "P2025") {
        throw new Error("Wallet not found");
      }
      console.error("Failed to update wallet:", error);
      throw new Error("Failed to update wallet");
    }
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(userId: string): Promise<void> {
    await this.updateWallet(userId, { lastUsed: Date.now() });
  }

  /**
   * Update cached balance
   */
  async updateBalance(userId: string, balance: string): Promise<void> {
    await this.updateWallet(userId, { balance });
  }

  /**
   * Delete wallet (use with caution!)
   */
  async deleteWallet(userId: string): Promise<void> {
    try {
      await prisma.wallet.delete({
        where: { userId },
      });
      console.log(`🗑️  Wallet deleted for user: ${userId}`);
    } catch (error) {
      if ((error as { code?: string }).code === "P2025") {
        throw new Error("Wallet not found");
      }
      console.error("Failed to delete wallet:", error);
      throw new Error("Failed to delete wallet");
    }
  }

  /**
   * Get all wallets (admin only)
   */
  async getAllWallets(): Promise<WalletData[]> {
    try {
      const wallets = await prisma.wallet.findMany({
        orderBy: { createdAt: "desc" },
      });

      return wallets.map((wallet) => ({
        userId: wallet.userId,
        address: wallet.address,
        encryptedPrivateKey: wallet.encryptedPrivateKey,
        createdAt: Number(wallet.createdAt),
        balance: wallet.balance,
        lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
      }));
    } catch (error) {
      console.error("Failed to get all wallets:", error);
      return [];
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalWallets: number;
    activeWallets: number;
    totalBalance: string;
  }> {
    try {
      // Total wallets
      const totalWallets = await prisma.wallet.count();

      // Active wallets (used in last 30 days)
      const thirtyDaysAgo = BigInt(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const activeWallets = await prisma.wallet.count({
        where: {
          lastUsed: {
            gt: thirtyDaysAgo,
          },
        },
      });

      // Total balance (sum of all wallet balances)
      // Since balance is stored as String, we need to fetch and sum manually
      const allWallets = await prisma.wallet.findMany({
        select: {
          balance: true,
        },
      });

      const totalBalance = allWallets
        .reduce((sum, wallet) => {
          return sum + BigInt(wallet.balance || "0");
        }, BigInt(0))
        .toString();

      return { totalWallets, activeWallets, totalBalance };
    } catch (error) {
      console.error("Failed to get stats:", error);
      return { totalWallets: 0, activeWallets: 0, totalBalance: "0" };
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await prisma.$disconnect();
    console.log("🔒 Database connection closed");
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }

  /**
   * Get recent wallets
   */
  async getRecentWallets(limit: number = 10): Promise<WalletData[]> {
    try {
      const wallets = await prisma.wallet.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          userId: true,
          address: true,
          createdAt: true,
          balance: true,
          lastUsed: true,
          // Don't select encryptedPrivateKey for security
        },
      });

      return wallets.map((wallet) => ({
        userId: wallet.userId,
        address: wallet.address,
        encryptedPrivateKey: "", // Not returned for security
        createdAt: Number(wallet.createdAt),
        balance: wallet.balance,
        lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
      }));
    } catch (error) {
      console.error("Failed to get recent wallets:", error);
      return [];
    }
  }

  /**
   * Search wallets by address (partial match)
   */
  async searchWalletsByAddress(searchTerm: string): Promise<WalletData[]> {
    try {
      const wallets = await prisma.wallet.findMany({
        where: {
          address: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50, // Limit results
        select: {
          userId: true,
          address: true,
          createdAt: true,
          balance: true,
          lastUsed: true,
          // Don't select encryptedPrivateKey for security
        },
      });

      return wallets.map((wallet) => ({
        userId: wallet.userId,
        address: wallet.address,
        encryptedPrivateKey: "", // Not returned for security
        createdAt: Number(wallet.createdAt),
        balance: wallet.balance,
        lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
      }));
    } catch (error) {
      console.error("Failed to search wallets:", error);
      return [];
    }
  }
}

// Singleton instance
export const walletDb = new WalletDatabase();

// Initialize database on module load
walletDb.init().catch((error) => {
  console.error("Failed to initialize wallet database:", error);
});
