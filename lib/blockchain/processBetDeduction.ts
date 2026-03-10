import { prisma } from "@/lib/db/prisma";
import { sendToHouseWallet } from "@/lib/security/houseWallet";
import { JsonRpcProvider } from "ethers";

/**
 * Process bet deduction - send funds from user wallet to house wallet
 * This is called asynchronously after bet is placed
 */
export async function processBetDeduction(params: {
  betId: string;
  userId: string;
  encryptedPrivateKey: string;
  userWalletAddress: string;
  betAmount: string;
}): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const { betId, encryptedPrivateKey, userWalletAddress, betAmount } = params;

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

    const betAmountWei = BigInt(betAmount);

    console.log(`📤 Processing bet deduction for bet: ${betId}`);
    console.log(`   Amount: ${betAmount} wei`);

    // Send bet amount FROM user's wallet TO house wallet
    const betTxHash = await sendToHouseWallet(encryptedPrivateKey, betAmountWei);

    console.log(`✅ Bet deduction transaction sent: ${betTxHash}`);

    // Wait for transaction confirmation
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL ||
      `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    const provider = new JsonRpcProvider(rpcUrl);

    console.log(`⏳ Waiting for bet deduction confirmation...`);
    const receipt = await provider.waitForTransaction(betTxHash, 1);

    if (!receipt || receipt.status === 0) {
      throw new Error("Bet deduction transaction failed on-chain");
    }

    console.log(`✅ Bet deduction confirmed: ${betTxHash}`);

    // Update existing pending bet transaction with tx hash
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
          custodialWalletId: custodialWallet.id,
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

    // Update bet status to show blockchain deduction complete
    await prisma.bet.update({
      where: { id: betId },
      data: {
        status: "deducted",
      },
    });

    return { success: true, txHash: betTxHash };
  } catch (error) {
    console.error(`❌ Bet deduction failed:`, error);

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
