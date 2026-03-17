import { prisma } from "@/lib/db/prisma";

/**
 * Process bet deduction on Starknet - for custodial wallets, no on-chain tx needed
 * This is called asynchronously after bet is placed
 *
 * NOTE: For Starknet custodial wallets, we skip on-chain bet deductions because:
 * 1. Starknet wallets are smart contracts that need deployment (expensive)
 * 2. We control custodial wallets, so database balance tracking is sufficient
 * 3. Only payouts need to be on-chain (from house wallet to user)
 */
export async function processStarknetBetDeduction(params: {
  betId: string;
  userId: string;
  encryptedPrivateKey: string;
  userWalletAddress: string;
  betAmount: string;
}): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const { betId, userWalletAddress, betAmount } = params;

  try {
    // userWalletAddress is actually the custodial wallet address
    const custodialWallet = await prisma.custodialWallet.findUnique({
      where: {
        address: userWalletAddress.toLowerCase(),
      },
      include: {
        users: {
          take: 1, // Just need one user for the custodial_wallet_id
        },
      },
    });

    if (!custodialWallet) {
      throw new Error("Custodial wallet not found");
    }

    console.log(`📤 Processing Starknet bet deduction for bet: ${betId}`);
    console.log(`   Amount: ${betAmount} wei`);
    console.log(`   ℹ️  Skipping on-chain transaction for custodial wallet (balance tracked in DB)`);

    // For custodial wallets on Starknet, we skip the on-chain transaction
    // The balance is already deducted in the database
    // We just mark the bet as deducted

    // No transaction to confirm for custodial wallets
    // Just update the bet status

    // Update existing pending bet transaction to confirmed (no txHash for custodial bets)
    const existingBetTx = await prisma.walletTransaction.findFirst({
      where: {
        custodialWalletId: custodialWallet.id,
        txType: "bet_placed",
        status: "pending",
        txHash: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingBetTx) {
      await prisma.walletTransaction.update({
        where: { id: existingBetTx.id },
        data: {
          status: "confirmed",
          confirmedAt: new Date(),
          // No txHash for custodial wallet bets (off-chain balance tracking)
        },
      });
      console.log(`✅ Bet transaction marked as confirmed in database`);
    }

    // Update bet status to show deduction complete
    await prisma.bet.update({
      where: { id: betId },
      data: {
        status: "deducted",
      },
    });

    console.log(`✅ Bet status updated to deducted`);

    return { success: true };
  } catch (error) {
    console.error(`❌ Starknet bet deduction failed:`, error);

    // Mark bet as failed
    await prisma.bet.update({
      where: { id: betId },
      data: {
        status: "failed",
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
