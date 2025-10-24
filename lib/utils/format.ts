import { formatEther } from 'viem';

export function formatETH(wei: bigint, decimals = 4): string {
  const eth = formatEther(wei);
  const ethValue = parseFloat(eth);

  // For very small values, use more decimals to make them visible
  if (ethValue > 0 && ethValue < 0.0001) {
    // Find the first non-zero digit and show up to 8 decimals
    return ethValue.toFixed(8).replace(/\.?0+$/, '');
  }

  return ethValue.toFixed(decimals);
}

export function formatUSD(amount: number, decimals = 2): string {
  return amount.toFixed(decimals);
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
