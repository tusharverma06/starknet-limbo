import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseEther } from "viem";
import { LIMBO_GAME_ABI } from "@/lib/contract/abi";
import { CONTRACT_ADDRESS, CHAIN } from "@/lib/contract/config";
import { toContractMultiplier } from "@/lib/utils/multiplier";

export function useGameContract() {
  // Write: Place Bet
  const {
    writeContract,
    isPending: isPlacingBet,
    error: placeBetError,
    reset,
    data: txHash,
  } = useWriteContract();

  // Wait for transaction
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: transactionReceipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  console.log(txHash, transactionReceipt, isConfirmed, isConfirming);

  // Log transaction hash when available
  if (txHash) {
    console.log("📝 Transaction hash received:", txHash);
  }

  // Read: House Balance
  const { data: houseBalanceData, refetch: refetchHouseBalance } =
    useReadContract({
      address: CONTRACT_ADDRESS,
      abi: LIMBO_GAME_ABI,
      functionName: "houseBalance",
      chainId: CHAIN.id,
    });

  const houseBalance = houseBalanceData as bigint;
  console.log("🏦 House balance:", houseBalance);
  // Read: Owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIMBO_GAME_ABI,
    functionName: "owner",
    chainId: CHAIN.id,
  });

  // Place Bet Function
  const placeBet = async (betAmount: string, targetMultiplier: number) => {
    try {
      const contractMultiplier = toContractMultiplier(targetMultiplier);

      console.log("🎲 Placing bet:", {
        betAmount,
        targetMultiplier,
        contractMultiplier,
        contractAddress: CONTRACT_ADDRESS,
      });

      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: LIMBO_GAME_ABI,
        functionName: "placeBet",
        args: [BigInt(contractMultiplier)],
        value: parseEther(betAmount),
        chainId: CHAIN.id,
      });

      console.log("✅ Transaction initiated, hash will be available in txHash");
    } catch (error) {
      console.error("❌ Place bet error:", error);
      throw error;
    }
  };

  // Fund House (owner only)
  const fundHouse = async (amount: string) => {
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: LIMBO_GAME_ABI,
      functionName: "fundHouse",
      value: parseEther(amount),
      chainId: CHAIN.id,
    });
  };

  return {
    placeBet,
    fundHouse,
    houseBalance: houseBalance || BigInt(0),
    refetchHouseBalance,
    owner,
    isPlacingBet,
    isConfirming,
    isConfirmed,
    lastTxHash: txHash,
    placeBetError,
    reset,
  };
}
