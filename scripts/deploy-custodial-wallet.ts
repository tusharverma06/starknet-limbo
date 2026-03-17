import { config } from "dotenv";
import { prisma } from "@/lib/db/prisma";
import { decryptPrivateKey } from "@/lib/utils/encryption";
import { Account, ec, CallData, hash } from "starknet";
import {
  getStarknetProvider,
  getStarknetBalance,
} from "@/lib/starknet/provider";
import * as readline from "readline";

config(); // Load environment variables

/**
 * Deploy a Starknet account contract for a custodial wallet
 *
 * IMPORTANT: The account address must be pre-funded with ETH before deployment
 * to pay for the deployment transaction fees.
 */
async function deployCustodialWallet() {
  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  STARKNET CUSTODIAL WALLET DEPLOYMENT");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("🔍 Fetching custodial wallet from database...\n");

    // Fetch the first custodial wallet
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
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log("✅ Custodial wallet found:");
    console.log("   Address:", custodialWallet.address);
    console.log("   ID:", custodialWallet.id);
    console.log("   DB Balance:", custodialWallet.wallet.balance, "wei");
    console.log("");

    // Setup Starknet provider
    const provider = getStarknetProvider();
    const network = process.env.NEXT_PUBLIC_STARKNET_NETWORK || "mainnet";

    console.log(`🌐 Network: ${network}`);
    console.log("");

    // Check if wallet is already deployed
    console.log("🔍 Checking if wallet is already deployed...");
    let isAlreadyDeployed = false;
    try {
      await provider.getClassAt(custodialWallet.address);
      isAlreadyDeployed = true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Contract not found")
      ) {
        isAlreadyDeployed = false;
      } else {
        throw error;
      }
    }

    if (isAlreadyDeployed) {
      console.log("✅ Wallet is already deployed!");
      console.log("");
      console.log(`🔗 View on Starkscan:`);
      if (network === "mainnet") {
        console.log(
          `   https://starkscan.co/contract/${custodialWallet.address}`,
        );
      } else {
        console.log(
          `   https://sepolia.starkscan.co/contract/${custodialWallet.address}`,
        );
      }
      console.log("");
      console.log("No action needed. Withdrawals should work.");
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log("⚠️  Wallet is NOT deployed yet");
    console.log("");

    // Check if address is funded
    console.log("💰 Checking on-chain balance...");
    const balance = await getStarknetBalance(custodialWallet.address);
    const balanceInEth = Number(balance) / 1e18;

    console.log(`   Balance: ${balanceInEth.toFixed(6)} ETH (${balance} wei)`);
    console.log("");

    if (balance === BigInt(0)) {
      console.error("❌ ERROR: Account address has no ETH balance!");
      console.error("");
      console.error(
        "⚠️  You must fund this address with ETH before deploying:",
      );
      console.error(`   ${custodialWallet.address}`);
      console.error("");
      console.error("💡 Send at least 0.001 ETH to cover deployment fees");
      console.error("");
      console.error("📝 Steps:");
      console.error("   1. Send ETH to the address above");
      console.error("   2. Wait for confirmation");
      console.error("   3. Run this script again");
      console.error("");
      await prisma.$disconnect();
      process.exit(1);
    }

    if (balanceInEth < 0.0005) {
      console.warn("⚠️  Warning: Balance is low. Deployment might fail.");
      console.warn("   Current: " + balanceInEth.toFixed(6) + " ETH");
      console.warn("   Recommended: At least 0.001 ETH");
      console.warn("");
    }

    // Decrypt the private key
    console.log("🔓 Decrypting private key...");
    const privateKey = decryptPrivateKey(
      custodialWallet.wallet.encryptedPrivateKey,
    );
    console.log("✅ Private key decrypted");
    console.log("");

    // Generate public key from private key
    const publicKey = ec.starkCurve.getStarkKey(privateKey);

    console.log("🔑 Public Key:", publicKey);
    console.log("");

    // OpenZeppelin Account Contract Class Hash (Cairo 1)
    const OZ_ACCOUNT_CLASS_HASH =
      "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";

    console.log("📝 Using OpenZeppelin Account Contract");
    console.log("   Class Hash:", OZ_ACCOUNT_CLASS_HASH);
    console.log("");

    // Calculate account address
    const constructorCalldata = CallData.compile({ publicKey });
    const addressSalt = publicKey;

    const accountAddress = hash.calculateContractAddressFromHash(
      addressSalt,
      OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0,
    );

    console.log("🔢 Address Verification:");
    console.log("   Calculated:", accountAddress);
    console.log("   Expected:  ", custodialWallet.address);
    console.log("");

    if (
      accountAddress.toLowerCase() !== custodialWallet.address.toLowerCase()
    ) {
      console.error("❌ ERROR: Address mismatch!");
      console.error("");
      console.error(
        "The calculated address doesn't match the database address.",
      );
      console.error(
        "This means the wallet was created with different parameters.",
      );
      console.error("");
      console.error("Calculated:", accountAddress);
      console.error("Database:  ", custodialWallet.address);
      console.error("");
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log("✅ Address verification passed!");
    console.log("");

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question(
        "🚀 Ready to deploy! This will cost gas fees. Continue? (yes/no): ",
        resolve,
      );
    });

    rl.close();

    if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
      console.log("\n❌ Deployment cancelled by user");
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log("");
    console.log("🚀 Deploying account contract to Starknet...");
    console.log("   This will take 30-60 seconds...");
    console.log("");

    // Use the deployStarknetAccount function with paymaster support
    const { deployStarknetAccount } = await import("@/lib/starknet/deployWallet");

    const { txHash: deployTxHash, address: deployedAddress } = await deployStarknetAccount(
      privateKey,
      custodialWallet.address,
      true // usePaymaster = true
    );

    console.log("📤 Deployment transaction sent!");
    console.log("   TX Hash:", deployTxHash);
    console.log("");

    if (network === "mainnet") {
      console.log(`   🔗 Track: https://starkscan.co/tx/${deployTxHash}`);
    } else {
      console.log(
        `   🔗 Track: https://sepolia.starkscan.co/tx/${deployTxHash}`,
      );
    }
    console.log("");

    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ WALLET DEPLOYED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("📋 Deployment Details:");
    console.log("   Address:", custodialWallet.address);
    console.log("   Transaction:", deployTxHash);
    console.log("   Network:", network);
    console.log("");
    console.log("🔗 View on Starkscan:");
    if (network === "mainnet") {
      console.log(
        `   https://starkscan.co/contract/${custodialWallet.address}`,
      );
    } else {
      console.log(
        `   https://sepolia.starkscan.co/contract/${custodialWallet.address}`,
      );
    }
    console.log("");
    console.log("✨ Next Steps:");
    console.log("   • Your wallet is now deployed and ready");
    console.log("   • Withdrawals will work from this wallet");
    console.log("   • You can send/receive transactions");
    console.log("");
    console.log("🎉 Done!");
    console.log("");

    await prisma.$disconnect();
  } catch (error) {
    console.error("");
    console.error("═══════════════════════════════════════════════════════");
    console.error("❌ DEPLOYMENT ERROR");
    console.error("═══════════════════════════════════════════════════════");
    console.error("");

    if (error instanceof Error) {
      console.error("Error Message:", error.message);

      if (error.message.includes("Insufficient balance")) {
        console.error("");
        console.error("💡 Solution: Add more ETH to your wallet for gas fees");
      } else if (error.message.includes("Contract not found")) {
        console.error("");
        console.error(
          "💡 This might be a network issue. Try again in a moment.",
        );
      }
    } else {
      console.error("Unknown error:", error);
    }

    console.error("");
    await prisma.$disconnect();
    process.exit(1);
  }
}

deployCustodialWallet();
