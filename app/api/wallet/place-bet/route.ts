import { NextRequest, NextResponse } from "next/server";
import { parseEther, formatEther } from "ethers";
import { getEthValueFromUsd, getEthUsdPrice } from "@/lib/utils/price";
import { MIN_BET_USD, MAX_BET_USD, MAX_MULTIPLIER } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { generateBetResult } from "@/lib/utils/provablyFair";
import { createBetMessage, signBetMessage } from "@/lib/utils/messageSigning";
import { requireAuth } from "@/lib/auth/requireAuth";
import { processStarknetBetDeduction } from "@/lib/blockchain/starknet/processBetDeduction";
import { processStarknetPayoutTransfer } from "@/lib/blockchain/starknet/processPayoutTransfer";
import { getStarknetProvider } from "@/lib/starknet/provider";
// import { validateBet, getBankrollLimits } from "@/lib/utils/bankrollManagement";

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

    const { user, body: parsedBody } = authResult.data;

    // Use body from auth if available, otherwise parse it
    const body = parsedBody || (await req.json());
    const { usdBetAmount, targetMultiplier, address } = body;

    // Validate inputs
    if (!usdBetAmount || !targetMultiplier) {
      return NextResponse.json(
        { error: "usdBetAmount and targetMultiplier are required" },
        { status: 400 },
      );
    }

    // Validate bet amount
    const usdAmountNum = parseFloat(usdBetAmount);
    if (isNaN(usdAmountNum) || usdAmountNum <= 0) {
      return NextResponse.json(
        { error: "Invalid USD bet amount" },
        { status: 400 },
      );
    }

    // Check minimum bet requirement
    if (usdAmountNum < MIN_BET_USD) {
      return NextResponse.json(
        { error: `Minimum bet is $${MIN_BET_USD} USD` },
        { status: 400 },
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
        { status: 400 },
      );
    }

    // Validate ETH amount is reasonable
    const minimumReasonableEth = 0.000001;
    if (ethAmount < minimumReasonableEth) {
      console.error(
        "⚠️ Suspiciously low ETH amount. Price conversion may have failed.",
        { usdAmount: usdAmountNum, ethAmount, minimumReasonableEth },
      );
      return NextResponse.json(
        {
          error: "Price conversion failed",
          message:
            "Unable to get accurate ETH price. Please try again in a moment.",
        },
        { status: 500 },
      );
    }

    // Validate multiplier
    const multiplierNum = parseFloat(targetMultiplier);
    if (isNaN(multiplierNum) || multiplierNum < 1.01) {
      return NextResponse.json(
        { error: "Invalid target multiplier" },
        { status: 400 },
      );
    }

    // JWT authentication already verified user and SIWE
    console.log(
      "✅ JWT authentication valid, processing bet for user:",
      user.id,
    );

    const userCustodialWallet = await prisma.user.findUnique({
      where: {
        wallet_address: (address as string).toLowerCase(),
      },
      select: {
        custodial_wallet_id: true,
        custodialWallet: {
          select: {
            address: true,
            wallet: true,
            id: true,
          },
        },
      },
    });
    console.log(userCustodialWallet, address);

    if (
      !userCustodialWallet?.custodial_wallet_id ||
      !userCustodialWallet.custodialWallet.wallet
    ) {
      return NextResponse.json(
        { error: "Wallet not found. Please create a wallet first." },
        { status: 404 },
      );
    }

    // Convert bet amount to wei
    const ethAmountRounded = parseFloat(ethAmount.toFixed(18));
    const betAmountWei = parseEther(ethAmountRounded.toString());

    console.log("💰 Bet amount:", betAmountWei.toString());

    // Simple validation: Max bet and max multiplier
    if (usdAmountNum > MAX_BET_USD) {
      return NextResponse.json(
        {
          error: "Bet exceeds maximum",
          message: `Maximum bet allowed is $${MAX_BET_USD}`,
        },
        { status: 400 },
      );
    }

    if (multiplierNum > MAX_MULTIPLIER) {
      return NextResponse.json(
        {
          error: "Multiplier exceeds maximum",
          message: `Maximum multiplier allowed is ${MAX_MULTIPLIER}x`,
        },
        { status: 400 },
      );
    }

    // COMMENTED OUT: Bankroll validation (will be re-enabled later)
    // console.log("🏦 Validating bet against house bankroll limits...");
    // const betValidation = await validateBet(betAmountWei, multiplierNum);
    //
    // if (!betValidation.allowed) {
    //   console.log("❌ Bet rejected:", betValidation.reason);
    //
    //   // Get current limits for error message
    //   const limits = await getBankrollLimits();
    //
    //   return NextResponse.json(
    //     {
    //       error: "Bet exceeds bankroll limits",
    //       message: betValidation.reason,
    //       limits: {
    //         maxBet: formatEther(limits.maxBet),
    //         maxPayout: formatEther(limits.maxPayout),
    //         houseBalance: formatEther(limits.houseBalance),
    //       },
    //     },
    //     { status: 400 },
    //   );
    // }
    //
    // console.log("✅ Bet validated against bankroll limits");

    // Check Starknet blockchain balance (source of truth)
    const custodialAddress = userCustodialWallet.custodialWallet.address;

    console.log("📊 Checking Starknet balance for bet...");

    const provider = getStarknetProvider();
    const ethContractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

    const balance = await provider.callContract({
      contractAddress: ethContractAddress,
      entrypoint: "balanceOf",
      calldata: [custodialAddress],
    });

    const balanceLow = BigInt(balance[0]);
    const balanceHigh = BigInt(balance[1] || 0);
    const blockchainBalance = balanceLow + (balanceHigh << BigInt(128));

    const availableBalance = blockchainBalance;

    console.log("💰 Blockchain balance:", blockchainBalance.toString());
    console.log("✅ Available balance:", availableBalance.toString());

    // Check if user has enough AVAILABLE balance
    if (availableBalance < betAmountWei) {
      return NextResponse.json(
        {
          error: "Insufficient available balance",
          required: betAmountWei.toString(),
          available: availableBalance.toString(),
          needsToFund: (betAmountWei - availableBalance).toString(),
        },
        { status: 400 },
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

    // Process Starknet blockchain deduction in background (DON'T WAIT)
    // This sends user funds → house wallet on Starknet
    console.log("🔥 Processing Starknet blockchain deduction (non-blocking)...");

    processStarknetBetDeduction({
      betId: tempBetId,
      userId: user.id,
      encryptedPrivateKey:
        userCustodialWallet.custodialWallet.wallet?.encryptedPrivateKey,
      userWalletAddress: userCustodialWallet.custodialWallet.address,
      betAmount: betAmountWei.toString(),
    }).catch(async (error) => {
      console.error("❌ Blockchain deduction failed:", error);
      // Mark pending bet transaction as failed
      try {
        await prisma.walletTransaction.updateMany({
          where: {
            custodialWalletId: userCustodialWallet.custodialWallet.id,
            txType: "bet_placed",
            status: "pending",
            txHash: null,
          },
          data: { status: "failed" },
        });
      } catch (updateError) {
        console.error("❌ Failed to update transaction status:", updateError);
      }
    });

    // NOW generate provably fair result immediately (don't wait for blockchain)
    // User gets instant result, blockchain settles in background
    const result = generateBetResult(
      userCustodialWallet.custodialWallet.address.toLowerCase(),
      tempBetId,
      betAmountWei.toString(),
      targetMultiplierScaled,
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
        playerId: userCustodialWallet.custodialWallet.address.toLowerCase(),
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
          custodialWalletId: userCustodialWallet.custodialWallet.id,
          txHash: null, // Will be updated after blockchain confirmation
          txType: "bet_placed",
          amount: betAmountWei.toString(),
          status: "pending",
          createdAt: new Date(),
        },
      });
      console.log(
        "✅ Bet transaction recorded (pending blockchain confirmation)",
      );

      // If win, also record payout transaction immediately
      if (result.outcome === "win") {
        await prisma.walletTransaction.create({
          data: {
            custodialWalletId: userCustodialWallet.custodialWallet.id,
            txHash: null, // Will be updated after blockchain confirmation
            txType: "payout",
            amount: result.payout,
            status: "pending",
            createdAt: new Date(),
          },
        });
        console.log(
          "✅ Payout transaction recorded (pending blockchain confirmation)",
        );
      }
    } catch (txError) {
      console.error("⚠️ Failed to record bet transaction:", txError);
      // Don't fail the bet if transaction recording fails
    }

    // Sign bet message AFTER returning response (non-critical path)
    // We'll update the signature in background
    signBetMessage(
      betMessage,
      userCustodialWallet?.custodialWallet?.wallet?.encryptedPrivateKey,
      userCustodialWallet?.custodialWallet?.address, // Pass wallet address to detect Starknet
    )
      .then(async (signature) => {
        await prisma.bet.update({
          where: { id: bet.id },
          data: { betSignature: signature },
        });
        console.log("✍️ Bet signature added in background");
      })
      .catch((err) => console.error("⚠️ Failed to add signature:", err));

    console.log(
      "⚡ Returning instant result to user (blockchain processing in background)",
    );

    // Step 3: Process Starknet payout if win (fire and forget)
    if (result.outcome === "win") {
      processStarknetPayoutTransfer({
        betId: bet.id,
        userId: user.id,
        userWalletAddress: userCustodialWallet.custodialWallet.address,
        payout: result.payout,
      }).catch(async (error) => {
        console.error("❌ Payout processing failed:", error);
        // Mark pending payout transaction as failed
        try {
          await prisma.walletTransaction.updateMany({
            where: {
              custodialWalletId: userCustodialWallet.custodialWallet.id,
              txType: "payout",
              status: "pending",
              txHash: null,
            },
            data: { status: "failed" },
          });
        } catch (updateError) {
          console.error(
            "❌ Failed to update payout transaction status:",
            updateError,
          );
        }
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
      { status: 500 },
    );
  }
}
