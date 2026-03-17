import { getStarknetProvider } from "@/lib/starknet/provider";

/**
 * STRK token contract address
 * Mainnet & Sepolia use the same address
 */
const STRK_ADDRESS =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

/**
 * Get STRK token balance for a Starknet address
 * @param address - The Starknet address to check
 * @returns Balance in wei (18 decimals)
 */
export async function getStrkBalance(address: string): Promise<bigint> {
  try {
    const provider = getStarknetProvider();

    const result = await provider.callContract({
      contractAddress: STRK_ADDRESS,
      entrypoint: "balanceOf",
      calldata: [address],
    });

    // STRK uses Uint256 (low, high)
    const low = BigInt(result[0]);
    const high = BigInt(result[1]);

    return low + (high << BigInt(128));
  } catch (error) {
    console.error("Failed to get STRK balance:", error);
    return BigInt(0);
  }
}

/**
 * STRK token contract address (exported for use in other files)
 */
export const STRK_TOKEN_ADDRESS = STRK_ADDRESS;
