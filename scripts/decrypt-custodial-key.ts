import { config } from "dotenv";
import { prisma } from "@/lib/db/prisma";
import { decryptPrivateKey } from "@/lib/utils/encryption";

config(); // Load environment variables

async function decryptCustodialWalletKey() {
  try {
    console.log("🔍 Fetching custodial wallet from database...\n");

    // Fetch the first custodial wallet with encrypted key
    const custodialWallet = await prisma.custodialWallet.findFirst({
      where: {
        wallet: {
          isNot: null,
        },
      },
      include: {
        wallet: true,
      },
    });

    if (!custodialWallet || !custodialWallet.wallet) {
      console.error("❌ No custodial wallet found in database");
      process.exit(1);
    }

    console.log("✅ Custodial wallet found:");
    console.log("   Address:", custodialWallet.address);
    console.log("   ID:", custodialWallet.id);
    console.log("   Balance:", custodialWallet.wallet.balance, "wei");
    console.log("   Locked Balance:", custodialWallet.wallet.lockedBalance, "wei");
    console.log("");

    // Decrypt the private key
    console.log("🔓 Decrypting private key...\n");
    const privateKey = decryptPrivateKey(
      custodialWallet.wallet.encryptedPrivateKey
    );

    console.log("✅ Decryption successful!\n");
    console.log("═══════════════════════════════════════════════════════");
    console.log("📋 CUSTODIAL WALLET DETAILS:");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("Address:");
    console.log(custodialWallet.address);
    console.log("");
    console.log("Private Key:");
    console.log("***REDACTED FOR SECURITY*** (returned in function - DO NOT LOG)");
    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("🚨 CRITICAL SECURITY WARNING:");
    console.log("   - Private key has been decrypted (NOT displayed for security)");
    console.log("   - NEVER log private keys to console");
    console.log("   - NEVER share private keys");
    console.log("   - NEVER commit private keys to version control");
    console.log("   - Use programmatically, not manually");
    console.log("");
    console.log("🔗 Next Steps:");
    console.log("   1. Use this function programmatically to deploy wallets");
    console.log("   2. The wallet contract must be deployed before withdrawals work");
    console.log("   3. After deployment, withdrawals will work from this address");
    console.log("");

    await prisma.$disconnect();

    // Return the private key securely (don't log it)
    return privateKey;
  } catch (error) {
    console.error("❌ Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

decryptCustodialWalletKey();
