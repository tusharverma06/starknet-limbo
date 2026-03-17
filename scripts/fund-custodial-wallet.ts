import { config } from "dotenv";
import { sendFromStarknetHouseWallet } from "@/lib/starknet/houseWallet";
import { getStarknetBalance } from "@/lib/starknet/provider";

config();

async function fundCustodialWallet() {
  const targetAddress = "0x2e80e2aefbee81b1f875c10425b520beb5c3f8d4921ac2ee9f243704acf6949";

  console.log("💰 Funding custodial wallet from house wallet");
  console.log("Target:", targetAddress);
  console.log("");

  // Check current balance
  console.log("📊 Current balance:");
  const currentBalance = await getStarknetBalance(targetAddress);
  const currentEth = Number(currentBalance) / 1e18;
  console.log(`   ${currentEth.toFixed(6)} ETH (${currentBalance} wei)`);
  console.log("");

  // Send 0.001 ETH (1000000000000000 wei)
  const amountToSend = BigInt(1000000000000000); // 0.001 ETH
  const amountEth = Number(amountToSend) / 1e18;

  console.log("💸 Sending:", amountEth.toFixed(6), "ETH");
  console.log("");

  try {
    const txHash = await sendFromStarknetHouseWallet(targetAddress, amountToSend);
    console.log("✅ Transaction sent!");
    console.log("   TX Hash:", txHash);
    console.log("");
    console.log("⏳ Waiting 30 seconds for transaction to settle...");

    await new Promise(resolve => setTimeout(resolve, 30000));

    // Check new balance
    const newBalance = await getStarknetBalance(targetAddress);
    const newEth = Number(newBalance) / 1e18;
    console.log("");
    console.log("📊 New balance:");
    console.log(`   ${newEth.toFixed(6)} ETH (${newBalance} wei)`);
    console.log("");

    if (newEth >= 0.001) {
      console.log("✅ Balance is now sufficient for deployment!");
      console.log("");
      console.log("Next step: Run deployment script");
      console.log("   npm run deploy-custodial-wallet");
    } else {
      console.log("⚠️  Balance is still below 0.001 ETH");
      console.log(`   Current: ${newEth.toFixed(6)} ETH`);
      console.log(`   Need: ${(0.001 - newEth).toFixed(6)} ETH more`);
    }

    console.log("");
  } catch (error) {
    console.error("❌ Error sending funds:", error);
    throw error;
  }
}

fundCustodialWallet()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
