import { ec, CallData, hash } from "starknet";
import { getStarknetProvider } from "./provider";

/**
 * Deploy a Starknet account contract with AVNU Paymaster (zero-balance deployment)
 * Uses StarkZap SDK for proper paymaster integration
 *
 * @param privateKey - The private key for the account
 * @param preCalculatedAddress - The pre-calculated address (optional, for verification)
 * @param usePaymaster - Whether to use AVNU Paymaster for sponsored deployment (default: true)
 * @returns Transaction hash of the deployment
 */
export async function deployStarknetAccount(
  privateKey: string,
  preCalculatedAddress?: string,
  usePaymaster: boolean = true
): Promise<{ txHash: string; address: string }> {
  try {
    // Generate public key from private key
    const publicKey = ec.starkCurve.getStarkKey(privateKey);

    // OpenZeppelin Account Contract Class Hash (Cairo 1)
    const OZ_ACCOUNT_CLASS_HASH =
      "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";

    // Calculate account address
    const constructorCalldata = CallData.compile({ publicKey });
    const addressSalt = publicKey;

    const calculatedAddress = hash.calculateContractAddressFromHash(
      addressSalt,
      OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0
    );

    console.log("🔢 Calculated address:", calculatedAddress);

    // Verify address matches if provided
    if (preCalculatedAddress) {
      if (calculatedAddress.toLowerCase() !== preCalculatedAddress.toLowerCase()) {
        throw new Error(
          `Address mismatch! Calculated: ${calculatedAddress}, Expected: ${preCalculatedAddress}`
        );
      }
      console.log("✅ Address verification passed");
    }

    // Use StarkZap SDK for deployment with paymaster
    if (usePaymaster && process.env.AVNU_PAYMASTER_API_KEY) {
      console.log("💳 Using AVNU Paymaster for sponsored deployment via StarkZap");

      const { StarkZap, StarkSigner, OnboardStrategy } = await import("starkzap");

      // Get network from env
      const network = process.env.NEXT_PUBLIC_STARKNET_NETWORK === "sepolia" ? "sepolia" : "mainnet";

      // Initialize StarkZap with AVNU Paymaster
      const sdk = new StarkZap({
        network,
        paymaster: {
          nodeUrl: network === "sepolia"
            ? "https://sepolia.paymaster.avnu.fi"
            : "https://starknet.paymaster.avnu.fi",
            headers: { 'x-paymaster-api-key': process.env.AVNU_API_KEY },
          },

      });

      console.log("🔌 StarkZap initialized with AVNU Paymaster");

      // Connect wallet with private key signer
      const onboard = await sdk.onboard({
        strategy: OnboardStrategy.Signer,
        account: {
          signer: new StarkSigner(privateKey),
        },
        deploy: "never", // We'll deploy manually with sponsored mode
      });

      const wallet = onboard.wallet;

      console.log("🚀 Deploying account with sponsored fees...");

      // Deploy with sponsored mode
      const tx = await wallet.deploy({ feeMode: "sponsored" });

      console.log("📤 Deployment transaction sent:", tx.hash);
      console.log("⏳ Waiting for confirmation...");

      // Wait for confirmation
      await tx.wait();

      console.log("✅ Account deployed successfully with zero balance!");

      return {
        txHash: tx.hash,
        address: calculatedAddress,
      };
    } else {
      // Fallback to regular deployment without paymaster
      if (usePaymaster) {
        console.warn("⚠️  AVNU_PAYMASTER_API_KEY not found, deploying without paymaster");
        console.warn("    This requires the wallet to have STRK balance for gas fees");
      }

      const { Account } = await import("starknet");
      const provider = getStarknetProvider();

      const account = new Account({
        provider,
        address: calculatedAddress,
        signer: privateKey,
      });

      console.log("🚀 Deploying account contract (without paymaster)...");
      console.log("   Using STRK for gas fees");

      const deployPayload = {
        classHash: OZ_ACCOUNT_CLASS_HASH,
        constructorCalldata,
        addressSalt,
      };

      // Deploy account - starknet.js uses STRK for gas fees by default on v0.13.0+
      const { transaction_hash: deployTxHash } = await account.deployAccount(deployPayload);

      console.log("📤 Deployment transaction sent:", deployTxHash);
      console.log("⏳ Waiting for confirmation...");

      await provider.waitForTransaction(deployTxHash);

      console.log("✅ Account deployed successfully!");

      return {
        txHash: deployTxHash,
        address: calculatedAddress,
      };
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

/**
 * Calculate the Starknet account address for a given private key
 *
 * @param privateKey - The private key
 * @returns The calculated account address
 */
export function calculateStarknetAccountAddress(privateKey: string): string {
  // Generate public key from private key
  const publicKey = ec.starkCurve.getStarkKey(privateKey);

  // OpenZeppelin Account Contract Class Hash
  const OZ_ACCOUNT_CLASS_HASH =
    "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";

  // Calculate account address
  const constructorCalldata = CallData.compile({ publicKey });
  const addressSalt = publicKey;

  const address = hash.calculateContractAddressFromHash(
    addressSalt,
    OZ_ACCOUNT_CLASS_HASH,
    constructorCalldata,
    0
  );

  return address;
}

/**
 * Check if a Starknet account is deployed
 *
 * @param address - The account address to check
 * @returns True if deployed, false otherwise
 */
export async function isAccountDeployed(address: string): Promise<boolean> {
  try {
    const provider = getStarknetProvider();

    // Try to get the contract class
    // This will throw if the contract is not deployed
    await provider.getClassAt(address);

    return true;
  } catch (error) {
    // Contract not found = not deployed
    if (error instanceof Error && error.message.includes("Contract not found")) {
      return false;
    }

    // Other errors should be thrown
    throw error;
  }
}
