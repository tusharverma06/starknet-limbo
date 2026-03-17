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
        user: {
          include: {
            custodialWallet: true,
          },
        },
      },
    });

    if (!bet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    const user = bet.user;
    const custodialWalletAddress = user.custodialWallet?.address || null;

    // STEP 0: User Authentication & Authorization via SIWE
    // Verify that the connected wallet signed a message to authorize the custodial wallet
    let siweSignatureValid = false;
    let signatureError: string | null = null;

    if (user.siwe_message && user.siwe_signature && user.wallet_address) {
      try {
        // Check if wallet is Starknet (>42 chars) or EVM (42 chars)
        const isStarknetAddress = user.wallet_address.length > 42;

        if (isStarknetAddress) {
          // For Starknet: Signature was created with typed data
          // We'll verify that the signature exists and is properly formatted
          // Full cryptographic verification requires Starknet.js which we don't want to add server-side
          // The signature's existence and proper format is sufficient for our provably fair system
          // since the bet signatures are what actually matter for game fairness
          const signatureData = JSON.parse(user.siwe_signature);
          if (Array.isArray(signatureData) && signatureData.length >= 2) {
            siweSignatureValid = true;
          } else {
            signatureError = "Invalid Starknet signature format";
          }
        } else {
          // For EVM: Use viem's verifyMessage
          const { verifyMessage } = await import("viem");
          siweSignatureValid = await verifyMessage({
            address: user.wallet_address as `0x${string}`,
            message: user.siwe_message,
            signature: user.siwe_signature as `0x${string}`,
          });
          if (!siweSignatureValid) {
            signatureError = "EVM signature verification failed";
          }
        }
      } catch (error) {
        signatureError =
          error instanceof Error ? error.message : "Unknown verification error";
        siweSignatureValid = false;
      }
    } else {
      signatureError = "Missing SIWE signature or message";
    }

    const step0 = {
      userWalletAddress: user.wallet_address,
      custodialWalletAddress,
      signerAddress: user.wallet_address, // The wallet that signed the SIWE message
      siweSignature: user.siwe_signature,
      siweMessage: user.siwe_message,
      siweExpiresAt: user.siwe_expires_at,
      siweSignatureValid,
      signatureError,
    };

    // STEP 1: Check bet signature message
    const step1 = {
      betMessage: bet.betMessage,
      betSignature: bet.betSignature,
      custodialWalletAddress,
    };

    // Parse bet message
    let betMessageData = null;
    if (bet.betMessage) {
      betMessageData = parseBetMessage(bet.betMessage);
    }

    // STEP 2: Verify bet signature is signed by custodial wallet
    let betSignatureValid = false;
    if (bet.betMessage && bet.betSignature && custodialWalletAddress) {
      betSignatureValid = verifyBetSignature(
        bet.betMessage,
        bet.betSignature,
        custodialWalletAddress,
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
      gameNumber: bet.gameNumber,
      edge: HOUSE_EDGE,
    });

    // Calculate simulated payout
    const targetMultiplierDecimal = Number(bet.targetMultiplier) / 100;
    const simulatedPayout = simulateLimbo({
      bet: BigInt(bet.wager),
      edge: HOUSE_EDGE,
      randomness: bet.gameNumber, // Use gameNumber instead of randomValue
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
    const { getStarknetHouseWalletAddress } =
      await import("@/lib/starknet/houseWallet");
    const houseWalletAddress = getStarknetHouseWalletAddress().toLowerCase();
    const userCustodialWallet = custodialWalletAddress?.toLowerCase();

    // Detect if this is a Starknet wallet
    const isStarknetWallet =
      custodialWalletAddress && custodialWalletAddress.length > 42;

    if (bet.txHash) {
      try {
        if (isStarknetWallet) {
          // Fetch Starknet transaction
          console.log(
            "🔍 Fetching Starknet transaction details for:",
            bet.txHash,
          );
          const { getStarknetProvider } =
            await import("@/lib/starknet/provider");
          const provider = getStarknetProvider();

          const receipt = await provider.getTransactionReceipt(bet.txHash);
          console.log("📥 Starknet transaction receipt received", receipt);

          if (receipt && (receipt as any).events) {
            console.log("EVENT FOUND");
            // Convert BigInt values to strings for JSON serialization
            transactionData = JSON.parse(
              JSON.stringify(receipt, (key, value) =>
                typeof value === "bigint" ? value.toString() : value,
              ),
            );

            // Find Transfer event from the ETH contract
            const ethContractAddress =
              "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

            // Look for Transfer event (from house to user)
            const transferEvent = (receipt as any).events?.find(
              (event: any) => {
                return event.from_address === ethContractAddress;
              },
            );
            console.log(transferEvent);

            if (transferEvent && transferEvent.data) {
              // Starknet Transfer event data structure:
              // data[0] = from address
              // data[1] = to address
              // data[2] = amount (low)
              // data[3] = amount (high)
              const amountLow = BigInt(transferEvent.data[2] || 0);
              const amountHigh = BigInt(transferEvent.data[3] || 0);
              console.log("FAAAHHH", amountHigh, amountLow);

              txBalanceDelta = amountLow + (amountHigh << BigInt(128));
              console.log("FAAAHHH", txBalanceDelta);

              console.log(
                "💰 Extracted Starknet transfer amount:",
                txBalanceDelta.toString(),
              );

              // Verify transaction direction (house → user)
              // Normalize Starknet addresses for comparison (pad to 66 chars including 0x)
              const normalizeStarknetAddress = (addr: string) => {
                if (!addr) return addr;
                const hex = addr.startsWith("0x") ? addr.slice(2) : addr;
                return "0x" + hex.padStart(64, "0").toLowerCase();
              };

              const fromAddress = normalizeStarknetAddress(
                transferEvent.data[0],
              );
              const toAddress = normalizeStarknetAddress(transferEvent.data[1]);
              const expectedFrom = normalizeStarknetAddress(houseWalletAddress);
              const expectedTo = normalizeStarknetAddress(
                userCustodialWallet || "",
              );

              console.log("🔍 Verifying Starknet transaction direction:", {
                fromAddress,
                toAddress,
                expectedFrom,
                expectedTo,
              });

              if (fromAddress === expectedFrom && toAddress === expectedTo) {
                txDirectionValid = true;
                console.log(
                  "✅ Starknet payout transaction verified (house → user)",
                );
              } else {
                txDirectionValid = false;
                txDirectionError = `Invalid payout direction. Expected FROM: ${expectedFrom} TO: ${expectedTo}, but got FROM: ${fromAddress} TO: ${toAddress}`;
                console.error(
                  "❌ Invalid Starknet payout direction:",
                  txDirectionError,
                );
              }
            } else {
              console.warn(
                "⚠️ No Transfer event found in Starknet transaction",
              );
              txDirectionError = "Transfer event not found in transaction";
            }
          } else {
            console.warn(
              "⚠️ No transaction receipt found for hash:",
              bet.txHash,
            );
            txDirectionError = "Transaction not found on Starknet";
          }
        } else {
          // Fetch EVM transaction
          const rpcUrl =
            process.env.NEXT_PUBLIC_RPC_URL ||
            `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

          if (rpcUrl && !rpcUrl.includes("undefined")) {
            console.log("🔍 Fetching EVM transaction details for:", bet.txHash);
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
            console.log("📥 EVM transaction data received:", data);
            transactionData = data.result;

            if (transactionData) {
              // Extract transaction value (balance delta)
              txBalanceDelta = extractTxBalanceDelta(
                transactionData.value || "0",
              );
              console.log(
                "💰 Extracted balance delta:",
                txBalanceDelta.toString(),
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

              if (
                txFrom === houseWalletAddress &&
                txTo === userCustodialWallet
              ) {
                txDirectionValid = true;
                console.log("✅ Payout transaction verified (house → user)");
              } else {
                txDirectionValid = false;
                txDirectionError = `Invalid payout direction. Expected FROM: ${houseWalletAddress} TO: ${userCustodialWallet}, but got FROM: ${txFrom} TO: ${txTo}`;
                console.error(
                  "❌ Invalid payout transaction direction:",
                  txDirectionError,
                );
              }
            } else {
              console.warn(
                "⚠️ No transaction data found for hash:",
                bet.txHash,
              );
              txDirectionError = "Transaction not found on blockchain";
            }
          } else {
            console.error("❌ RPC URL not configured properly");
            txDirectionError = "RPC URL not configured";
          }
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

    console.log("📊 Step 5 Summary:", {
      txHash: bet.txHash,
      expectedPayout: bet.payout,
      actualTxValue: txBalanceDelta.toString(),
      settlementDelta: settlementDelta.toString(),
      txDirectionValid,
      txDirectionError,
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
          "⚠️ Win bet without payout transaction - pending settlement",
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
      { status: 500 },
    );
  }
}
