import { NextRequest, NextResponse } from "next/server";
import { parseEther, formatEther, JsonRpcProvider } from "ethers";
import { walletDb } from "@/lib/db/wallets";
import { getEthValueFromUsd, getEthUsdPrice } from "@/lib/utils/price";
import { MIN_BET_USD } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { generateBetResult } from "@/lib/utils/provablyFair";
import { createBetMessage, signBetMessage } from "@/lib/utils/messageSigning";
import { requireAuth } from "@/lib/auth/requireAuth";

// Import cached price for reuse
let cachedEthPrice: number | null = null;

/**
 * POST /api/wallet/place-bet
 * Place a bet using off-chain provably fair randomness
 * Returns instant results with verification data
 */
export async function POST(req: NextRequest) {
  try {
    // Require JWT authentication
    const authResult = await requireAuth(req);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult.data;

    const body = await req.json();
    const { usdBetAmount, targetMultiplier } = body;

    // Validate inputs
    if (!usdBetAmount || !targetMultiplier) {
      return NextResponse.json(
        { error: "usdBetAmount and targetMultiplier are required" },
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

    // JWT authentication already verified user and SIWE
    console.log(
      "✅ JWT authentication valid, processing bet for user:",
      user.id
    );

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

    console.log("💰 Bet amount:", betAmountWei.toString());

    // Check blockchain balance (source of truth)
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL ||
      `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    const provider = new JsonRpcProvider(rpcUrl);
    const blockchainBalance = await provider.getBalance(walletData.address);
    const lockedBalance = BigInt(walletData.lockedBalance || "0");
    const availableBalance = blockchainBalance - lockedBalance;

    console.log("💰 Blockchain balance:", blockchainBalance.toString());
    console.log("🔒 Locked balance:", lockedBalance.toString());
    console.log("✅ Available balance:", availableBalance.toString());

    // Check if user has enough AVAILABLE balance
    if (availableBalance < betAmountWei) {
      return NextResponse.json(
        {
          error: "Insufficient available balance",
          required: betAmountWei.toString(),
          available: availableBalance.toString(),
          locked: lockedBalance.toString(),
          needsToFund: (betAmountWei - availableBalance).toString(),
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

    // CRITICAL: Lock bet amount FIRST to prevent double-spending
    // Balance will be deducted on blockchain, but we lock it immediately
    console.log("🔒 Locking bet amount to prevent double-spend...");
    const currentLockedBalance = BigInt(walletData.lockedBalance || "0");
    const newLockedBalance = currentLockedBalance + betAmountWei;

    await prisma.wallet.update({
      where: { userId: user.id },
      data: {
        lockedBalance: newLockedBalance.toString(),
        lastUsed: BigInt(Date.now()),
      },
    });
    console.log("✅ Bet amount locked:", betAmountWei.toString());

    // Fire blockchain deduction in background (DON'T WAIT)
    // This sends user funds → house wallet on-chain
    console.log("🔥 Firing blockchain deduction (non-blocking)...");
    fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/wallet/deduct-bet`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-api-key": process.env.INTERNAL_API_KEY || "dev-internal-key",
        },
        body: JSON.stringify({
          betId: tempBetId,
          userId: user.id,
          encryptedPrivateKey: walletData.encryptedPrivateKey,
          userWalletAddress: walletData.address,
          betAmount: betAmountWei.toString(),
        }),
      }
    ).catch((error) => {
      console.error("❌ Failed to trigger blockchain deduction:", error);
    });

    // NOW generate provably fair result immediately (don't wait for blockchain)
    // User gets instant result, blockchain settles in background
    const result = generateBetResult(
      walletData.address.toLowerCase(),
      tempBetId,
      betAmountWei.toString(),
      targetMultiplierScaled
    );

    console.log("🎯 Result generated after deduction:", {
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

    // Create bet record (don't update balance here - blockchain is source of truth)
    const bet = await prisma.bet.create({
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
    });

    console.log("⚡ Bet record created:", {
      betId: bet.id,
      outcome: result.outcome,
      lockedAmount: betAmountWei.toString(),
    });

    // Record bet transaction immediately (before blockchain processing)
    // This ensures user sees the transaction in UI right away
    try {
      await prisma.walletTransaction.create({
        data: {
          userId: user.id,
          txHash: null, // Will be updated after blockchain confirmation
          txType: "bet_placed",
          amount: betAmountWei.toString(),
          status: "pending",
          createdAt: new Date(),
        },
      });
      console.log("✅ Bet transaction recorded (pending blockchain confirmation)");

      // If win, also record payout transaction immediately
      if (result.outcome === "win") {
        await prisma.walletTransaction.create({
          data: {
            userId: user.id,
            txHash: null, // Will be updated after blockchain confirmation
            txType: "payout",
            amount: result.payout,
            status: "pending",
            createdAt: new Date(),
          },
        });
        console.log("✅ Payout transaction recorded (pending blockchain confirmation)");
      }
    } catch (txError) {
      console.error("⚠️ Failed to record bet transaction:", txError);
      // Don't fail the bet if transaction recording fails
    }

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

    // Step 3: Trigger payout processing if win (fire and forget)
    if (result.outcome === "win") {
      fetch(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/api/wallet/process-payout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-api-key": process.env.INTERNAL_API_KEY || "dev-internal-key",
          },
          body: JSON.stringify({
            betId: bet.id,
            userId: user.id,
            userWalletAddress: walletData.address,
            payout: result.payout,
          }),
        }
      ).catch((error) => {
        console.error("❌ Failed to trigger payout processing:", error);
      });
    }

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
        verifyUrl: `/verify?betId=${bet.id}`,
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
