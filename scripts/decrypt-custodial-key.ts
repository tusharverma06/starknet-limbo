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
    console.log(privateKey);
    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("⚠️  SECURITY WARNING:");
    console.log("   - Keep this private key secure");
    console.log("   - Never share it with anyone");
    console.log("   - Never commit it to version control");
    console.log("   - Use it only for wallet deployment");
    console.log("");
    console.log("🔗 Next Steps:");
    console.log("   1. Use this private key to deploy the wallet contract on Starknet");
    console.log("   2. The wallet contract must be deployed before withdrawals work");
    console.log("   3. After deployment, withdrawals will work from this address");
    console.log("");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

decryptCustodialWalletKey();
