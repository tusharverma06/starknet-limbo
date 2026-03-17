# 🎲 Starknet Limbo

A provably fair betting game built on **Starknet** using Starkzap SDK. Connect your Starknet wallet, fund with ETH/STRK/USDC, and play instantly with gasless transactions!

**🏆 Built for the Starkzap Developer Challenge**

## 🌟 Key Features

### Starknet Integration
- **Multiple Wallet Options**
  - Browser wallets (Argent X, Braavos) with AVNU Paymaster
  - Cartridge Controller for social login + gasless transactions
- **Seamless Deposits**
  - Fund your betting wallet directly from Starknet
  - Support for ETH, STRK, USDC, USDT
  - Real-time balance updates
- **Gasless Transactions**
  - AVNU Paymaster: Pay gas in stablecoins instead of STRK
  - Cartridge: Automatic gasless transactions for gaming

### Gaming Features
- **Provably Fair**: Cryptographically verifiable randomness
- **Instant Results**: Fast gameplay with custodial wallets
- **Beautiful UI**: Polished interface with smooth Rive animations
- **Mobile-First**: Optimized for mobile and desktop

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

1. **Connect Starknet Wallet**
   - Click "Connect Wallet"
   - Select Argent X or Braavos from the wallet selector
   - Approve the connection request

2. **Sign In**
   - Click "Sign In" to authenticate
   - Sign the message in your wallet
   - Your custodial gaming wallet will be created automatically

3. **Fund Your Wallet**
   - Click your balance dropdown
   - Select "Add Funds"
   - Choose your token (ETH, STRK, USDC, or USDT)
   - Enter amount and confirm the transfer
   - Funds are transferred to your custodial wallet via Starkzap

4. **Place Bets**
   - Set your bet amount in USD
   - Choose your target multiplier (1.01x - 1000x)
   - Click "Bet your amount"
   - Watch the Rive animation and get instant results!

5. **Withdraw Anytime**
   - Click your balance dropdown
   - Select "Withdraw Funds"
   - Enter amount and destination address
   - Funds are sent back to your Starknet wallet

---

## 📁 Project Structure

```
limbo-app/
├── components/
│   ├── providers/
│   │   └── StarknetProvider.tsx       # Wallet connection + AVNU Paymaster
│   ├── ui/
│   │   ├── StarknetConnectButton.tsx  # Connection UI
│   │   ├── CartridgeConnectButton.tsx # Gasless gaming wallet
│   │   └── FundingModal.tsx           # Deposit interface
│   └── game/
│       └── MiniappGameBoard.tsx       # Main game interface
├── hooks/
│   ├── useStarknetWallet.ts           # Token transfers & balances
│   ├── useCartridgeWallet.ts          # Cartridge Controller
│   └── useServerWallet.ts             # Custodial wallet logic
├── lib/
│   └── starknet/
│       └── betting.ts                 # Token addresses & utilities
└── app/
    └── api/                           # Backend API routes
```

---

## 🔧 Tech Stack

### Starknet
- **Starkzap SDK** - Wallet abstraction & transactions
- **get-starknet-core** - Wallet detection
- **starknet.js** - Starknet library
- **AVNU Paymaster** - Gasless transactions
- **Cartridge Controller** - Social login for gaming

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Tanstack Query** - Data fetching

### Backend
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Ethers.js** - Custodial wallet management

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

## 🎯 Starkzap Integration Highlights

### 1. Browser Wallet Support

```typescript
// Connect Argent X or Braavos with AVNU Paymaster
const sdk = new StarkZap({
  network: "mainnet",
  paymaster: {
    nodeUrl: "https://starknet.paymaster.avnu.fi",
  },
});

const wallet = await sdk.connectWallet({
  account: browserWallet.account,
});
```

### 2. Cartridge Controller (Optional)

```typescript
// Social login + gasless transactions
const onboard = await sdk.onboard({
  strategy: OnboardStrategy.Cartridge,
  cartridge: {
    policies: [
      { target: mainnetTokens.ETH.address, method: "transfer" },
    ],
  },
});
```

### 3. Token Transfers

```typescript
// Transfer ETH to custodial wallet
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

- **Custodial Wallets**: Encrypted private keys
- **AVNU Paymaster**: Trusted gas abstraction
- **Starknet Native**: Built on secure L2
- **No Private Keys Client-Side**: All signing via wallet extensions

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
- **Cartridge**: https://cartridge.gg
- **Voyager Explorer**: https://voyager.online

---

## 💬 Support

- **GitHub Issues**: Report bugs and request features
- **Starknet Discord**: https://discord.com/invite/starknet-community

---

**Built with ❤️ using Starkzap SDK on Starknet**

*Provably fair gaming powered by Starknet's account abstraction and gasless transactions.*
