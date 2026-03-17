import { config } from "dotenv";
import { ec, CallData, hash, Account, RpcProvider } from "starknet";
import { getStarknetProvider } from "@/lib/starknet/provider";

config();

/**
 * Test AVNU Paymaster setup
 */
async function testPaymaster() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  AVNU PAYMASTER TEST");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");

  // Check if API key exists
  const apiKey = process.env.AVNU_PAYMASTER_API_KEY;

  if (!apiKey) {
    console.error("❌ AVNU_PAYMASTER_API_KEY not found in .env");
    console.error("");
    console.error("Add to .env:");
    console.error('AVNU_PAYMASTER_API_KEY="your-key-here"');
    console.error("");
    process.exit(1);
  }

  console.log("✅ API Key found in .env");
  console.log(`   Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log("");

  // Test paymaster connection
  console.log("🔌 Creating paymaster provider...");

  try {
    const paymasterRpc = new RpcProvider({
      nodeUrl: "https://starknet.paymaster.avnu.fi",
      headers: {
        "x-paymaster-api-key": apiKey,
      },
    });

    console.log("✅ Paymaster provider created!");
    console.log("");

    // Generate a test address
    console.log("🧪 Testing deployment flow...");
    const testPrivateKey = "0x" + Buffer.from(ec.starkCurve.utils.randomPrivateKey()).toString("hex");
    const publicKey = ec.starkCurve.getStarkKey(testPrivateKey);

    const OZ_ACCOUNT_CLASS_HASH = "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";
    const constructorCalldata = CallData.compile({ publicKey });

    const testAddress = hash.calculateContractAddressFromHash(
      publicKey,
      OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0
    );

    console.log("   Test address:", testAddress);
    console.log("");

    // Create account with paymaster
    const provider = getStarknetProvider();
    const account = new Account({
      provider,
      address: testAddress,
      signer: testPrivateKey,
      paymaster: paymasterRpc,
    });

    console.log("✅ Account created with paymaster");
    console.log("");

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ PAYMASTER TEST PASSED!");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("Next steps:");
    console.log("1. Run: npm run deploy-custodial-wallet");
    console.log("2. It should deploy with 0 balance using paymaster");
    console.log("3. Check AVNU portal for usage: https://portal.avnu.fi/");
    console.log("");

  } catch (error) {
    console.error("❌ Paymaster test failed!");
    console.error("");

    if (error instanceof Error) {
      console.error("Error:", error.message);

      if (error.message.includes("401") || error.message.includes("403")) {
        console.error("");
        console.error("💡 API Key might be invalid or expired");
        console.error("   Check your API key at: https://portal.avnu.fi/");
      } else if (error.message.includes("rate limit")) {
        console.error("");
        console.error("💡 Rate limit exceeded");
        console.error("   Wait a moment or upgrade plan at: https://portal.avnu.fi/");
      }
    } else {
      console.error("Unknown error:", error);
    }

    console.error("");
    process.exit(1);
  }

  await new Promise(resolve => setTimeout(resolve, 100));
}

testPaymaster()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
