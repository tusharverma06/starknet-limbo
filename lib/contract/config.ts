import { baseSepolia } from 'viem/chains';

export const CONTRACT_ADDRESS = '0xb1f942b87db32325c13e1e57314c833561ed78a9' as `0x${string}`;
export const CHAIN = baseSepolia;

export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESS,
  chainId: CHAIN.id,
} as const;
