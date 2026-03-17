import { prisma } from "./prisma";
import { encryptPrivateKey } from "@/lib/utils/encryption";
import { ec } from "starknet";

/**
 * Starknet Wallet data structure (matches Prisma model)
 */
export interface StarknetWalletData {
  userId: string; // References User.id (must create User first via getOrCreateUser)
  address: string; // Starknet address (0x... 64-66 chars)
  encryptedPrivateKey: string; // Encrypted private key
  createdAt: number; // Timestamp
  balance?: string; // Optional cached balance
  lockedBalance?: string; // Locked balance (pending bets)
  lastUsed?: number; // Last transaction timestamp
}

/**
 * Prisma-based Database for Starknet Wallet Management
 */
class StarknetWalletDatabase {
  /**
   * Initialize the database (run migrations)
   */
  async init(): Promise<void> {
    try {
      // Test connection
      await prisma.$connect();
      console.log("✅ Prisma connected to database (Starknet wallets)");

      // Run migrations if needed
      // Note: In production, run `prisma migrate deploy` instead
      console.log("✅ Starknet wallet database ready");
    } catch (error) {
      console.error("❌ Failed to initialize Starknet wallet database:", error);
      throw new Error("Starknet wallet database initialization failed");
    }
  }

  /**
   * Create a new Starknet wallet with encrypted keys
   * @param custodialWalletId - Custodial wallet ID to link to
   * @param address - Starknet wallet address
   * @param encryptedPrivateKey - AES-256-GCM encrypted private key
   */
  async createWallet(
    custodialWalletId: string,
    address: string,
    encryptedPrivateKey: string,
  ): Promise<StarknetWalletData> {
    try {
      const wallet = await prisma.wallet.create({
        data: {
          custodialWalletId,
          address,
          encryptedPrivateKey,
          createdAt: BigInt(Date.now()),
          balance: "0",
        },
      });

      return {
        userId: wallet.custodialWalletId, // For backward compatibility
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
        throw new Error(
          "Starknet wallet already exists for this custodial wallet",
        );
      }
      console.error("Failed to create Starknet wallet:", error);
      throw new Error("Failed to create Starknet wallet");
    }
  }

  /**
   * Create a new custodial Starknet wallet with auto-generated keys
   * This creates a CustodialWallet record and its associated Wallet with encrypted keys
   *
   * Note: This generates the address deterministically without deploying the account.
   *
   * @param network - Network to use ("mainnet" or "sepolia")
   * @returns StarknetWalletData including the custodial wallet address
   */
  async createCustodialWallet(
    network: "mainnet" | "sepolia" = "mainnet",
  ): Promise<StarknetWalletData & { custodialWalletId: string }> {
    try {
      // Generate new random private key using Starknet.js
      console.log("🔐 Generating new Starknet custodial wallet...");
      const privateKeyBytes = ec.starkCurve.utils.randomPrivateKey();
      const privateKey = "0x" + Buffer.from(privateKeyBytes).toString("hex");
      console.log("✅ Private key generated");

      // Compute public key from private key
      console.log("🔑 Computing public key and address...");
      const publicKey = ec.starkCurve.getStarkKey(privateKey);

      // Use standard OpenZeppelin account class hash for address computation
      // This is the most common account implementation on Starknet
      const OZ_ACCOUNT_CLASS_HASH =
        "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";

      // Import Account for address computation
      const { hash, CallData } = await import("starknet");

      // Compute the account address (deterministic, no deployment needed yet)
      const accountAddress = hash.calculateContractAddressFromHash(
        publicKey,
        OZ_ACCOUNT_CLASS_HASH,
        CallData.compile({ publicKey }),
        0,
      );

      console.log("✅ Wallet address computed:", accountAddress);

      // Encrypt the private key
      console.log("🔒 Encrypting private key...");
      const encryptedPrivateKey = encryptPrivateKey(privateKey);
      console.log("✅ Private key encrypted");

      // Create CustodialWallet record first
      console.log("💾 Creating custodial wallet record...");
      const custodialWallet = await prisma.custodialWallet.create({
        data: {
          address: accountAddress,
        },
      });
      console.log("✅ Custodial wallet created:", custodialWallet.id);

      // Store encrypted wallet keys
      console.log("💾 Storing encrypted wallet keys...");
      await prisma.wallet.create({
        data: {
          custodialWalletId: custodialWallet.id,
          address: accountAddress,
          encryptedPrivateKey,
          createdAt: BigInt(Date.now()),
          balance: "0",
        },
      });
      console.log("✅ Wallet keys stored");
      console.log("ℹ️  Wallet will be deployed automatically on first withdrawal");
      console.log("");

      return {
        userId: custodialWallet.id, // For backward compatibility
        custodialWalletId: custodialWallet.id,
        address: accountAddress,
        encryptedPrivateKey,
        createdAt: Date.now(),
        balance: "0",
        lockedBalance: "0",
      };
    } catch (error) {
      console.error("Failed to create Starknet custodial wallet:", error);
      throw error;
    }
  }

  /**
   * Get wallet by custodial wallet ID
   */
  async getWallet(
    custodialWalletId: string,
  ): Promise<StarknetWalletData | null> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { custodialWalletId },
      });

      if (!wallet) {
        return null;
      }

      return {
        userId: wallet.custodialWalletId, // For backward compatibility
        address: wallet.address,
        encryptedPrivateKey: wallet.encryptedPrivateKey,
        createdAt: Number(wallet.createdAt),
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
      };
    } catch (error) {
      console.error("Failed to get Starknet wallet:", error);
      return null;
    }
  }

  /**
   * Get wallet by address
   */
  async getWalletByAddress(
    address: string,
  ): Promise<StarknetWalletData | null> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { address },
      });

      if (!wallet) {
        return null;
      }

      return {
        userId: wallet.custodialWalletId, // For backward compatibility
        address: wallet.address,
        encryptedPrivateKey: wallet.encryptedPrivateKey,
        createdAt: Number(wallet.createdAt),
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
      };
    } catch (error) {
      console.error("Failed to get Starknet wallet by address:", error);
      return null;
    }
  }

  /**
   * Update wallet data
   */
  async updateWallet(
    custodialWalletId: string,
    updates: Partial<StarknetWalletData>,
  ): Promise<StarknetWalletData> {
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
        where: { custodialWalletId },
        data: updateData,
      });

      return {
        userId: wallet.custodialWalletId, // For backward compatibility
        address: wallet.address,
        encryptedPrivateKey: wallet.encryptedPrivateKey,
        createdAt: Number(wallet.createdAt),
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
      };
    } catch (error) {
      if ((error as { code?: string }).code === "P2025") {
        throw new Error("Starknet wallet not found");
      }
      console.error("Failed to update Starknet wallet:", error);
      throw new Error("Failed to update Starknet wallet");
    }
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(custodialWalletId: string): Promise<void> {
    await this.updateWallet(custodialWalletId, { lastUsed: Date.now() });
  }

  /**
   * Update cached balance
   */
  async updateBalance(
    custodialWalletId: string,
    balance: string,
  ): Promise<void> {
    await this.updateWallet(custodialWalletId, { balance });
  }

  /**
   * Delete wallet (use with caution!)
   */
  async deleteWallet(custodialWalletId: string): Promise<void> {
    try {
      await prisma.wallet.delete({
        where: { custodialWalletId },
      });
      console.log(
        `🗑️  Starknet wallet deleted for custodial wallet: ${custodialWalletId}`,
      );
    } catch (error) {
      if ((error as { code?: string }).code === "P2025") {
        throw new Error("Starknet wallet not found");
      }
      console.error("Failed to delete Starknet wallet:", error);
      throw new Error("Failed to delete Starknet wallet");
    }
  }

  /**
   * Get all Starknet wallets (admin only)
   */
  async getAllWallets(): Promise<StarknetWalletData[]> {
    try {
      const wallets = await prisma.wallet.findMany({
        where: {
          // Filter for Starknet addresses (>42 chars)
          address: {
            // This will get addresses longer than 42 chars
            not: {
              endsWith: "", // Dummy condition, we'll filter in code
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Filter Starknet addresses (>42 chars)
      return wallets
        .filter((wallet) => wallet.address.length > 42)
        .map((wallet) => ({
          userId: wallet.custodialWalletId, // For backward compatibility
          address: wallet.address,
          encryptedPrivateKey: wallet.encryptedPrivateKey,
          createdAt: Number(wallet.createdAt),
          balance: wallet.balance,
          lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
        }));
    } catch (error) {
      console.error("Failed to get all Starknet wallets:", error);
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
      // Get all wallets first
      const allWallets = await prisma.wallet.findMany({
        select: {
          address: true,
          balance: true,
          lastUsed: true,
        },
      });

      // Filter for Starknet addresses (>42 chars)
      const starknetWallets = allWallets.filter((w) => w.address.length > 42);

      // Total wallets
      const totalWallets = starknetWallets.length;

      // Active wallets (used in last 30 days)
      const thirtyDaysAgo = BigInt(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const activeWallets = starknetWallets.filter(
        (w) => w.lastUsed && w.lastUsed > thirtyDaysAgo,
      ).length;

      // Total balance (sum of all wallet balances)
      const totalBalance = starknetWallets
        .reduce((sum, wallet) => {
          return sum + BigInt(wallet.balance || "0");
        }, BigInt(0))
        .toString();

      return { totalWallets, activeWallets, totalBalance };
    } catch (error) {
      console.error("Failed to get Starknet wallet stats:", error);
      return { totalWallets: 0, activeWallets: 0, totalBalance: "0" };
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await prisma.$disconnect();
    console.log("🔒 Starknet wallet database connection closed");
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("Starknet wallet database health check failed:", error);
      return false;
    }
  }

  /**
   * Get recent Starknet wallets
   */
  async getRecentWallets(limit: number = 10): Promise<StarknetWalletData[]> {
    try {
      const wallets = await prisma.wallet.findMany({
        orderBy: { createdAt: "desc" },
        take: limit * 2, // Get more to filter
        select: {
          custodialWalletId: true,
          address: true,
          createdAt: true,
          balance: true,
          lastUsed: true,
          // Don't select encryptedPrivateKey for security
        },
      });

      // Filter for Starknet addresses (>42 chars) and limit
      return wallets
        .filter((wallet) => wallet.address.length > 42)
        .slice(0, limit)
        .map((wallet) => ({
          userId: wallet.custodialWalletId, // For backward compatibility
          address: wallet.address,
          encryptedPrivateKey: "", // Not returned for security
          createdAt: Number(wallet.createdAt),
          balance: wallet.balance,
          lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
        }));
    } catch (error) {
      console.error("Failed to get recent Starknet wallets:", error);
      return [];
    }
  }

  /**
   * Search Starknet wallets by address (partial match)
   */
  async searchWalletsByAddress(
    searchTerm: string,
  ): Promise<StarknetWalletData[]> {
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
          custodialWalletId: true,
          address: true,
          createdAt: true,
          balance: true,
          lastUsed: true,
          // Don't select encryptedPrivateKey for security
        },
      });

      // Filter for Starknet addresses (>42 chars)
      return wallets
        .filter((wallet) => wallet.address.length > 42)
        .map((wallet) => ({
          userId: wallet.custodialWalletId, // For backward compatibility
          address: wallet.address,
          encryptedPrivateKey: "", // Not returned for security
          createdAt: Number(wallet.createdAt),
          balance: wallet.balance,
          lastUsed: wallet.lastUsed ? Number(wallet.lastUsed) : undefined,
        }));
    } catch (error) {
      console.error("Failed to search Starknet wallets:", error);
      return [];
    }
  }
}

// Singleton instance
export const starknetWalletDb = new StarknetWalletDatabase();

// Initialize database on module load
starknetWalletDb.init().catch((error) => {
  console.error("Failed to initialize Starknet wallet database:", error);
});
