import { NextRequest, NextResponse } from "next/server";
import { parseEther, formatEther } from "ethers";
import { walletDb } from "@/lib/db/wallets";
import { getEthValueFromUsd, getEthUsdPrice } from "@/lib/utils/price";
import { MIN_BET_USD } from "@/lib/constants";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/db/prisma";
import { generateBetResult } from "@/lib/utils/provablyFair";
import {
  sendFromHouseWallet,
  getHouseWalletBalance,
  sendToHouseWallet,
} from "@/lib/security/houseWallet";
import { createBetMessage, signBetMessage } from "@/lib/utils/messageSigning";

// Import cached price for reuse
let cachedEthPrice: number | null = null;

/**
 * Process blockchain transactions in the background
 * This runs asynchronously after returning the bet result to the user
 */
async function processBlockchainTransactions(
  betId: string,
  userId: string,
  encryptedPrivateKey: string,
  userWalletAddress: string,
  betAmount: bigint,
  outcome: string,
  payout: string
) {
  let betTxHash: string | null = null;
  let payoutTxHash: string | null = null;

  try {
    console.log(
      "🔄 [Background] Starting blockchain transaction processing for bet:",
      betId
    );

    // Step 1: Send bet amount FROM user's wallet TO house wallet
    try {
      betTxHash = await sendToHouseWallet(encryptedPrivateKey, betAmount);
      console.log("✅ [Background] Bet sent to house wallet:", betTxHash);

      // Record bet transaction
      await prisma.walletTransaction.create({
        data: {
          userId: userId,
          txHash: betTxHash,
          txType: "bet_placed",
          amount: betAmount.toString(),
          status: "confirmed",
          confirmedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(
        "❌ [Background] Failed to send bet to house wallet:",
        error
      );
      // Update bet status to failed
      await prisma.bet.update({
        where: { id: betId },
        data: {
          status: "failed",
          // No txHash for failed bets
        },
      });
      throw error;
    }

    // Step 2: If win, send payout FROM house wallet BACK to user
    if (outcome === "win") {
      const payoutAmount = BigInt(payout);

      console.log(
        "💰 [Background] User won! Sending payout from house wallet:",
        {
          to: userWalletAddress,
          amount: payoutAmount.toString(),
        }
      );

      // Check house wallet balance
      const houseBalance = await getHouseWalletBalance();
      console.log(
        "🏦 [Background] House wallet balance:",
        houseBalance.toString()
      );

      if (houseBalance < payoutAmount) {
        console.error(
          "❌ [Background] Insufficient house wallet balance for payout"
        );
        // Mark as pending payout to be processed later
        await prisma.bet.update({
          where: { id: betId },
          data: {
            status: "pending_payout",
            // Don't set txHash yet - will be set when payout is actually sent
          },
        });
        return;
      }

      try {
        payoutTxHash = await sendFromHouseWallet(
          userWalletAddress,
          payoutAmount
        );
        console.log("✅ [Background] Payout sent to user:", payoutTxHash);

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
        console.error("❌ [Background] Failed to send payout:", error);
        // Mark as pending payout to retry later
        await prisma.bet.update({
          where: { id: betId },
          data: {
            status: "pending_payout",
            // Don't set txHash yet - will be set when payout is actually sent
          },
        });
        throw error;
      }
    }

    // Step 3: Mark bet as fully resolved
    console.log("✅ [Background] Bet fully resolved:", {
      betId,
      outcome,
      betTxHash,
      payoutTxHash,
    });

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
    console.error("❌ [Background] Blockchain processing error:", error);
    // Error status already updated in individual catch blocks
  }
}

/**
 * POST /api/wallet/place-bet
 * Place a bet using off-chain provably fair randomness
 * Returns instant results with verification data
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, usdBetAmount, targetMultiplier } = body;

    // Validate inputs
    if (!userId || !usdBetAmount || !targetMultiplier) {
      return NextResponse.json(
        { error: "userId, usdBetAmount, and targetMultiplier are required" },
        { status: 400 }
      );
    }

    // Validate bet amount
    const usdAmountNum = parseFloat(usdBetAmount);
    if (isNaN(usdAmountNum) || usdAmountNum <= 0) {
      return NextResponse.json(
        { error: "Invalid USD bet amount" },
        { status: 400 }
      );
    }

    // Check minimum bet requirement
    if (usdAmountNum < MIN_BET_USD) {
      return NextResponse.json(
        { error: `Minimum bet is $${MIN_BET_USD} USD` },
        { status: 400 }
      );
    }

    // Convert USD to ETH (uses cached price internally)
    console.log("💵 USD bet amount:", usdAmountNum);
    const ethAmount = await getEthValueFromUsd(usdAmountNum);

    // Store the price that was used for this conversion
    cachedEthPrice = await getEthUsdPrice();

    console.log("💎 ETH amount after conversion:", ethAmount);

    if (ethAmount <= 0) {
      return NextResponse.json(
        { error: "Failed to convert USD to ETH" },
        { status: 400 }
      );
    }

    // Validate ETH amount is reasonable
    const minimumReasonableEth = 0.000001;
    if (ethAmount < minimumReasonableEth) {
      console.error(
        "⚠️ Suspiciously low ETH amount. Price conversion may have failed.",
        { usdAmount: usdAmountNum, ethAmount, minimumReasonableEth }
      );
      return NextResponse.json(
        {
          error: "Price conversion failed",
          message:
            "Unable to get accurate ETH price. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    // Validate multiplier
    const multiplierNum = parseFloat(targetMultiplier);
    if (isNaN(multiplierNum) || multiplierNum < 1.01) {
      return NextResponse.json(
        { error: "Invalid target multiplier" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getOrCreateUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Failed to get or create user" },
        { status: 500 }
      );
    }

    // Enforce SIWE authorization - REQUIRED for all bets
    if (!user.siweSignature || !user.siweMessage || !user.siweExpiresAt) {
      console.error("❌ Bet rejected: Missing SIWE signature");
      return NextResponse.json(
        { error: "Authorization required. Please sign in with your wallet." },
        { status: 401 }
      );
    }

    // Check if SIWE signature has expired
    const now = new Date();
    const expiresAt = new Date(user.siweExpiresAt);
    if (now > expiresAt) {
      console.error(
        "❌ Bet rejected: SIWE signature expired:",
        user.siweExpiresAt
      );
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    console.log("✅ SIWE authorization valid, processing bet...");

    // Get wallet from database
    const walletData = await walletDb.getWallet(user.id);
    if (!walletData) {
      return NextResponse.json(
        { error: "Wallet not found. Please create a wallet first." },
        { status: 404 }
      );
    }

    // Convert bet amount to wei
    const ethAmountRounded = parseFloat(ethAmount.toFixed(18));
    const betAmountWei = parseEther(ethAmountRounded.toString());

    console.log("💰 Wallet balance:", walletData.balance);
    console.log("💰 Bet amount:", betAmountWei.toString());

    // Check wallet balance
    const balance = BigInt(walletData.balance || "0");
    if (balance < betAmountWei) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          required: betAmountWei.toString(),
          available: balance.toString(),
          needsToFund: (betAmountWei - balance).toString(),
        },
        { status: 400 }
      );
    }

    // Convert multiplier to contract format (x100)
    const targetMultiplierScaled = Math.floor(multiplierNum * 100).toString();

    // Use cached ETH price (already fetched during conversion)
    const ethPriceUsd = cachedEthPrice || (await getEthUsdPrice());
    console.log("💵 Current ETH/USD price:", ethPriceUsd);

    // Generate unique bet ID before DB insert (using timestamp + random)
    const tempBetId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Generate provably fair result BEFORE creating DB record
    // This saves one DB roundtrip in the critical path
    const result = generateBetResult(
      walletData.address.toLowerCase(),
      tempBetId,
      betAmountWei.toString(),
      targetMultiplierScaled
    );

    console.log("🎯 Result generated before DB insert:", {
      outcome: result.outcome,
      limboMultiplier: (Number(result.limboMultiplier) / 100).toFixed(2),
    });

    // Calculate payout in USD for verification
    const payoutEth = parseFloat(formatEther(result.payout));
    const payoutUsd = (payoutEth * ethPriceUsd).toString();

    // Create bet message for verification (non-blocking prep)
    const betMessage = createBetMessage({
      betId: tempBetId,
      wager: betAmountWei.toString(),
      targetMultiplier: targetMultiplierScaled,
      serverSeedHash: result.serverSeedHash,
      timestamp: Date.now(),
    });

    // Calculate balances
    const newBalance = balance - betAmountWei;
    const finalBalance =
      result.outcome === "win"
        ? newBalance + BigInt(result.payout)
        : newBalance;

    // CRITICAL OPTIMIZATION: Batch all DB operations in ONE transaction
    // This reduces DB roundtrips from 3+ to just 1
    const [bet] = await prisma.$transaction([
      // 1. Create bet with full data in one shot
      prisma.bet.create({
        data: {
          id: tempBetId,
          userId: user.id,
          playerId: walletData.address.toLowerCase(),
          wager: betAmountWei.toString(),
          targetMultiplier: targetMultiplierScaled,
          serverSeedHash: result.serverSeedHash,
          serverSeed: result.serverSeed,
          randomValue: result.randomValue,
          gameNumber: result.gameNumber,
          limboMultiplier: result.limboMultiplier,
          outcome: result.outcome,
          payout: result.payout,
          payoutUsd: payoutUsd,
          status: "processing",
          betMessage: betMessage,
          ethPriceUsd: ethPriceUsd.toString(),
          wagerUsd: usdAmountNum.toString(),
          resolvedAt: new Date(),
        },
      }),
      // 2. Update wallet balance in same transaction
      prisma.wallet.update({
        where: { userId: user.id },
        data: {
          balance: finalBalance.toString(),
          lastUsed: BigInt(Date.now()),
        },
      }),
    ]);

    console.log("⚡ DB transaction completed in single batch:", {
      betId: bet.id,
      outcome: result.outcome,
      balanceUpdated: finalBalance.toString(),
    });

    // Sign bet message AFTER returning response (non-critical path)
    // We'll update the signature in background
    signBetMessage(betMessage, walletData.encryptedPrivateKey)
      .then(async (signature) => {
        await prisma.bet.update({
          where: { id: bet.id },
          data: { betSignature: signature },
        });
        console.log("✍️ Bet signature added in background");
      })
      .catch((err) => console.error("⚠️ Failed to add signature:", err));

    console.log(
      "⚡ Returning instant result to user (blockchain processing in background)"
    );

    // Step 3: Process blockchain transactions asynchronously
    // Don't await this - let it run in the background
    processBlockchainTransactions(
      bet.id,
      user.id,
      walletData.encryptedPrivateKey,
      walletData.address,
      betAmountWei,
      result.outcome,
      result.payout
    ).catch((error) => {
      console.error("❌ Background blockchain processing failed:", error);
      // Errors are handled within the function and bet status is updated accordingly
    });

    return NextResponse.json({
      success: true,
      betId: bet.id,
      serverSeedHash: result.serverSeedHash,
      result: {
        win: result.outcome === "win",
        limboMultiplier: Number(result.limboMultiplier) / 100,
        payout: result.payout,
        payoutInUsd: parseFloat(payoutUsd),
        gameNumber: result.gameNumber,
        amount: betAmountWei.toString(),
        targetMultiplier: multiplierNum,
      },
      verification: {
        canVerify: true,
        verifyUrl: `/api/verify?betId=${bet.id}`,
      },
      balance: {
        previous: balance.toString(),
        current: finalBalance.toString(),
        locked: "0",
        payout: result.outcome === "win" ? result.payout : "0",
      },
      // Indicate that blockchain transactions are processing in background
      processing: {
        status: "processing",
        message:
          "Blockchain transactions are being processed in the background",
        betStatus: "processing",
      },
      usdBetAmount: usdAmountNum,
      ethAmount: ethAmountRounded,
    });
  } catch (error) {
    console.error("Place bet error:", error);
    return NextResponse.json(
      {
        error: "Bet placement failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
