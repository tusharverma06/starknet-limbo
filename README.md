# 🎲 Starknet Limbo

A **provably fair** betting game built on Starknet with off-chain randomness generation and on-chain fund settlement. Features instant results, cryptographic verification, and secure custodial wallet management.

**🏆 Built with Starkzap SDK on Starknet Mainnet**

## 🌟 Key Features

### Game Mechanics

- **Off-Chain Provably Fair System**: Cryptographically verifiable randomness using SHA256 and server/client seeds
- **Instant Results**: Generate game outcomes in <300ms while settling funds on-chain
- **Flexible Betting**: $0.10 - $10 USD bets with 1.01x - 5x multipliers
- **Power Bar UI**: Visual multiplier selector with 26 segments and precise +/- controls

### Blockchain Integration

- **Starknet Settlement**: All funds transferred on-chain via Starknet ETH contracts
- **Synchronous Deduction**: Bet amounts confirmed on-chain BEFORE results are generated
- **Transaction Verification**: Full cryptographic verification of all bets and payouts
- **Custodial Wallets**: Auto-generated using Starknet.js SDK with deterministic address computation
- **Account Abstraction**: OpenZeppelin account implementation with pre-computed addresses (no deployment required for receiving funds)

### Security

- **Guaranteed Fund Transfer**: User funds land in house wallet before any result is provided
- **Encrypted Keys**: All private keys encrypted at rest with AES-256-GCM
- **Message Signing**: Starknet signatures for bet verification
- **SIWE Authentication**: Sign-In with Ethereum for wallet ownership verification

---

## ⚡ Starknet Integration Highlights

This project showcases extensive use of **Starknet.js SDK** and Starknet-native features:

### 🔑 Custodial Wallet Generation

- **Elliptic Curve Cryptography**: Use `ec.starkCurve` for secure key generation
- **Deterministic Addresses**: Compute addresses using OpenZeppelin account class hash
- **Account Abstraction**: Pre-computed addresses work without deployment
- **Delayed Deployment**: Wallets only deployed when needed (first withdrawal)

### 💰 On-Chain Settlement

- **Direct ETH Contract Calls**: Use Starknet ETH contract's `transfer` entrypoint
- **Balance Queries**: Call `balanceOf` via `provider.callContract()`
- **Transaction Monitoring**: Use `provider.waitForTransaction()` for confirmations
- **Event Parsing**: Extract Transfer events from transaction receipts

### 🔐 Account Management

- **Starknet Account Class**: Create `Account` instances for transaction signing
- **Message Signing**: Use Starknet-native typed data signing (EIP-712 equivalent)
- **Multi-Wallet Support**: Integrate with Argent X and Braavos via Starkzap

**All financial transactions settle on Starknet mainnet** - providing security, transparency, and verifiability.

---

## 🎮 How It Works

### Bet Flow

1. **User Places Bet**
   - Validates bet amount ($0.10 - $10 USD) and multiplier (1.01x - 5x)
   - Checks Starknet blockchain balance (source of truth)
   - Creates pending transaction record

2. **Fund Deduction (SYNCHRONOUS)**
   - Transfers ETH from user's custodial wallet → house wallet
   - Waits for Starknet transaction confirmation
   - If transfer fails → bet rejected, user receives error
   - Only proceeds if funds confirmed on-chain

3. **Result Generation (OFF-CHAIN)**
   - Generates provably fair result using:
     - Server seed (32-byte random hex)
     - Player ID (Starknet wallet address)
     - Bet ID (unique identifier)
   - Calculates game number (1 to 1,000,000,000)
   - Derives Limbo multiplier with 10% house edge
   - Determines win/loss outcome

4. **Payout Processing (ASYNC)**
   - If win: Transfer payout from house wallet → user wallet
   - Updates transaction record with confirmation
   - User can verify bet cryptographically

### Provably Fair Algorithm

```
1. Server Seed: Random 32-byte hex (kept secret until reveal)
2. Server Seed Hash: SHA256(Server Seed) - shown to user before bet
3. Random Value: SHA256(Server Seed + Player ID + Bet ID)
4. Game Number: (Random Value % 1,000,000,000) + 1
5. Limbo Multiplier: (1 - House Edge) × 1,000,000,000 / Game Number
6. Win: Limbo Multiplier >= Target Multiplier
7. Payout: Bet Amount × Target Multiplier (if win)
```

**House Edge**: 10% (configurable via `HOUSE_EDGE` constant)

**Example**:

- Target: 2.00x
- Win Chance: (1 - 0.10) / 2.00 = 45%
- Expected Value: 90% (house keeps 10%)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database
- Starknet wallet (Argent X or Braavos)
- Starknet mainnet ETH for house wallet

### Installation

```bash
# Clone repository
git clone https://github.com/tusharverma06/limbo-app
cd limbo-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔧 Tech Stack

### Blockchain

- **Starknet.js v9** - Core Starknet SDK for:
  - Custodial wallet generation with elliptic curve cryptography (`ec.starkCurve`)
  - Deterministic address computation using OpenZeppelin account class hash
  - Account abstraction (pre-computed addresses, delayed deployment)
  - Transaction execution and monitoring
  - Smart contract interactions (ETH transfers via `transfer` entrypoint)
- **Starkzap SDK** - Browser wallet integration & token transfers
- **get-starknet-core** - Multi-wallet support (Argent X, Braavos)
- **AVNU Paymaster** - _Coming Soon:_ Gasless transactions for improved UX

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Rive** - Game character animations
- **React Query** - Server state management

### Backend

- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **JWT** - Stateless authentication
- **Crypto (Node.js)** - Cryptographic operations

### Security

- **AES-256-GCM** - Private key encryption
- **SHA256** - Provably fair hashing
- **SIWE** - Wallet authentication

---

## 📁 Project Structure

```
limbo-app/
├── app/
│   ├── api/
│   │   ├── wallet/
│   │   │   ├── place-bet/route.ts        # Main betting endpoint
│   │   │   ├── balance/route.ts          # Balance queries
│   │   │   └── withdraw/route.ts         # Withdrawal processing
│   │   ├── verify-full/route.ts          # Bet verification
│   │   └── auth/                         # Authentication endpoints
│   └── page.tsx                          # Landing page
├── components/
│   ├── game/
│   │   └── MiniappGameBoard.tsx          # Main game UI
│   ├── modals/
│   │   ├── FundingModal.tsx              # Deposit interface
│   │   └── WithdrawModal.tsx             # Withdrawal interface
│   └── providers/
│       └── StarknetProvider.tsx          # Wallet connection
├── lib/
│   ├── blockchain/
│   │   └── starknet/
│   │       ├── processBetDeduction.ts    # Bet fund transfers
│   │       └── processPayoutTransfer.ts  # Payout fund transfers
│   ├── starknet/
│   │   ├── houseWallet.ts                # House wallet operations
│   │   └── provider.ts                   # Starknet RPC provider
│   ├── utils/
│   │   ├── provablyFair.ts               # Provably fair algorithms
│   │   ├── multiplier.ts                 # Win probability calculations
│   │   ├── messageSigning.ts             # Starknet message signing
│   │   └── encryption.ts                 # AES-256 encryption
│   ├── constants.ts                      # Game configuration
│   └── db/
│       └── prisma.ts                     # Database client
├── hooks/
│   ├── useStarknetWallet.ts              # Wallet operations
│   ├── useServerWallet.ts                # Custodial wallet management
│   └── useSession.ts                     # Authentication state
└── prisma/
    └── schema.prisma                     # Database schema
```

---

## 🎯 Core Implementation

### 1. Custodial Wallet Creation with Starknet SDK

**File**: `lib/db/starknetWallets.ts`

We leverage **Starknet.js SDK** to auto-generate secure custodial wallets using Starknet's native account abstraction:

```typescript
// 1. Generate random private key using Starknet elliptic curve
const privateKeyBytes = ec.starkCurve.utils.randomPrivateKey();
const privateKey = "0x" + Buffer.from(privateKeyBytes).toString("hex");

// 2. Compute public key from private key
const publicKey = ec.starkCurve.getStarkKey(privateKey);

// 3. Use OpenZeppelin account class hash (standard on Starknet)
const OZ_ACCOUNT_CLASS_HASH =
  "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";

// 4. Compute deterministic account address (NO DEPLOYMENT NEEDED)
const accountAddress = hash.calculateContractAddressFromHash(
  publicKey,
  OZ_ACCOUNT_CLASS_HASH,
  CallData.compile({ publicKey }),
  0,
);

// 5. Encrypt and store private key
const encryptedPrivateKey = encryptPrivateKey(privateKey);

// Address is ready to receive funds without deployment!
// Deployment only required when user wants to withdraw or send transactions
```

**Key Benefits**:

- ✅ Deterministic address generation (computed, not deployed)
- ✅ Users can receive funds immediately (no deployment needed)
- ✅ Wallet only deployed when user initiates first withdrawal
- ✅ Uses OpenZeppelin standard account implementation
- ✅ Native Starknet account abstraction support

### 2. Provably Fair System

**File**: `lib/utils/provablyFair.ts`

```typescript
// Generate server seed (kept secret)
const serverSeed = generateServerSeed(); // 32-byte random hex

// Create commitment (shown to user before bet)
const serverSeedHash = sha256(serverSeed);

// Generate random value after bet placed
const randomValue = sha256(serverSeed + playerId + betId);

// Derive game number (1 to 1 billion)
const gameNumber = (BigInt("0x" + randomValue) % BigInt(1e9)) + BigInt(1);

// Calculate multiplier with house edge
const multiplier = ((1 - HOUSE_EDGE) * 1e9 * 100) / (gameNumber * 10000);

// Determine outcome
const win = multiplier >= targetMultiplier;
const payout = win ? (wager * targetMultiplier) / 100 : 0;
```

### 3. Starknet Fund Transfer

**File**: `lib/blockchain/starknet/processBetDeduction.ts`

```typescript
// Send ETH from user custodial wallet to house wallet
const txHash = await sendToStarknetHouseWallet(
  encryptedPrivateKey,
  userWalletAddress,
  betAmountBigInt,
);

// Wait for transaction confirmation
await provider.waitForTransaction(txHash);

// Update transaction record
await prisma.walletTransaction.update({
  where: { id: existingBetTx.id },
  data: { txHash, status: "confirmed" },
});
```

### 4. Bet Placement Flow

**File**: `app/api/wallet/place-bet/route.ts`

```typescript
// 1. Validate inputs and check blockchain balance
const balance = await provider.callContract({
  contractAddress: ethContractAddress,
  entrypoint: "balanceOf",
  calldata: [custodialAddress],
});

// 2. Create pending transaction
await prisma.walletTransaction.create({
  data: { txType: "bet_placed", status: "pending" },
});

// 3. WAIT for deduction to complete (SYNCHRONOUS)
const deductionResult = await processStarknetBetDeduction({
  betId,
  userId,
  encryptedPrivateKey,
  userWalletAddress,
  betAmount,
});

// 4. If deduction failed, reject bet
if (!deductionResult.success) {
  return NextResponse.json({ error: "Bet deduction failed" }, { status: 500 });
}

// 5. ONLY NOW generate result (after funds confirmed)
const result = generateBetResult(playerId, betId, wager, targetMultiplier);

// 6. Create bet record with txHash
await prisma.bet.create({
  data: { ...result, txHash: deductionResult.txHash, status: "completed" },
});

// 7. Process payout if win (async)
if (result.outcome === "win") {
  processStarknetPayoutTransfer({ betId, userWalletAddress, payout });
}
```

### 5. Bet Verification

**File**: `app/api/verify-full/route.ts`

Users can verify any bet by checking:

- Server seed hash matches SHA256(server seed)
- Random value = SHA256(server seed + player ID + bet ID)
- Game number derived correctly from random value
- Multiplier calculated with correct house edge
- Outcome determined correctly (limbo >= target = win)
- Payout calculated correctly
- Transaction exists on Starknet blockchain

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/limbo"

# Encryption (Generate with: openssl rand -hex 32)
WALLET_ENCRYPTION_KEY="your-256-bit-encryption-key-here"

# Starknet House Wallet (for payouts)
STARKNET_HOUSE_WALLET_ADDRESS="0x..."
ENCRYPTED_STARKNET_HOUSE_WALLET_KEY="encrypted-private-key"

# JWT Secret (Generate with: openssl rand -hex 32)
JWT_SECRET="your-jwt-secret-here"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Starknet RPC
STARKNET_RPC_URL="https://starknet-mainnet.public.blastapi.io"
```

### Game Configuration

**File**: `lib/constants.ts`

```typescript
// Bet limits
export const MIN_BET_USD = 0.1; // $0.10 minimum
export const MAX_BET_USD = 10; // $10 maximum
export const MIN_MULTIPLIER = 1.01;
export const MAX_MULTIPLIER = 5; // 5x maximum

// House edge (10%)
export const HOUSE_EDGE = 0.1;

// Response time
export const INSTANT_RESULT_TIME = 300; // ~300ms average
```

---

## 🛠️ Development

### Available Scripts

```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm type-check       # TypeScript type checking
pnpm db:migrate       # Run Prisma migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:push          # Push schema changes (dev)
```

### Database Schema

Key tables:

- **User**: User accounts and wallet linkage
- **CustodialWallet**: Encrypted wallet storage
- **Bet**: All bet records with provably fair data
- **WalletTransaction**: On-chain transaction tracking

---

## 🔒 Security Features

### 1. Encrypted Wallet Storage

```typescript
// Encrypt private key before storage
const encryptedKey = encryptPrivateKey(privateKey, WALLET_ENCRYPTION_KEY);

// Decrypt only when needed
const privateKey = decryptPrivateKey(encryptedKey);
```

### 2. Guaranteed Fund Transfer

- User funds transferred on-chain BEFORE result generation
- Transaction confirmed on Starknet before proceeding
- If transfer fails, bet is rejected immediately
- No free bets or unpaid results possible

### 3. Message Signing

```typescript
// Sign bet message with Starknet wallet
const signature = await account.signMessage({
  domain: { name: "Limbo Game", version: "1" },
  message: { betId, wager, targetMultiplier, timestamp },
});
```

### 4. Transaction Verification

- All bets include Starknet transaction hash
- Users can verify on-chain via Starkscan/Voyager
- Provably fair verification available for all bets

---

## 🐛 Troubleshooting

### Wallet Connection Issues

```bash
# Ensure wallet extension is installed and unlocked
# Supported: Argent X, Braavos
# Network: Starknet Mainnet
```

### Transaction Failures

- Check sufficient balance in custodial wallet
- Verify house wallet has enough ETH for payouts
- Check Starknet network status
- View transaction on [Starkscan](https://starkscan.co)

### Database Issues

```bash
# Reset database (WARNING: Deletes all data)
pnpm db:push --force-reset

# Run migrations
pnpm db:migrate deploy
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

---

## 📊 Game Statistics

### Win Probabilities (10% House Edge)

| Multiplier | Win Chance | Expected Value |
| ---------- | ---------- | -------------- |
| 1.50x      | 60.00%     | 90%            |
| 2.00x      | 45.00%     | 90%            |
| 3.00x      | 30.00%     | 90%            |
| 5.00x      | 18.00%     | 90%            |

**Formula**: Win Chance = (1 - House Edge) / Target Multiplier

**Expected Value**: Always 90% (house edge is 10%)

---

## 🚀 Future Roadmap

### Planned Features

1. **AVNU Paymaster Integration**
   - Enable gasless transactions for improved user experience
   - Users can pay transaction fees in stablecoins (USDC/USDT)
   - Remove need for ETH to cover gas costs
   - Seamless onboarding for new users

2. **Enhanced Game Modes**
   - Multiple bet limits tiers ($10+, $100+)
   - Increased multiplier ranges (up to 100x, 1000x)
   - Auto-bet functionality
   - Betting strategies (Martingale, Fibonacci)

3. **Advanced Features**
   - Leaderboards and player statistics
   - Daily/weekly challenges
   - Referral program
   - Social features and chat

4. **Multi-Chain Support**
   - Expand to other Starknet-based tokens (STRK, USDC, USDT)
   - Support for additional L2 networks

### Why Paymaster?

Currently, users need ETH in their custodial wallets to pay gas fees for withdrawals. With **AVNU Paymaster**, we can:

- ✅ Let users pay gas in USDC/USDT instead of ETH
- ✅ Sponsor gas fees for small transactions
- ✅ Improve onboarding (no need to buy ETH first)
- ✅ Enable truly gasless betting experience

This will significantly reduce friction for new users and improve overall UX.

---

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Starkzap SDK**: https://docs.starknet.io/build/starkzap/
- **Starknet Docs**: https://docs.starknet.io
- **Starkscan Explorer**: https://starkscan.co
- **Voyager Explorer**: https://voyager.online
- **Argent X Wallet**: https://www.argent.xyz/argent-x/
- **Braavos Wallet**: https://braavos.app

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

---

## 🙏 Acknowledgments

Built with:

- **Starkzap SDK** for seamless Starknet integration
- **AVNU Paymaster** for gasless transactions
- **Starknet** for secure Layer 2 infrastructure
- **Rive** for beautiful game animations

---

**Built with ❤️ on Starknet**

_Provably fair gaming with instant results and on-chain settlement_
