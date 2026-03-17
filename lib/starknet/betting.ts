import { type Wallet, Token, Amount, fromAddress } from "starkzap";
import type { Call } from "starknet";

/**
 * Starknet token addresses (Mainnet)
 */
export const STARKNET_TOKENS = {
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  USDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
  USDT: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
} as const;

/**
 * Starknet Sepolia token addresses (Testnet)
 */
export const STARKNET_SEPOLIA_TOKENS = {
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
} as const;

interface PlaceBetParams {
  wallet: Wallet;
  amount: Amount;
  multiplier: number;
  token: Token;
  gameContractAddress: string;
}

interface BatchBetParams {
  wallet: Wallet;
  bets: Array<{
    amount: Amount;
    multiplier: number;
  }>;
  token: Token;
  gameContractAddress: string;
}

/**
 * Place a bet on Starknet
 */
export async function placeBetOnStarknet({
  wallet,
  amount,
  multiplier,
  token,
  gameContractAddress,
}: PlaceBetParams) {
  try {
    const contractAddr = fromAddress(gameContractAddress);

    // Use transaction builder to batch approve + bet in one tx
    const tx = await wallet
      .tx()
      .approve(token, contractAddr, amount)
      .add({
        contractAddress: gameContractAddress,
        entrypoint: "place_bet",
        calldata: [amount.toBase().toString(), multiplier.toString()],
      })
      .send();

    await tx.wait();

    return {
      success: true,
      txHash: tx.hash,
    };
  } catch (error) {
    console.error("Bet placement error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Place multiple bets in a batch (gas optimization)
 */
export async function placeBatchBetsOnStarknet({
  wallet,
  bets,
  token,
  gameContractAddress,
}: BatchBetParams) {
  try {
    const contractAddr = fromAddress(gameContractAddress);

    // Calculate total amount
    const totalAmount = bets.reduce((sum, bet) => {
      return sum.add(bet.amount);
    }, Amount.parse("0", token));

    // Build batch transaction using tx builder
    let txBuilder = wallet.tx().approve(token, contractAddr, totalAmount);

    // Add each bet call to the batch
    for (const bet of bets) {
      txBuilder = txBuilder.add({
        contractAddress: gameContractAddress,
        entrypoint: "place_bet",
        calldata: [bet.amount.toBase().toString(), bet.multiplier.toString()],
      });
    }

    const tx = await txBuilder.send();
    await tx.wait();

    return {
      success: true,
      txHash: tx.hash,
      betsCount: bets.length,
    };
  } catch (error) {
    console.error("Batch bet error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user's token balance on Starknet
 */
export async function getTokenBalance(wallet: Wallet, token: Token) {
  try {
    const balance = await wallet.balanceOf(token);
    return balance;
  } catch (error) {
    console.error("Balance fetch error:", error);
    return null;
  }
}

/**
 * Format Starknet address for display
 */
export function formatStarknetAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Convert amount to smallest unit (wei equivalent on Starknet)
 */
export function toStarknetAmount(amount: string, decimals = 18): string {
  const value = parseFloat(amount);
  const multiplier = BigInt(10) ** BigInt(decimals);
  return (BigInt(Math.floor(value * 10 ** decimals)) * multiplier / BigInt(10 ** decimals)).toString();
}

/**
 * Convert from smallest unit to human-readable amount
 */
export function fromStarknetAmount(amount: string, decimals = 18): string {
  const value = BigInt(amount);
  const divisor = BigInt(10) ** BigInt(decimals);
  const result = Number(value) / Number(divisor);
  return result.toFixed(6);
}
