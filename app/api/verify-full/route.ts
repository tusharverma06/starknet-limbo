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

    // STEP 5: On-chain payout transaction verification
    // NOTE: txHash should ONLY contain payout transactions (house → user for wins)
    // For losses, txHash should be null. This step verifies that.
    let transactionData = null;
    let settlementDelta = BigInt(0);
    let txBalanceDelta = BigInt(0);
    let txDirectionValid = false;
    let txDirectionError = null;

    // Import house wallet address getter
    const { getHouseWalletAddress } = await import(
      "@/lib/security/houseWallet"
    );
    const houseWalletAddress = getHouseWalletAddress().toLowerCase();
    const userCustodialWallet = user.server_wallet_address?.toLowerCase();

    if (bet.txHash) {
      try {
        // Fetch payout transaction from RPC provider
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

            // VERIFY PAYOUT TRANSACTION DIRECTION
            // This ensures txHash is actually a payout (house → user) not a bet payment (user → house)
            const txFrom = transactionData.from?.toLowerCase();
            const txTo = transactionData.to?.toLowerCase();

            console.log("🔍 Verifying payout transaction direction:", {
              txFrom,
              txTo,
              expectedFrom: houseWalletAddress,
              expectedTo: userCustodialWallet,
            });

            if (txFrom === houseWalletAddress && txTo === userCustodialWallet) {
              txDirectionValid = true;
              console.log("✅ Payout transaction verified (house → user)");
            } else {
              txDirectionValid = false;
              txDirectionError = `Invalid payout direction. Expected FROM: ${houseWalletAddress} TO: ${userCustodialWallet}, but got FROM: ${txFrom} TO: ${txTo}`;
              console.error(
                "❌ Invalid payout transaction direction:",
                txDirectionError
              );
            }
          } else {
            console.warn("⚠️ No transaction data found for hash:", bet.txHash);
            txDirectionError = "Transaction not found on blockchain";
          }
        } else {
          console.error("❌ RPC URL not configured properly");
          txDirectionError = "RPC URL not configured";
        }
      } catch (error) {
        console.error("❌ Error fetching transaction:", error);
        txDirectionError =
          error instanceof Error ? error.message : "Unknown error";
      }
    } else {
      console.log("ℹ️ No txHash found for bet:", bet.id);
      // For wins without txHash, this means the bet is not settled yet
      if (bet.outcome === "win") {
        txDirectionError =
          "Payout transaction not yet executed (bet pending settlement)";
      }
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
      expectedPayout: bet.payout, // Expected payout amount
      actualTxValue: txBalanceDelta.toString(), // Actual payout sent in transaction
      settlementDelta: settlementDelta.toString(), // Net balance change
      txDirectionValid, // Verifies transaction is house → user (not user → house)
      txDirectionError,
      houseWalletAddress,
      userCustodialWallet,
    };

    // STEP 6: Final settlement verification
    // For wins: verify payout amount AND transaction direction
    // For losses: txHash should be null (no payout transaction)
    let payoutMatches = false;
    let settlementVerified = false;

    if (bet.outcome === "win") {
      if (bet.txHash) {
        // For wins with txHash: verify amount AND direction
        const amountMatches = BigInt(bet.payout) === txBalanceDelta;
        payoutMatches = amountMatches && txDirectionValid;
        settlementVerified = payoutMatches;

        console.log("💰 Payout verification:", {
          expectedPayout: bet.payout,
          actualTxValue: txBalanceDelta.toString(),
          amountMatches,
          directionValid: txDirectionValid,
          overallMatches: payoutMatches,
        });
      } else {
        // For wins without txHash: bet not settled yet
        payoutMatches = false;
        settlementVerified = false;
        console.log(
          "⚠️ Win bet without payout transaction - pending settlement"
        );
      }
    } else if (bet.outcome === "lose") {
      // For losses, txHash should be null (no payout transaction)
      if (!bet.txHash) {
        payoutMatches = true;
        settlementVerified = true;
        console.log("✅ Loss verified - no payout transaction as expected");
      } else {
        // This indicates a data integrity issue - losses shouldn't have txHash
        payoutMatches = false;
        settlementVerified = false;
        console.error("❌ Loss bet has txHash - data integrity issue!");
      }
    }

    const balanceDeltasMatch = bet.txHash ? payoutMatches : null;

    const step6 = {
      balanceDeltasMatch,
      settlementVerified,
      verified:
        balanceDeltasMatch !== null
          ? balanceDeltasMatch
          : bet.outcome === "win"
          ? "Pending settlement - payout not yet executed"
          : "N/A (no tx hash)",
      requiresTxHash: bet.outcome === "win",
      hasTxHash: !!bet.txHash,
    };

    // Overall verification result (excluding SIWE validation and pending settlements)
    // If bet is a win without txHash, we can't fully verify it yet
    const canFullyVerify =
      bet.outcome === "lose" || (bet.outcome === "win" && !!bet.txHash);

    const allChecksPass =
      betSignatureValid &&
      hashMatches &&
      serverSeedHashMatches &&
      payoutVerified &&
      (canFullyVerify ? settlementVerified : true); // Don't fail if pending settlement

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
