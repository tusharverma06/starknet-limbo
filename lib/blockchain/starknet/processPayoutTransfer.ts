import { prisma } from "@/lib/db/prisma";
import {
  sendFromStarknetHouseWallet,
  getStarknetHouseWalletBalance,
} from "@/lib/starknet/houseWallet";
import { getStarknetProvider } from "@/lib/starknet/provider";

/**
 * Process payout transfer on Starknet - send winnings from house wallet to user wallet
 * This is called asynchronously after a winning bet
 */
export async function processStarknetPayoutTransfer(params: {
  betId: string;
  userId: string;
  userWalletAddress: string;
  payout: string;
}): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const { betId, userWalletAddress, payout } = params;

  try {
    const payoutAmount = BigInt(payout);

    console.log(`💰 Processing Starknet payout for bet: ${betId}`);
    console.log(`   Amount: ${payout} wei`);
    console.log(`   User: ${userWalletAddress}`);

    // Check house wallet balance
    const houseBalance = await getStarknetHouseWalletBalance();
    console.log(`🏦 Starknet house wallet balance: ${houseBalance}`);

    if (houseBalance < payoutAmount) {
      console.log(`⚠️ Insufficient Starknet house balance - marking as pending payout`);
      // Mark as pending payout to be processed later
      await prisma.bet.update({
        where: { id: betId },
        data: {
          status: "pending_payout",
        },
      });
      return {
        success: false,
        error: "Insufficient house balance",
      };
    }

    // Send payout from house to user
    console.log(`📤 Sending Starknet payout from house to user...`);

    const payoutTxHash = await sendFromStarknetHouseWallet(
      userWalletAddress,
      payoutAmount,
    );

    console.log(`✅ Starknet payout transaction sent: ${payoutTxHash}`);

    // Wait for transaction confirmation
    const provider = getStarknetProvider();

    console.log(`⏳ Waiting for Starknet payout transaction confirmation...`);

    // Poll for transaction receipt
    let receipt;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (5 second intervals)

    while (attempts < maxAttempts) {
      try {
        receipt = await provider.getTransactionReceipt(payoutTxHash);
        if (receipt && 'execution_status' in receipt && receipt.execution_status === "SUCCEEDED") {
          break;
        }
      } catch {
        // Transaction not found yet, continue polling
      }

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;
    }

    if (!receipt || !('execution_status' in receipt) || receipt.execution_status !== "SUCCEEDED") {
      throw new Error("Starknet payout transaction failed or timed out");
    }

    console.log(`✅ Starknet payout transaction confirmed: ${payoutTxHash}`);

    // userWalletAddress is actually the custodial wallet address
    const custodialWallet = await prisma.custodialWallet.findUnique({
      where: {
        address: userWalletAddress.toLowerCase(),
      },
    });

    if (!custodialWallet) {
      console.error("Custodial wallet not found, cannot update payout transaction");
      return { success: true, txHash: payoutTxHash };
    }

    // Update existing pending payout transaction with tx hash
    const existingPayoutTx = await prisma.walletTransaction.findFirst({
      where: {
        custodialWalletId: custodialWallet.id,
        txType: "payout",
        status: "pending",
        txHash: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingPayoutTx) {
      await prisma.walletTransaction.update({
        where: { id: existingPayoutTx.id },
        data: {
          txHash: payoutTxHash,
          status: "confirmed",
          confirmedAt: new Date(),
          blockNumber: 'block_number' in receipt && receipt.block_number ? BigInt(receipt.block_number) : null,
        },
      });
      console.log(`✅ Payout transaction updated in database`);
    } else {
      // Fallback: create new transaction if pending one doesn't exist
      await prisma.walletTransaction.create({
        data: {
          custodialWalletId: custodialWallet.id,
          txHash: payoutTxHash,
          txType: "payout",
          amount: payout,
          status: "confirmed",
          confirmedAt: new Date(),
          blockNumber: 'block_number' in receipt && receipt.block_number ? BigInt(receipt.block_number) : null,
        },
      });
      console.log(`✅ Payout transaction created in database`);
    }

    // Update bet status to resolved (fully complete)
    await prisma.bet.update({
      where: { id: betId },
      data: {
        status: "resolved",
        txHash: payoutTxHash,
      },
    });

    console.log(`✅ Starknet payout complete for bet: ${betId}`);

    return { success: true, txHash: payoutTxHash };
  } catch (error) {
    console.error(`❌ Starknet payout failed:`, error);

    // Mark as pending payout to retry later
    await prisma.bet.update({
      where: { id: betId },
      data: {
        status: "pending_payout",
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
