import { RpcProvider } from "starknet";

/**
 * Get Starknet RPC provider with retry logic
 * Uses Starknet mainnet or sepolia based on environment
 */
export function getStarknetProvider(): RpcProvider {
  const network = process.env.NEXT_PUBLIC_STARKNET_NETWORK || "mainnet";
  const rpcUrl = process.env.NEXT_PUBLIC_STARKNET_RPC_URL;

  if (rpcUrl) {
    return new RpcProvider({ nodeUrl: rpcUrl });
  }

  // Default to working public endpoints
  if (network === "mainnet") {
    // Try these in order:
    // 1. Alchemy (if API key provided)
    const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_STARKNET_KEY;
    if (alchemyKey) {
      return new RpcProvider({
        nodeUrl: `https://starknet-mainnet.g.alchemy.com/v2/${alchemyKey}`,
      });
    }

    // 2. Use Infura public endpoint
    const infuraKey = process.env.NEXT_PUBLIC_INFURA_STARKNET_KEY;
    if (infuraKey) {
      return new RpcProvider({
        nodeUrl: `https://starknet-mainnet.infura.io/v3/${infuraKey}`,
      });
    }

    // 3. Try multiple fallback public RPCs
    // Use Lava Network as primary fallback (more stable than Nethermind)
    return new RpcProvider({
      nodeUrl: "https://rpc.starknet.lava.build",
    });
  } else {
    // Sepolia testnet
    const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_STARKNET_KEY;
    if (alchemyKey) {
      return new RpcProvider({
        nodeUrl: `https://starknet-sepolia.g.alchemy.com/v2/${alchemyKey}`,
      });
    }

    return new RpcProvider({
      nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno",
    });
  }
}

/**
 * Get balance with retry logic for flaky public RPCs
 */
export async function getStarknetBalance(
  address: string,
  retries: number = 3
): Promise<bigint> {
  const provider = getStarknetProvider();
  const ethContractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const balance = await provider.callContract({
        contractAddress: ethContractAddress,
        entrypoint: "balanceOf",
        calldata: [address],
      });

      // Parse uint256 result
      const balanceLow = BigInt(balance[0]);
      const balanceHigh = BigInt(balance[1] || 0);
      return balanceLow + (balanceHigh << BigInt(128));
    } catch (error) {
      console.error(`Balance fetch attempt ${attempt}/${retries} failed:`, error);

      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error("Failed to fetch balance after retries");
}

/**
 * Get Starknet explorer URL for transaction
 */
export function getStarknetExplorerTxUrl(txHash: string): string {
  const network = process.env.NEXT_PUBLIC_STARKNET_NETWORK || "mainnet";

  if (network === "mainnet") {
    return `https://starkscan.co/tx/${txHash}`;
  } else {
    return `https://sepolia.starkscan.co/tx/${txHash}`;
  }
}

/**
 * Get Starknet explorer URL for address
 */
export function getStarknetExplorerAddressUrl(address: string): string {
  const network = process.env.NEXT_PUBLIC_STARKNET_NETWORK || "mainnet";

  if (network === "mainnet") {
    return `https://starkscan.co/contract/${address}`;
  } else {
    return `https://sepolia.starkscan.co/contract/${address}`;
  }
}

/**
 * Check if address is a Starknet address (>42 chars)
 */
export function isStarknetAddress(address: string): boolean {
  return address.length > 42;
}

/**
 * Check if address is an EVM address (exactly 42 chars including 0x)
 */
export function isEvmAddress(address: string): boolean {
  return address.length === 42 && address.startsWith("0x");
}
