import { formatEther } from 'viem';

export function formatETH(wei: bigint, decimals = 4): string {
  const eth = formatEther(wei);
  return parseFloat(eth).toFixed(decimals);
}

export function formatMultiplier(multiplier: number): string {
  return (multiplier / 100).toFixed(2) + 'x';
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
