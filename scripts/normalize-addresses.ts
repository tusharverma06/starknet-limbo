import { prisma } from "../lib/db/prisma";

async function normalizeAddresses() {
  console.log("🔄 Normalizing all addresses to lowercase...\n");

  // Normalize custodial wallet addresses
  const custodialWallets = await prisma.custodialWallet.findMany();
  console.log(`Found ${custodialWallets.length} custodial wallets`);

  for (const wallet of custodialWallets) {
    const normalizedAddress = wallet.address.toLowerCase();
    if (wallet.address !== normalizedAddress) {
      await prisma.custodialWallet.update({
        where: { id: wallet.id },
        data: { address: normalizedAddress },
      });
      console.log(`✅ Normalized: ${wallet.address} → ${normalizedAddress}`);
    }
  }

  // Normalize user wallet addresses
  const users = await prisma.user.findMany();
  console.log(`\nFound ${users.length} users`);

  for (const user of users) {
    const normalizedAddress = user.wallet_address.toLowerCase();
    if (user.wallet_address !== normalizedAddress) {
      await prisma.user.update({
        where: { id: user.id },
        data: { wallet_address: normalizedAddress },
      });
      console.log(`✅ Normalized: ${user.wallet_address} → ${normalizedAddress}`);
    }
  }

  // Normalize wallet addresses
  const wallets = await prisma.wallet.findMany();
  console.log(`\nFound ${wallets.length} wallets`);

  for (const wallet of wallets) {
    const normalizedAddress = wallet.address.toLowerCase();
    if (wallet.address !== normalizedAddress) {
      await prisma.wallet.update({
        where: { custodialWalletId: wallet.custodialWalletId },
        data: { address: normalizedAddress },
      });
      console.log(`✅ Normalized: ${wallet.address} → ${normalizedAddress}`);
    }
  }

  // Normalize bet playerId (custodial wallet addresses)
  const bets = await prisma.bet.findMany();
  console.log(`\nFound ${bets.length} bets`);

  for (const bet of bets) {
    const normalizedPlayerId = bet.playerId.toLowerCase();
    if (bet.playerId !== normalizedPlayerId) {
      await prisma.bet.update({
        where: { id: bet.id },
        data: { playerId: normalizedPlayerId },
      });
      console.log(`✅ Normalized bet playerId: ${bet.playerId} → ${normalizedPlayerId}`);
    }
  }

  console.log("\n✅ All addresses normalized to lowercase!");
}

normalizeAddresses()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
