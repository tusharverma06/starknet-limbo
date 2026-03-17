# 🎲 Starknet Limbo

A provably fair betting game built on **Starknet** using Starkzap SDK. Connect your Starknet wallet, fund with ETH/STRK/USDC, and play instantly with gasless transactions!

**🏆 Built for the Starkzap Developer Challenge**

## 🌟 Key Features

- **Starknet Wallet Integration**: Connect with Argent X or Braavos
- **Gasless Deposits**: Pay gas fees in USDC/USDT via AVNU Paymaster
- **Multiple Tokens**: Fund with ETH, STRK, USDC, or USDT
- **Instant Gameplay**: Fast betting with custodial wallets
- **Provably Fair**: Cryptographically verifiable randomness
- **Beautiful UI**: Smooth Rive animations and polished interface
- **Mobile Optimized**: Works seamlessly on all devices

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Starknet wallet (Argent X or Braavos)
- Starknet mainnet funds (ETH, STRK, USDC, or USDT)
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/limbo-app
cd limbo-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and encryption key

# Run database migrations
pnpm db:migrate

# Run development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🎮 How to Play

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Approve connection in Argent X or Braavos

2. **Sign In**
   - Click "Sign In"
   - Sign the authentication message
   - Your custodial wallet is created automatically

3. **Fund Your Wallet**
   - Click your balance → "Add Funds"
   - Choose token (ETH, STRK, USDC, or USDT)
   - Enter amount and confirm transfer
   - Funds arrive instantly via AVNU Paymaster

4. **Place Bets**
   - Set bet amount in USD
   - Choose target multiplier (1.01x - 1000x)
   - Click "Bet your amount"
   - Watch the animation and see results instantly!

5. **Withdraw**
   - Click balance → "Withdraw Funds"
   - Enter amount
   - Funds sent back to your Starknet wallet

---

## 📁 Project Structure

```
limbo-app/
├── components/
│   ├── providers/
│   │   └── StarknetProvider.tsx       # Wallet connection + AVNU Paymaster
│   ├── ui/
│   │   ├── FundingModal.tsx           # Deposit interface
│   │   └── WithdrawModal.tsx          # Withdrawal interface
│   └── game/
│       └── MiniappGameBoard.tsx       # Main game interface
├── hooks/
│   ├── useStarknetWallet.ts           # Token transfers & balances
│   ├── useServerWallet.ts             # Custodial wallet operations
│   └── useSession.ts                  # Wallet authentication (SIWE)
├── lib/
│   └── starknet/
│       └── betting.ts                 # Token addresses & utilities
└── app/
    └── api/                           # Backend API routes
```

---

## 🔧 Tech Stack

### Starknet
- **Starkzap SDK** - Wallet integration & token transfers
- **get-starknet-core** - Wallet detection (Argent X, Braavos)
- **starknet.js** - Starknet blockchain interactions
- **AVNU Paymaster** - Gasless transactions (pay gas in stablecoins)

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Rive** - Game animations

### Backend
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Custodial Wallets** - Encrypted wallet management

---

## 🛠️ Development

### Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://..."

# Wallet Encryption
WALLET_ENCRYPTION_KEY="your-256-bit-key"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm type-check   # TypeScript type checking
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio
```

---

## 🎯 Starkzap Integration

### 1. Initialize SDK with AVNU Paymaster

```typescript
const sdk = new StarkZap({
  network: "mainnet",
  paymaster: {
    nodeUrl: "https://starknet.paymaster.avnu.fi",
  },
});
```

### 2. Connect Browser Wallet

```typescript
import { getStarknet } from "get-starknet-core";

const starknetManager = getStarknet();
const availableWallets = await starknetManager.getAvailableWallets();
const connectedWallet = await starknetManager.enable(availableWallets[0]);
```

### 3. Transfer Tokens to Custodial Wallet

```typescript
await wallet.transfer(mainnetTokens.ETH, [
  { to: custodialAddress, amount: Amount.parse("0.1", mainnetTokens.ETH) }
]);
```

---

## 📚 Documentation

- **[HACKATHON_SUBMISSION.md](./HACKATHON_SUBMISSION.md)** - Detailed hackathon submission
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing instructions
- **[STARKZAP_FIXES_SUMMARY.md](./STARKZAP_FIXES_SUMMARY.md)** - Implementation details

---

## 🌐 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Production Checklist

- [ ] Update `NEXT_PUBLIC_APP_URL`
- [ ] Set secure `WALLET_ENCRYPTION_KEY`
- [ ] Configure PostgreSQL database
- [ ] Test wallet connections on mainnet
- [ ] Verify transactions on Voyager

---

## 🔒 Security

- **Encrypted Custodial Wallets**: Private keys encrypted at rest
- **SIWE Authentication**: Sign-In with Ethereum for wallet verification
- **AVNU Paymaster**: Trusted gas abstraction service
- **No Private Keys Client-Side**: All signing via browser wallet extensions
- **Starknet L2**: Built on secure Layer 2 infrastructure

---

## 🐛 Troubleshooting

### Wallet Not Connecting
- Install Argent X: https://www.argent.xyz/argent-x/
- Make sure wallet is unlocked
- Try refreshing the page

### Transaction Failed
- Check you have enough balance
- Verify network (mainnet vs sepolia)
- Check transaction on [Voyager](https://voyager.online)

### Build Errors
```bash
rm -rf .next
pnpm install
pnpm build
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Run `pnpm type-check`
5. Submit a PR

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

---

## 🔗 Links

- **Starkzap SDK**: https://docs.starknet.io/build/starkzap/
- **Starknet Docs**: https://docs.starknet.io
- **AVNU Paymaster**: https://docs.avnu.fi
- **Argent X Wallet**: https://www.argent.xyz/argent-x/
- **Voyager Explorer**: https://voyager.online

---

## 💬 Support

- **GitHub Issues**: Report bugs and request features
- **Starknet Discord**: https://discord.com/invite/starknet-community

---

**Built with ❤️ using Starkzap SDK on Starknet**

*Provably fair gaming powered by Starknet's account abstraction and gasless transactions.*
