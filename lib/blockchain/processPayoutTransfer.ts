import { prisma } from "@/lib/db/prisma";
import {
  sendFromHouseWallet,
  getHouseWalletBalance,
} from "@/lib/security/houseWallet";
import { JsonRpcProvider } from "ethers";

/**
 * Process payout transfer - send winnings from house wallet to user wallet
 * This is called asynchronously after a winning bet
 */
export async function processPayoutTransfer(params: {
  betId: string;
  userId: string;
  userWalletAddress: string;
  payout: string;
}): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const { betId, userWalletAddress, payout } = params;

  try {
    const payoutAmount = BigInt(payout);

    console.log(`💰 Processing payout for bet: ${betId}`);
    console.log(`   Amount: ${payout} wei`);
    console.log(`   User: ${userWalletAddress}`);

    // Check house wallet balance
    const houseBalance = await getHouseWalletBalance();
    console.log(`🏦 House wallet balance: ${houseBalance}`);

    if (houseBalance < payoutAmount) {
      console.log(`⚠️ Insufficient house balance - marking as pending payout`);
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
    console.log(`📤 Sending payout from house to user...`);

    const payoutTxHash = await sendFromHouseWallet(
      userWalletAddress,
      payoutAmount,
    );

    console.log(`✅ Payout transaction sent: ${payoutTxHash}`);

    // Wait for transaction confirmation
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL ||
      `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    const provider = new JsonRpcProvider(rpcUrl);

    console.log(`⏳ Waiting for payout transaction confirmation...`);
    const receipt = await provider.waitForTransaction(payoutTxHash, 1);

    if (!receipt || receipt.status === 0) {
      throw new Error("Payout transaction failed on-chain");
    }

    console.log(`✅ Payout transaction confirmed: ${payoutTxHash}`);

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
          blockNumber: receipt?.blockNumber
            ? BigInt(receipt.blockNumber)
            : null,
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
          blockNumber: receipt?.blockNumber
            ? BigInt(receipt.blockNumber)
            : null,
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

    console.log(`✅ Payout complete for bet: ${betId}`);

    return { success: true, txHash: payoutTxHash };
  } catch (error) {
    console.error(`❌ Payout failed:`, error);

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
