import { config } from "dotenv";
import { getStarknetBalance } from "@/lib/starknet/provider";

config();

async function checkBalance() {
  const address = "0x2e80e2aefbee81b1f875c10425b520beb5c3f8d4921ac2ee9f243704acf6949";

  console.log("Checking balance for:", address);
  console.log("Network:", process.env.NEXT_PUBLIC_STARKNET_NETWORK || "mainnet");
  console.log("");

  try {
    const balance = await getStarknetBalance(address);
    const balanceInEth = Number(balance) / 1e18;

    console.log("Balance (wei):", balance.toString());
    console.log("Balance (ETH):", balanceInEth.toFixed(6));

    if (balance === BigInt(0)) {
      console.log("\n❌ Balance is 0! The funds may have been moved or are on a different network.");
    } else {
      console.log("\n✅ Wallet has balance");
    }
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
}

checkBalance();
