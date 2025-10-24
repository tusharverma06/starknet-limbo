import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  verifyBetSignature,
  parseBetMessage,
} from "@/lib/utils/messageSigning";
import {
  randomnessToUniformFloat,
  simulateLimbo,
  getSimulatedMultiplier,
  calculateSettlementDelta,
  extractTxBalanceDelta,
} from "@/lib/utils/verification";
import { sha256 } from "@/lib/utils/provablyFair";

/**
 * POST /api/verify-full
 * Comprehensive bet verification with all 6 steps
 * Returns complete verification data for UI display
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { betId } = body;

    if (!betId) {
      return NextResponse.json({ error: "betId is required" }, { status: 400 });
    }

    console.log("🔍 Starting comprehensive verification for bet:", betId);

    // Fetch bet data
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      include: {
        user: true,
      },
    });

    if (!bet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    const user = bet.user;

    // STEP 0: User Authentication & Authorization - Display signer information
    // This is informational only - we recover who signed the authorization message
    let signerAddress = null;
    let signatureError = null;

    if (user.siweMessage && user.siweSignature) {
      try {
        // Import verifyMessage directly to recover the signer
        const { verifyMessage } = await import("ethers");
        signerAddress = verifyMessage(user.siweMessage, user.siweSignature);
        console.log("✅ Recovered signer address:", signerAddress);
      } catch (error) {
        signatureError = "Could not recover signer from signature";
        console.error("❌ Error recovering signer:", error);
      }
    } else {
      signatureError =
        "Missing SIWE authentication data (message or signature)";
      console.error("❌ Missing SIWE data:", {
        hasMessage: !!user.siweMessage,
        hasSignature: !!user.siweSignature,
      });
    }

    const step0 = {
      userWalletAddress: user.wallet_address,
      custodialWalletAddress: user.server_wallet_address,
      signerAddress,
      siweSignature: user.siweSignature,
      siweMessage: user.siweMessage,
      siweExpiresAt: user.siweExpiresAt,
      signatureError,
    };

    // STEP 1: Check bet signature message
    const step1 = {
      betMessage: bet.betMessage,
      betSignature: bet.betSignature,
      custodialWalletAddress: user.server_wallet_address,
    };

    // Parse bet message
    let betMessageData = null;
    if (bet.betMessage) {
      betMessageData = parseBetMessage(bet.betMessage);
    }

    // STEP 2: Verify bet signature is signed by custodial wallet
    let betSignatureValid = false;
    if (bet.betMessage && bet.betSignature && user.server_wallet_address) {
      betSignatureValid = verifyBetSignature(
        bet.betMessage,
        bet.betSignature,
        user.server_wallet_address
      );
    }

    // Extract and validate serverSeedHash from bet message
    let hashMatches = false;
    if (
      betMessageData &&
      betMessageData.serverSeedHash === bet.serverSeedHash
    ) {
      hashMatches = true;
    }

    const step2 = {
      betSignatureValid,
      serverSeedHashInMessage: betMessageData?.serverSeedHash,
      serverSeedHashInBet: bet.serverSeedHash,
      hashMatches,
    };

    // STEP 3: Random number generation verification
    // Verify server seed hash
    const calculatedHash = bet.serverSeed ? sha256(bet.serverSeed) : null;
    const serverSeedHashMatches = calculatedHash === bet.serverSeedHash;

    // Convert randomness to float
    const randomFloat = randomnessToUniformFloat(bet.randomValue);

    // Get simulated multiplier using edge = 0.02
    const HOUSE_EDGE = 0.02;
    const simulatedMultiplier = getSimulatedMultiplier({
      randomness: bet.randomValue,
      edge: HOUSE_EDGE,
    });

    // Calculate simulated payout
    const targetMultiplierDecimal = Number(bet.targetMultiplier) / 100;
    const simulatedPayout = simulateLimbo({
      bet: BigInt(bet.wager),
      edge: HOUSE_EDGE,
      randomness: bet.randomValue,
      targetMultiplier: targetMultiplierDecimal,
    });

    const step3 = {
      serverSeed: bet.serverSeed,
      serverSeedHash: bet.serverSeedHash,
      calculatedHash,
      serverSeedHashMatches,
      randomValue: bet.randomValue,
      randomFloat,
      simulatedMultiplier,
      targetMultiplier: targetMultiplierDecimal,
      simulatedPayout: simulatedPayout.toString(),
      houseEdge: HOUSE_EDGE,
    };

    // STEP 4: Verify payout correctness
    const actualPayout = BigInt(bet.payout);
    const payoutVerified = actualPayout === simulatedPayout;

    const step4 = {
      actualPayout: actualPayout.toString(),
      simulatedPayout: simulatedPayout.toString(),
      payoutMatches: payoutVerified,
    };

    // STEP 5: On-chain transaction verification
    let transactionData = null;
    let settlementDelta = BigInt(0);
    let txBalanceDelta = BigInt(0);

    if (bet.txHash) {
      try {
        // Fetch transaction from RPC provider
        const rpcUrl =
          process.env.NEXT_PUBLIC_RPC_URL ||
          `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

        if (rpcUrl && !rpcUrl.includes("undefined")) {
          console.log("🔍 Fetching transaction details for:", bet.txHash);
          const response = await fetch(rpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "eth_getTransactionByHash",
              params: [bet.txHash],
            }),
          });

          const data = await response.json();
          console.log("📥 Transaction data received:", data);
          transactionData = data.result;

          if (transactionData) {
            // Extract transaction value (balance delta)
            txBalanceDelta = extractTxBalanceDelta(
              transactionData.value || "0"
            );
            console.log(
              "💰 Extracted balance delta:",
              txBalanceDelta.toString()
            );
          } else {
            console.warn("⚠️ No transaction data found for hash:", bet.txHash);
          }
        } else {
          console.error("❌ RPC URL not configured properly");
        }
      } catch (error) {
        console.error("❌ Error fetching transaction:", error);
      }
    } else {
      console.log("ℹ️ No txHash found for bet:", bet.id);
    }

    // Calculate settlement delta (net change in balance)
    settlementDelta = calculateSettlementDelta({
      outcome: bet.outcome as "win" | "lose",
      wager: BigInt(bet.wager),
      payout: BigInt(bet.payout),
    });

    const step5 = {
      txHash: bet.txHash,
      transactionData,
      expectedPayout: bet.payout, // What we expect to be paid
      actualTxValue: txBalanceDelta.toString(), // What was actually sent in transaction
      settlementDelta: settlementDelta.toString(), // Net balance change (payout - wager for wins, -wager for losses)
    };

    // STEP 6: Final settlement verification
    // For wins, compare the actual payout with transaction value
    // For losses, there's no payout transaction
    let payoutMatches = false;
    if (bet.txHash && bet.outcome === "win") {
      // Compare actual payout amount with transaction value
      payoutMatches = BigInt(bet.payout) === txBalanceDelta;
      console.log("💰 Payout verification:", {
        expectedPayout: bet.payout,
        actualTxValue: txBalanceDelta.toString(),
        matches: payoutMatches,
      });
    } else if (bet.outcome === "lose") {
      // For losses, no payout transaction expected
      payoutMatches = true; // No transaction to verify
    }

    const balanceDeltasMatch = bet.txHash ? payoutMatches : null;

    const step6 = {
      balanceDeltasMatch,
      verified:
        balanceDeltasMatch !== null ? balanceDeltasMatch : "N/A (no tx hash)",
    };

    // Overall verification result (excluding SIWE validation)
    const allChecksPass =
      betSignatureValid &&
      hashMatches &&
      serverSeedHashMatches &&
      payoutMatches &&
      (balanceDeltasMatch === null || balanceDeltasMatch === true);

    return NextResponse.json({
      success: true,
      betId: bet.id,
      verified: allChecksPass,
      steps: {
        step0,
        step1,
        step2,
        step3,
        step4,
        step5,
        step6,
      },
      bet: {
        id: bet.id,
        wager: bet.wager,
        wagerUsd: bet.wagerUsd,
        payout: bet.payout,
        payoutUsd: bet.payoutUsd,
        outcome: bet.outcome,
        targetMultiplier: bet.targetMultiplier,
        limboMultiplier: bet.limboMultiplier,
        ethPriceUsd: bet.ethPriceUsd,
        createdAt: bet.createdAt,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        error: "Verification failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
