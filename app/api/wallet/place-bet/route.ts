import { NextRequest, NextResponse } from "next/server";
import { parseEther, formatEther } from "ethers";
import { getEthValueFromUsd, getEthUsdPrice } from "@/lib/utils/price";
import { MIN_BET_USD, MAX_BET_USD, MAX_MULTIPLIER, RATE_LIMITS } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { generateBetResult } from "@/lib/utils/provablyFair";
import { createBetMessage, signBetMessage } from "@/lib/utils/messageSigning";
import { requireAuth } from "@/lib/auth/requireAuth";
import { processStarknetBetDeduction } from "@/lib/blockchain/starknet/processBetDeduction";
import { processStarknetPayoutTransfer } from "@/lib/blockchain/starknet/processPayoutTransfer";
import { getStarknetProvider } from "@/lib/starknet/provider";
import { checkRateLimit } from "@/lib/utils/rateLimiter";
import { logSecurityEvent } from "@/lib/utils/securityLogger";
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

    // Get IP address for rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const clientIp = typeof ip === "string" ? ip.split(",")[0].trim() : ip;

    // Validate inputs
    if (!usdBetAmount || !targetMultiplier) {
      return NextResponse.json(
        { error: "usdBetAmount and targetMultiplier are required" },
        { status: 400 },
      );
    }

    // Validate bet amount
    const usdAmountNum = parseFloat(usdBetAmount);
    if (isNaN(usdAmountNum) || usdAmountNum < 0) {
      return NextResponse.json(
        { error: "Invalid USD bet amount" },
        { status: 400 },
      );
    }

    // Check if this is a demo bet ($0)
    const isDemoBet = usdAmountNum === 0;

    // Check minimum bet requirement (only for real bets)
    if (!isDemoBet && usdAmountNum < MIN_BET_USD) {
      return NextResponse.json(
        { error: `Minimum bet is $${MIN_BET_USD} USD` },
        { status: 400 },
      );
    }

    // RATE LIMITING: Check per-user limits (skip for demo bets)
    if (!isDemoBet) {
      const userId = user.id;

      // Check 1-minute rate limit
      const perMinuteCheck = checkRateLimit(
        `user:${userId}:minute`,
        RATE_LIMITS.PER_USER_PER_MINUTE,
        usdAmountNum
      );
      if (!perMinuteCheck.allowed) {
        console.warn(`⚠️ Rate limit hit for user ${userId}: ${perMinuteCheck.error}`);
        logSecurityEvent({
          type: "rate_limit",
          severity: "medium",
          userId,
          ip: clientIp,
          userAgent: req.headers.get("user-agent") || undefined,
          details: {
            limit: "per_minute",
            betAmount: usdAmountNum,
            error: perMinuteCheck.error,
          },
        });
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: perMinuteCheck.error,
            resetTime: perMinuteCheck.resetTime,
          },
          { status: 429 }
        );
      }

      // Check hourly rate limit
      const perHourCheck = checkRateLimit(
        `user:${userId}:hour`,
        RATE_LIMITS.PER_USER_PER_HOUR,
        usdAmountNum
      );
      if (!perHourCheck.allowed) {
        console.warn(`⚠️ Hourly rate limit hit for user ${userId}: ${perHourCheck.error}`);
        logSecurityEvent({
          type: "rate_limit",
          severity: "high",
          userId,
          ip: clientIp,
          userAgent: req.headers.get("user-agent") || undefined,
          details: {
            limit: "per_hour",
            betAmount: usdAmountNum,
            error: perHourCheck.error,
          },
        });
        return NextResponse.json(
          {
            error: "Hourly limit exceeded",
            message: perHourCheck.error,
            resetTime: perHourCheck.resetTime,
          },
          { status: 429 }
        );
      }

      // Check daily rate limit
      const perDayCheck = checkRateLimit(
        `user:${userId}:day`,
        RATE_LIMITS.PER_USER_PER_DAY,
        usdAmountNum
      );
      if (!perDayCheck.allowed) {
        console.warn(`⚠️ Daily rate limit hit for user ${userId}: ${perDayCheck.error}`);
        logSecurityEvent({
          type: "rate_limit",
          severity: "critical",
          userId,
          ip: clientIp,
          userAgent: req.headers.get("user-agent") || undefined,
          details: {
            limit: "per_day",
            betAmount: usdAmountNum,
            error: perDayCheck.error,
          },
        });
        return NextResponse.json(
          {
            error: "Daily limit exceeded",
            message: perDayCheck.error,
            resetTime: perDayCheck.resetTime,
          },
          { status: 429 }
        );
      }

      // Check IP-based rate limit (additional layer)
      const perIpCheck = checkRateLimit(
        `ip:${clientIp}:minute`,
        RATE_LIMITS.PER_IP_PER_MINUTE,
        usdAmountNum
      );
      if (!perIpCheck.allowed) {
        console.warn(`⚠️ IP rate limit hit for ${clientIp}: ${perIpCheck.error}`);
        logSecurityEvent({
          type: "api_abuse",
          severity: "high",
          userId,
          ip: clientIp,
          userAgent: req.headers.get("user-agent") || undefined,
          details: {
            limit: "per_ip",
            betAmount: usdAmountNum,
            error: perIpCheck.error,
          },
        });
        return NextResponse.json(
          {
            error: "Too many requests from your IP",
            message: perIpCheck.error,
            resetTime: perIpCheck.resetTime,
          },
          { status: 429 }
        );
      }

      console.log(`✅ Rate limit checks passed for user ${userId}`, {
        perMinuteRemaining: perMinuteCheck.remaining,
        perHourRemaining: perHourCheck.remaining,
        perDayRemaining: perDayCheck.remaining,
      });
    } else {
      console.log("🎮 Demo bet - skipping rate limit checks");
    }

    // Convert USD to ETH (skip for demo bets)
    let ethAmount = 0;

    if (isDemoBet) {
      console.log("🎮 Demo bet ($0) - skipping ETH conversion");
      ethAmount = 0;
      cachedEthPrice = await getEthUsdPrice(); // Still get price for display
    } else {
      console.log("💵 USD bet amount:", usdAmountNum);
      ethAmount = await getEthValueFromUsd(usdAmountNum);

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

    // Check Starknet blockchain balance (skip for demo bets)
    const custodialAddress = userCustodialWallet.custodialWallet.address;

    if (!isDemoBet) {
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
    } else {
      console.log("🎮 Demo bet - skipping balance check");
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

    // Process Starknet blockchain deduction in background (skip for demo bets)
    if (!isDemoBet) {
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
    } else {
      console.log("🎮 Demo bet - skipping blockchain deduction");
    }

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

    // Record bet transaction immediately (skip for demo bets)
    // This ensures user sees the transaction in UI right away
    if (!isDemoBet) {
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
    } else {
      console.log("🎮 Demo bet - skipping transaction recording");
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

    // Step 3: Process Starknet payout if win (skip for demo bets)
    if (result.outcome === "win" && !isDemoBet) {
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
    } else if (result.outcome === "win" && isDemoBet) {
      console.log("🎮 Demo bet win - skipping payout processing");
    }


    return NextResponse.json({
      success: true,
      betId: bet.id,
      serverSeedHash: result.serverSeedHash,
      isDemoBet,
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
