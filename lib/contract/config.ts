import { CHAIN } from "@/lib/constants";

export const CONTRACT_ADDRESS =
  "0x96e58ea61487194146f1b24d8d2436cd09180369" as `0x${string}`;

export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESS,
  chainId: CHAIN.id,
} as const;

// Re-export CHAIN for convenience
export { CHAIN };
