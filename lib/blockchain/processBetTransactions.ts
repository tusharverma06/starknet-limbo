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

  console.log(`📦 Processing bet ${betId} - outcome: ${outcome}`);

  try {
    const betAmountWei = BigInt(betAmount);

    // Step 1: Send bet amount FROM user's wallet TO house wallet
    try {
      console.log(`📤 Sending bet from user to house wallet: {
  from: '${userWalletAddress}',
  to: 'house wallet',
  amount: '${betAmount}'
}`);

      betTxHash = await sendToHouseWallet(encryptedPrivateKey, betAmountWei);

      console.log(`✅ Bet transaction sent: ${betTxHash}`);

      // Wait for transaction confirmation
      const rpcUrl =
        process.env.NEXT_PUBLIC_RPC_URL ||
        `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
      const provider = new JsonRpcProvider(rpcUrl);

      console.log(`⏳ Waiting for bet transaction confirmation...`);
      const receipt = await provider.waitForTransaction(betTxHash, 1);

      if (!receipt || receipt.status === 0) {
        throw new Error("Bet transaction failed on-chain");
      }

      console.log(`✅ Bet transaction confirmed: ${betTxHash}`);

      // Update existing pending bet transaction with tx hash
      const existingBetTx = await prisma.walletTransaction.findFirst({
        where: {
          userId: userId,
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
            txHash: betTxHash,
            status: "confirmed",
            confirmedAt: new Date(),
            blockNumber: receipt?.blockNumber
              ? BigInt(receipt.blockNumber)
              : null,
          },
        });
        console.log(`✅ Bet transaction updated in database`);
      } else {
        // Fallback: create new transaction if pending one doesn't exist
        await prisma.walletTransaction.create({
          data: {
            userId: userId,
            txHash: betTxHash,
            txType: "bet_placed",
            amount: betAmount,
            status: "confirmed",
            confirmedAt: new Date(),
            blockNumber: receipt?.blockNumber
              ? BigInt(receipt.blockNumber)
              : null,
          },
        });
        console.log(`✅ Bet transaction created in database`);
      }
    } catch (error) {
      console.error(`❌ Bet transaction failed:`, error);
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

      console.log(`💰 Win detected - preparing payout of ${payout} wei`);

      // Check house wallet balance
      const houseBalance = await getHouseWalletBalance();

      console.log(`🏦 House wallet balance: ${houseBalance}`);

      if (houseBalance < payoutAmount) {
        console.log(
          `⚠️ Insufficient house balance - marking as pending payout`
        );
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
        console.log(
          `📤 Sending payout from house to user: ${userWalletAddress}`
        );

        payoutTxHash = await sendFromHouseWallet(
          userWalletAddress,
          payoutAmount
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

        // Update existing pending payout transaction with tx hash
        const existingPayoutTx = await prisma.walletTransaction.findFirst({
          where: {
            userId: userId,
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
              userId: userId,
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
      } catch (error) {
        console.error(`❌ Payout transaction failed:`, error);
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
    console.log(
      `✅ Updating bet status to ${outcome === "win" ? "resolved" : "complete"}`
    );

    await prisma.bet.update({
      where: { id: betId },
      data: {
        status: outcome === "win" ? "resolved" : "complete",
        // IMPORTANT: Only save payout transaction hash (house → user)
        // For losses, txHash should be null since there's no payout to verify
        txHash: payoutTxHash,
      },
    });

    console.log(`✅ Bet ${betId} processing completed successfully`);
  } catch (error) {
    console.error(`❌ Error processing bet ${betId}:`, error);
    throw error;
  }
}
