# Bet Events Hooks - Usage Guide

## Overview

Three hooks are available for tracking bet events in the Limbo game:

1. **`useBetEvents`** - Real-time event watching (recommended for most use cases)
2. **`usePastBetEvents`** - Fetch historical events from blockchain
3. **`useCombinedBetEvents`** - Combines both real-time and historical (best for user dashboards)

## Key Improvements

### Fixed Issues
- **Proper bet matching** using `requestId` instead of just player address
- **No more race conditions** - requestId ensures correct pairing of BetPlaced → BetResolved
- **Duplicate prevention** with Set-based tracking of processed requestIds
- **Automatic cleanup** of stale pending bets (5-minute timeout)
- **Complete data capture** including limboMultiplier and payout from events

### What Changed
- Added `requestId: bigint` to both `PendingBet` and `ResolvedBet` interfaces
- Added `limboMultiplier: bigint` and `payout: bigint` to `ResolvedBet`
- Changed from `Date.now()` to contract's `timestamp` field
- Replaced player-based matching with requestId-based matching

## Usage Examples

### Basic Usage (Real-time Only)

```tsx
import { useBetEvents } from '@/hooks/useBetEvents';

function GameComponent() {
  const { address } = useAccount();
  const { pendingBets, resolvedBets, hasPendingBet } = useBetEvents(address);

  return (
    <div>
      {hasPendingBet && (
        <div>
          <p>Waiting for VRF result...</p>
          {pendingBets.map(bet => (
            <div key={bet.requestId.toString()}>
              Request ID: {bet.requestId.toString()}
              Amount: {formatEther(bet.amount)} ETH
              Target: {bet.targetMultiplier / 100}x
            </div>
          ))}
        </div>
      )}

      {resolvedBets.map(bet => (
        <div key={bet.requestId.toString()}>
          {bet.win ? '✅' : '❌'}
          Limbo Multiplier: {Number(bet.limboMultiplier) / 100}x
          Payout: {formatEther(bet.payout)} ETH
        </div>
      ))}
    </div>
  );
}
```

### Combined Hook (Real-time + Historical)

```tsx
import { useCombinedBetEvents } from '@/hooks/useCombinedBetEvents';

function UserDashboard() {
  const { address } = useAccount();
  const {
    pendingBets,
    resolvedBets,
    isLoadingPastEvents,
    pastEventsError
  } = useCombinedBetEvents({
    userAddress: address,
    loadPastEvents: true, // Load history on mount
  });

  if (isLoadingPastEvents) return <div>Loading history...</div>;
  if (pastEventsError) return <div>Error: {pastEventsError.message}</div>;

  return (
    <div>
      <h2>Your Bet History</h2>
      {resolvedBets.map(bet => (
        <BetCard key={bet.requestId.toString()} bet={bet} />
      ))}
    </div>
  );
}
```

### Fetching Specific Block Range

```tsx
import { usePastBetEvents } from '@/hooks/usePastBetEvents';

function BetAnalytics() {
  const { address } = useAccount();
  const { resolvedBets, isLoading } = usePastBetEvents({
    userAddress: address,
    enabled: true,
    fromBlock: 123456n, // Specific block
    toBlock: 'latest',
  });

  // Analyze bet statistics...
}
```

## Data Structures

### PendingBet
```typescript
interface PendingBet {
  requestId: bigint;        // Unique VRF request ID
  player: string;           // Player address
  amount: bigint;           // Bet amount in wei
  targetMultiplier: number; // Target multiplier (100 = 1.00x)
  timestamp: number;        // Unix timestamp in milliseconds
  txHash: string;           // Transaction hash
}
```

### ResolvedBet
```typescript
interface ResolvedBet {
  requestId: bigint;        // Unique VRF request ID (matches PendingBet)
  player: string;           // Player address
  amount: bigint;           // Bet amount in wei
  targetMultiplier: number; // Target multiplier (100 = 1.00x)
  limboMultiplier: bigint;  // Actual result from VRF (100 = 1.00x)
  win: boolean;             // True if limboMultiplier >= targetMultiplier
  payout: bigint;           // Payout amount in wei (0 if loss)
  timestamp: number;        // Unix timestamp in milliseconds
  txHash: string;           // Transaction hash
}
```

## Advanced Features

### Auto-Cleanup
Pending bets are automatically removed after 5 minutes if not resolved (prevents stale UI):

```tsx
// No action needed - happens automatically
const PENDING_BET_TIMEOUT = 5 * 60 * 1000; // 5 minutes
```

### Manual Reset
```tsx
const { clearBets, clearPendingBets } = useBetEvents(address);

// Clear everything
clearBets();

// Or just clear pending (keeps history)
clearPendingBets();
```

### Filtering Events
Events are automatically filtered by `userAddress` if provided. Pass `undefined` to see all players' bets:

```tsx
// Only your bets
const userBets = useBetEvents(address);

// All bets (useful for admin dashboards)
const allBets = useBetEvents(undefined);
```

## Contract Event Reference

### BetPlaced Event
```solidity
event BetPlaced(
  uint256 indexed requestId,
  address indexed player,
  uint256 amount,
  uint256 targetMultiplier,
  uint256 timestamp
);
```

### BetResolved Event
```solidity
event BetResolved(
  uint256 indexed requestId,
  address indexed player,
  uint256 betAmount,
  uint256 targetMultiplier,
  uint256 limboMultiplier,
  bool win,
  uint256 payout,
  uint256 timestamp
);
```

## Debugging

All hooks include detailed console logging:
- `📡` Event received
- `🎲` BetPlaced details
- `🎰` BetResolved details
- `✅` Successfully added bet
- `⚠️` Duplicate/skipped event
- `🗑️` Removed pending bet
- `🧹` Cleanup operations

Check browser console for detailed logs when debugging bet tracking issues.

## Performance Notes

- Real-time events use wagmi's `useWatchContractEvent` (WebSocket/polling)
- Past events fetch up to 10,000 blocks by default (configurable)
- Pending bets limited to 10 most recent
- Resolved bets limited to 50 most recent
- Duplicate prevention uses Set for O(1) lookups
