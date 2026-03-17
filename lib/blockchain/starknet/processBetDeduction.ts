import { prisma } from "@/lib/db/prisma";
import { sendToStarknetHouseWallet } from "@/lib/starknet/houseWallet";
import { getStarknetProvider } from "@/lib/starknet/provider";

/**
 * Process bet deduction on Starknet - sends ETH from user's custodial wallet to house wallet
 * This is called synchronously during bet placement to ensure funds are transferred on-chain
 */
export async function processStarknetBetDeduction(params: {
  betId: string;
  userId: string;
  encryptedPrivateKey: string;
  userWalletAddress: string;
  betAmount: string;
}): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const { betId, encryptedPrivateKey, userWalletAddress, betAmount } = params;

  try {
    console.log(`📤 Processing Starknet bet deduction for bet: ${betId}`);
    console.log(`   Amount: ${betAmount} wei`);
    console.log(`   From: ${userWalletAddress}`);

    const betAmountBigInt = BigInt(betAmount);

    // Send bet amount from user's custodial wallet to house wallet on-chain
    const txHash = await sendToStarknetHouseWallet(
      encryptedPrivateKey,
      userWalletAddress,
      betAmountBigInt
    );

    console.log(`✅ Bet transaction sent: ${txHash}`);

    // Wait for transaction confirmation
    const provider = getStarknetProvider();
    console.log(`⏳ Waiting for transaction confirmation...`);

    await provider.waitForTransaction(txHash);

    console.log(`✅ Transaction confirmed: ${txHash}`);

    // Get custodial wallet to update transaction record
    const custodialWallet = await prisma.custodialWallet.findUnique({
      where: {
        address: userWalletAddress.toLowerCase(),
      },
    });

    if (!custodialWallet) {
      throw new Error("Custodial wallet not found");
    }

    // Update existing pending bet transaction with tx hash and mark as confirmed
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
          txHash,
          status: "confirmed",
          confirmedAt: new Date(),
        },
      });
      console.log(`✅ Bet transaction record updated`);
    }

    console.log(`✅ Bet deduction completed successfully`);

    return { success: true, txHash };
  } catch (error) {
    console.error(`❌ Starknet bet deduction failed:`, error);

    // Don't update bet status here - let the calling function handle it
    // This avoids race conditions and keeps the logic centralized

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
