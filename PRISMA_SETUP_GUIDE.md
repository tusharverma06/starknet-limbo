# Prisma Database Setup Guide

## ✅ What Has Been Completed

I've successfully updated your Prisma schema to include proper user management with Farcaster identity and wallet relations. Here's what's been done:

### 1. Database Schema Updates

#### **User Model** (New)

Stores Farcaster user identity and profile information:

```prisma
model User {
  id                 String   @id @default(cuid())
  farcaster_id       String   @unique
  farcaster_username String
  farcaster_pfp      String?
  wallet_address     String?
  wallet             Wallet?
}
```

#### **Wallet Model** (Updated)

Now properly links to User with foreign key constraint:

```prisma
model Wallet {
  userId              String   @id
  address             String   @unique
  encryptedPrivateKey String
  user                User     @relation(fields: [userId], references: [id])
  transactions        WalletTransaction[]
}
```

#### **WalletTransaction Model** (Activated)

Tracks all wallet transaction history:

```prisma
model WalletTransaction {
  id          Int      @id @default(autoincrement())
  userId      String
  txHash      String
  txType      String   // 'bet', 'withdraw', 'deposit'
  status      String   // 'pending', 'confirmed', 'failed'
  wallet      Wallet   @relation(fields: [userId], references: [userId])
}
```

### 2. Updated Files

✅ **`prisma/schema.prisma`** - Complete schema with User, Wallet, and WalletTransaction models  
✅ **`lib/getOrCreateUser.ts`** - Fixed to use new User model instead of miniapp_user  
✅ **`lib/db/wallets.ts`** - Updated comments to clarify userId references  
✅ **`database/schema.sql`** - Updated PostgreSQL schema with all tables and relations  
✅ **Migration created** - `prisma/migrations/20251019161118_add_user_model_with_relations/`

### 3. Type Verification

✅ All Prisma types are correctly generated:

- `User` type exported from `@prisma/client`
- `Wallet` type with proper relations
- `WalletTransaction` type
- `prisma.user`, `prisma.wallet`, `prisma.walletTransaction` methods available

Run `npx tsx scripts/verify-types-only.ts` to verify types anytime.

## 🚀 Next Steps

### Step 1: Fix Your Database Connection

Update your `.env` file with correct database credentials:

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

For local development with PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/limbo_wallets?schema=public"
```

### Step 2: Apply the Migration

Once your database connection is working:

```bash
# Deploy the migration to your database
npx prisma migrate deploy

# Or for development (with interactive prompts)
npx prisma migrate dev
```

### Step 3: Regenerate Prisma Client

```bash
npx prisma generate
```

### Step 4: Restart Your IDE

To fix the TypeScript linter errors you're seeing:

**VS Code / Cursor:**

1. Press `Cmd + Shift + P`
2. Type "TypeScript: Restart TS Server"
3. Press Enter

Or simply reload the window: `Cmd + Shift + P` → "Developer: Reload Window"

## 📊 Database Relationships

```
┌──────────────┐
│    User      │ (Farcaster Identity)
│ - id (PK)    │
│ - farcaster_id (unique)
│ - username   │
│ - pfp        │
└──────┬───────┘
       │ 1:1
       ▼
┌──────────────┐
│   Wallet     │ (Server-side encrypted wallet)
│ - userId (PK,FK) │
│ - address    │
│ - encrypted_key │
└──────┬───────┘
       │ 1:many
       ▼
┌──────────────┐
│WalletTransaction│ (Transaction history)
│ - id (PK)    │
│ - userId (FK)│
│ - txHash     │
│ - txType     │
└──────────────┘
```

## 💻 Usage Example

### Creating a User and Wallet

```typescript
import { getOrCreateUser } from "./lib/getOrCreateUser";
import { walletDb } from "./lib/db/wallets";

// 1. Get or create user from Farcaster
const user = await getOrCreateUser("12345"); // Farcaster FID
if (!user) throw new Error("Failed to get user");

// 2. Create wallet for the user
const wallet = await walletDb.createWallet(
  user.id, // Use user.id, not FID!
  "0x1234...",
  "encrypted_private_key"
);

// 3. Query user with wallet
const userWithWallet = await prisma.user.findUnique({
  where: { farcaster_id: "12345" },
  include: {
    wallet: {
      include: {
        transactions: true,
      },
    },
  },
});
```

### Creating a Transaction

```typescript
const transaction = await prisma.walletTransaction.create({
  data: {
    userId: wallet.userId,
    txHash: "0xabc123...",
    txType: "bet",
    amount: "1000000000000000000", // 1 ETH in wei
    status: "pending",
  },
});
```

## 🔍 Verifying Everything Works

### Check Types (No DB needed)

```bash
npx tsx scripts/verify-types-only.ts
```

### Full Verification (Requires DB connection)

```bash
npx tsx scripts/verify-prisma-setup.ts
```

### Open Prisma Studio

```bash
npx prisma studio
```

## ⚠️ Important Notes

1. **User Must Exist First**: You must create a `User` record before creating a `Wallet` (enforced by foreign key)
2. **Use `user.id`, not FID**: When creating wallets, use `user.id` (the auto-generated CUID), not the Farcaster FID
3. **Always use `getOrCreateUser`**: This ensures the User exists in your database before wallet operations

## 🐛 Troubleshooting

### "Module '@prisma/client' has no exported member 'User'"

**Solution**: Restart your TypeScript language server

- The types ARE generated correctly (verified by `verify-types-only.ts`)
- Your IDE just needs to refresh its cache

### "Authentication failed against database server"

**Solution**: Update your `DATABASE_URL` in `.env` with correct credentials

### "Table 'users' doesn't exist"

**Solution**: Run the migration

```bash
npx prisma migrate deploy
```

### Migration Fails: "Foreign key constraint fails"

**Solution**: You have existing wallets without corresponding users. See the migration README:

```bash
cat prisma/migrations/20251019161118_add_user_model_with_relations/README.md
```

## 📚 Additional Resources

- **Prisma Schema**: `prisma/schema.prisma`
- **Raw SQL Schema**: `database/schema.sql`
- **Migration Files**: `prisma/migrations/`
- **Helper Functions**: `lib/getOrCreateUser.ts`
- **Wallet Database**: `lib/db/wallets.ts`

## ✨ Summary

Your database is now properly structured with:

- ✅ User model for Farcaster identity
- ✅ Wallet model linked to users
- ✅ WalletTransaction model for history
- ✅ All foreign key constraints
- ✅ Proper TypeScript types
- ✅ Migration files ready to apply

Just fix your database connection and run the migration!

