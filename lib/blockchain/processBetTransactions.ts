import { prisma } from "@/lib/db/prisma";
import {
  sendFromHouseWallet,
  getHouseWalletBalance,
  sendToHouseWallet,
} from "@/lib/security/houseWallet";
import { JsonRpcProvider } from "ethers";

interface ProcessBetTransactionsParams {
  betId: string;
  userId: string;
  encryptedPrivateKey: string;
  userWalletAddress: string;
  betAmount: string;
  outcome: "win" | "loss" | "lose";
  payout: string;
}

/**
 * Process blockchain transactions for a bet (bet payment + payout if win)
 * This runs independently after bet result is returned to user
 */
export async function processBlockchainTransactions({
  betId,
  userId,
  encryptedPrivateKey,
  userWalletAddress,
  betAmount,
  outcome,
  payout,
}: ProcessBetTransactionsParams): Promise<void> {
  let betTxHash: string | null = null;
  let payoutTxHash: string | null = null;

  try {
    const betAmountWei = BigInt(betAmount);

    // Step 1: Send bet amount FROM user's wallet TO house wallet
    try {
      betTxHash = await sendToHouseWallet(
        encryptedPrivateKey,
        betAmountWei
      );

      // Wait for transaction confirmation
      const rpcUrl =
        process.env.NEXT_PUBLIC_RPC_URL ||
        `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
      const provider = new JsonRpcProvider(rpcUrl);

      const receipt = await provider.waitForTransaction(betTxHash, 1);

      if (!receipt || receipt.status === 0) {
        throw new Error("Bet transaction failed on-chain");
      }

      // Record bet transaction
      await prisma.walletTransaction.create({
        data: {
          userId: userId,
          txHash: betTxHash,
          txType: "bet_placed",
          amount: betAmount,
          status: "confirmed",
          confirmedAt: new Date(),
        },
      });
    } catch (error) {
      // Update bet status to failed
      await prisma.bet.update({
        where: { id: betId },
        data: {
          status: "failed",
        },
      });
      throw error;
    }

    // Step 2: If win, send payout FROM house wallet BACK to user
    if (outcome === "win") {
      const payoutAmount = BigInt(payout);

      // Check house wallet balance
      const houseBalance = await getHouseWalletBalance();

      if (houseBalance < payoutAmount) {
        // Mark as pending payout to be processed later
        await prisma.bet.update({
          where: { id: betId },
          data: {
            status: "pending_payout",
          },
        });
        return;
      }

      try {
        payoutTxHash = await sendFromHouseWallet(
          userWalletAddress,
          payoutAmount
        );

        // Wait for transaction confirmation
        const rpcUrl =
          process.env.NEXT_PUBLIC_RPC_URL ||
          `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
        const provider = new JsonRpcProvider(rpcUrl);

        const receipt = await provider.waitForTransaction(payoutTxHash, 1);

        if (!receipt || receipt.status === 0) {
          throw new Error("Payout transaction failed on-chain");
        }

        // Record payout transaction
        await prisma.walletTransaction.create({
          data: {
            userId: userId,
            txHash: payoutTxHash,
            txType: "payout",
            amount: payout,
            status: "confirmed",
            confirmedAt: new Date(),
          },
        });
      } catch (error) {
        // Mark as pending payout to retry later
        await prisma.bet.update({
          where: { id: betId },
          data: {
            status: "pending_payout",
          },
        });
        throw error;
      }
    }

    // Step 3: Mark bet as fully resolved
    await prisma.bet.update({
      where: { id: betId },
      data: {
        status: outcome === "win" ? "resolved" : "complete",
        // IMPORTANT: Only save payout transaction hash (house → user)
        // For losses, txHash should be null since there's no payout to verify
        txHash: payoutTxHash,
      },
    });
  } catch (error) {
    throw error;
  }
}
