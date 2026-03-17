import { config } from "dotenv";
import { prisma } from "@/lib/db/prisma";
import { decryptPrivateKey } from "@/lib/utils/encryption";
import { deployStarknetAccount } from "@/lib/starknet/deployWallet";
import { getStarknetProvider } from "@/lib/starknet/provider";

config();

/**
 * Test StarkZap deployment with AVNU Paymaster
 */
async function testStarkZapDeployment() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  STARKZAP PAYMASTER DEPLOYMENT TEST");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");

  try {
    // Check API key
    if (!process.env.AVNU_PAYMASTER_API_KEY) {
      console.error("❌ AVNU_PAYMASTER_API_KEY not found in .env");
      process.exit(1);
    }

    console.log("✅ AVNU API key found");
    console.log("");

    // Fetch custodial wallet
    console.log("🔍 Fetching custodial wallet from database...");
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
      console.error("❌ No custodial wallet found");
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log("✅ Found wallet:", custodialWallet.address);
    console.log("");

    // Check if already deployed
    const provider = getStarknetProvider();
    let isDeployed = false;
    try {
      await provider.getClassAt(custodialWallet.address);
      isDeployed = true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Contract not found")
      ) {
        isDeployed = false;
      }
    }

    if (isDeployed) {
      console.log("⚠️  Wallet already deployed, skipping test");
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log("✅ Wallet not deployed yet - perfect for testing!");
    console.log("");

    // Decrypt private key
    console.log("🔓 Decrypting private key...");
    const privateKey = decryptPrivateKey(
      custodialWallet.wallet.encryptedPrivateKey,
    );
    console.log("✅ Private key decrypted");
    console.log("");

    // Deploy with StarkZap + AVNU Paymaster
    console.log("🚀 Deploying with StarkZap + AVNU Paymaster...");
    console.log("   This will use SPONSORED fees (zero balance required)");
    console.log("");

    const { txHash, address } = await deployStarknetAccount(
      privateKey,
      custodialWallet.address,
      true, // usePaymaster = true
    );

    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ DEPLOYMENT SUCCESSFUL!");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("📋 Details:");
    console.log("   Address:", address);
    console.log("   TX Hash:", txHash);
    console.log("");

    const network =
      process.env.NEXT_PUBLIC_STARKNET_NETWORK || "mainnet";
    if (network === "mainnet") {
      console.log(`   🔗 View: https://starkscan.co/tx/${txHash}`);
    } else {
      console.log(`   🔗 View: https://sepolia.starkscan.co/tx/${txHash}`);
    }
    console.log("");
    console.log("✨ Wallet deployed with ZERO balance using paymaster!");
    console.log("");

    await prisma.$disconnect();
  } catch (error) {
    console.error("");
    console.error("═══════════════════════════════════════════════════════");
    console.error("❌ TEST FAILED");
    console.error("═══════════════════════════════════════════════════════");
    console.error("");

    if (error instanceof Error) {
      console.error("Error:", error.message);
      console.error("");
      console.error("Stack:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }

    console.error("");
    await prisma.$disconnect();
    process.exit(1);
  }
}

testStarkZapDeployment();
