import { config } from "dotenv";
import { prisma } from "@/lib/db/prisma";
import { decryptPrivateKey } from "@/lib/utils/encryption";
import { getStarknetProvider } from "@/lib/starknet/provider";
import { sendStrkFromStarknetHouseWallet } from "@/lib/starknet/houseWallet";
import { deployStarknetAccount, isAccountDeployed } from "@/lib/starknet/deployWallet";
import { SPONSORED_DEPLOYMENT_STRK } from "@/lib/constants";
import * as readline from "readline";

config(); // Load environment variables

/**
 * Bulk deploy all non-deployed custodial wallets with house sponsorship
 * Sends 3 STRK from house wallet to each, then deploys them
 */
async function bulkDeployWallets() {
  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  BULK CUSTODIAL WALLET DEPLOYMENT");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("🔍 Finding all custodial wallets in database...\n");

    // Fetch all custodial wallets with encrypted keys
    const allWallets = await prisma.custodialWallet.findMany({
      where: {
        wallet: {
          isNot: null,
        },
      },
      include: {
        wallet: true,
      },
    });

    if (!allWallets || allWallets.length === 0) {
      console.log("❌ No custodial wallets found in database");
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log(`✅ Found ${allWallets.length} custodial wallet(s)\n`);

    // Check deployment status for each wallet
    console.log("🔍 Checking deployment status...\n");

    const provider = getStarknetProvider();
    const walletStatuses: Array<{
      wallet: typeof allWallets[0];
      deployed: boolean;
    }> = [];

    for (const wallet of allWallets) {
      const deployed = await isAccountDeployed(wallet.address);
      walletStatuses.push({ wallet, deployed });

      const status = deployed ? "✅ Deployed" : "❌ Not deployed";
      console.log(`   ${wallet.address.slice(0, 10)}...${wallet.address.slice(-8)} - ${status}`);
    }

    console.log("");

    // Filter non-deployed wallets
    const nonDeployedWallets = walletStatuses.filter(ws => !ws.deployed);

    if (nonDeployedWallets.length === 0) {
      console.log("🎉 All wallets are already deployed!");
      console.log("");
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log("📊 Summary:");
    console.log(`   Total wallets: ${allWallets.length}`);
    console.log(`   Already deployed: ${walletStatuses.length - nonDeployedWallets.length}`);
    console.log(`   Need deployment: ${nonDeployedWallets.length}`);
    console.log("");

    // Calculate total cost
    const strkPerWallet = Number(SPONSORED_DEPLOYMENT_STRK) / 1e18;
    const totalStrk = strkPerWallet * nonDeployedWallets.length;
    const estimatedCostUsd = totalStrk * 0.04; // Assuming $0.04/STRK

    console.log("💰 Deployment Costs:");
    console.log(`   STRK per wallet: ${strkPerWallet} STRK`);
    console.log(`   Total STRK needed: ${totalStrk} STRK`);
    console.log(`   Estimated cost: ~$${estimatedCostUsd.toFixed(2)} USD (at $0.04/STRK)`);
    console.log("");

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question(
        `🚀 Deploy ${nonDeployedWallets.length} wallet(s) from house wallet? (yes/no): `,
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
    console.log("═══════════════════════════════════════════════════════");
    console.log("  STARTING BULK DEPLOYMENT");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");

    // Deploy each wallet
    let successCount = 0;
    let failCount = 0;
    const deploymentFunding = BigInt(SPONSORED_DEPLOYMENT_STRK);

    for (let i = 0; i < nonDeployedWallets.length; i++) {
      const { wallet } = nonDeployedWallets[i];
      const num = i + 1;
      const total = nonDeployedWallets.length;

      console.log(`\n[${num}/${total}] Processing wallet: ${wallet.address}`);
      console.log("─────────────────────────────────────────────────────");

      try {
        // Step 1: Decrypt private key
        console.log("🔓 Decrypting private key...");
        const privateKey = decryptPrivateKey(wallet.wallet!.encryptedPrivateKey);

        // Step 2: Send STRK from house wallet
        console.log(`💸 Sending ${strkPerWallet} STRK from house wallet...`);
        const fundingTxHash = await sendStrkFromStarknetHouseWallet(
          wallet.address,
          deploymentFunding
        );

        console.log(`   TX: ${fundingTxHash}`);
        console.log("⏳ Waiting for funding confirmation...");

        // Wait for funding transaction
        await provider.waitForTransaction(fundingTxHash);
        console.log("✅ Funding confirmed");

        // Step 3: Deploy wallet
        console.log("🚀 Deploying wallet...");
        const { txHash: deployTxHash } = await deployStarknetAccount(
          privateKey,
          wallet.address,
          false // Use wallet's STRK balance
        );

        console.log(`   TX: ${deployTxHash}`);
        console.log("✅ Deployment successful!");

        // Record deployment transaction
        await prisma.walletTransaction.create({
          data: {
            custodialWalletId: wallet.id,
            txHash: deployTxHash,
            txType: "deploy",
            amount: "0",
            status: "confirmed",
            confirmedAt: new Date(),
          },
        });

        successCount++;

        console.log(`\n✅ [${num}/${total}] Wallet deployed successfully!`);
        console.log(`   Funding TX: ${fundingTxHash}`);
        console.log(`   Deploy TX: ${deployTxHash}`);

      } catch (error) {
        failCount++;
        console.error(`\n❌ [${num}/${total}] Deployment failed!`);
        console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
        console.log("   Continuing with next wallet...");
      }
    }

    // Summary
    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("  DEPLOYMENT COMPLETE");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("📊 Results:");
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total processed: ${nonDeployedWallets.length}`);
    console.log("");

    if (successCount > 0) {
      console.log(`💰 Total STRK used: ~${successCount * strkPerWallet} STRK`);
      console.log(`💵 Estimated cost: ~$${(successCount * strkPerWallet * 0.04).toFixed(2)} USD`);
      console.log("");
    }

    if (failCount > 0) {
      console.log("⚠️  Some deployments failed. Check logs above for details.");
      console.log("");
    }

    console.log("🎉 Bulk deployment finished!");
    console.log("");

    await prisma.$disconnect();
    process.exit(failCount > 0 ? 1 : 0);

  } catch (error) {
    console.error("");
    console.error("═══════════════════════════════════════════════════════");
    console.error("❌ BULK DEPLOYMENT ERROR");
    console.error("═══════════════════════════════════════════════════════");
    console.error("");

    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("");

      if (error.message.includes("Insufficient")) {
        console.error("💡 House wallet may not have enough STRK balance");
        console.error("   Check house wallet STRK balance and add more if needed");
      }
    } else {
      console.error("Unknown error:", error);
    }

    console.error("");
    await prisma.$disconnect();
    process.exit(1);
  }
}

bulkDeployWallets();
