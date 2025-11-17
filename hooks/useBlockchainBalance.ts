import { useQuery } from "@tanstack/react-query";
import { JsonRpcProvider, formatEther } from "ethers";
import { getUsdValueFromEth } from "@/lib/utils/price";

/**
 * Simple hook that fetches balance directly from blockchain
 * No DB, no caching, just pure on-chain balance
 */
export function useBlockchainBalance(walletAddress: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["blockchain-balance", walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }

      // Get balance from blockchain
      const rpcUrl =
        process.env.NEXT_PUBLIC_RPC_URL ||
        `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

      const provider = new JsonRpcProvider(rpcUrl);
      const balanceWei = await provider.getBalance(walletAddress);

      // Convert to ETH
      const balanceEth = parseFloat(formatEther(balanceWei));

      // Convert to USD
      const balanceUsd = await getUsdValueFromEth(balanceEth);

      return {
        balanceWei: balanceWei.toString(),
        balanceEth,
        balanceUsd,
      };
    },
    enabled: !!walletAddress,
    refetchInterval: 3000, // Refetch every 3 seconds to show real-time blockchain state
    refetchOnWindowFocus: true,
    staleTime: 1000, // Consider data stale after 1 second
  });

  return {
    balanceWei: data?.balanceWei || "0",
    balanceEth: data?.balanceEth || 0,
    balanceUsd: data?.balanceUsd || 0,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}
