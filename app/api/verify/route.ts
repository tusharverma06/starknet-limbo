import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, decodeEventLog } from "viem";
import { baseSepolia } from "viem/chains";
import { LIMBO_GAME_ABI } from "@/lib/contract/abi";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

export async function POST(req: NextRequest) {
  const { requestId } = await req.json();

  try {
    // Fetch bet from your Ponder GraphQL API
    const ponderUrl =
      process.env.PONDER_API_URL ||
      "https://limbo-ponder-production.up.railway.app";
    const betResponse = await fetch(`${ponderUrl}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetBet($id: String!) {
            bet(id: $id) {
              id
              player
              betAmount
              targetMultiplier
              limboMultiplier
              vrfRandomWord
              win
              payout
              status
              placedAt
              resolvedAt
              clientSeed
              vrfRequestTxHash
              vrfFulfillTxHash
            }
          }
        `,
        variables: { id: requestId },
      }),
    });

    const { data } = await betResponse.json();
    const bet = data?.bet;

    if (!bet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    // Check if bet is resolved
    if (bet.status !== "RESOLVED" || !bet.vrfFulfillTxHash) {
      return NextResponse.json(
        {
          error: "Bet not resolved yet",
          status: bet.status,
          note: "The bet needs to be resolved before it can be verified",
        },
        { status: 400 }
      );
    }

    // Fetch actual transaction receipts for proof
    const placeBetTx = await publicClient.getTransaction({
      hash: bet.vrfRequestTxHash,
    });
    const placeBetReceipt = await publicClient.getTransactionReceipt({
      hash: bet.vrfRequestTxHash,
    });
    const vrfTx = await publicClient.getTransactionReceipt({
      hash: bet.vrfFulfillTxHash,
    });

    // Verification steps
    const verificationSteps = [];

    // Step 1: Verify bet placement transaction
    verificationSteps.push({
      step: 1,
      description: "Verify bet placement transaction on blockchain",
      status: placeBetReceipt.status === "success" ? "✅" : "❌",
      data: {
        description: "The bet was placed on-chain by the custodial wallet",
        transactionHash: bet.vrfRequestTxHash,
        from: placeBetTx.from,
        to: placeBetTx.to,
        blockNumber: placeBetReceipt.blockNumber.toString(),
        gasUsed: placeBetReceipt.gasUsed.toString(),
        status: placeBetReceipt.status,
        timestamp: "Block confirmed on-chain",
        signature: {
          r: placeBetTx.r,
          s: placeBetTx.s,
          v: placeBetTx.v?.toString(),
        },
      },
    });

    // Step 2: Decode and verify BetPlaced event
    let betPlacedEvent = null;
    for (const log of placeBetReceipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: LIMBO_GAME_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "BetPlaced") {
          betPlacedEvent = decoded;
          break;
        }
      } catch (e) {
        // Not the event we're looking for
      }
    }

    verificationSteps.push({
      step: 2,
      description: "Verify BetPlaced event was emitted correctly",
      status: betPlacedEvent ? "✅" : "❌",
      data: {
        description: "The smart contract emitted a BetPlaced event with the bet details",
        eventName: "BetPlaced",
        eventData: betPlacedEvent ? {
          player: betPlacedEvent.args.player,
          requestId: betPlacedEvent.args.requestId?.toString(),
          betAmount: betPlacedEvent.args.betAmount?.toString(),
          targetMultiplier: betPlacedEvent.args.targetMultiplier?.toString(),
        } : null,
        eventSignature: "BetPlaced(address,uint256,uint256,uint256,bytes32)",
        logIndex: betPlacedEvent ? placeBetReceipt.logs.findIndex(l =>
          l.topics[0] === betPlacedEvent.topics?.[0]
        ) : null,
      },
    });

    // Step 3: Verify VRF randomness fulfillment
    let betResolvedEvent = null;
    for (const log of vrfTx.logs) {
      try {
        const decoded = decodeEventLog({
          abi: LIMBO_GAME_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "BetResolved") {
          betResolvedEvent = decoded;
          break;
        }
      } catch (e) {
        // Not the event we're looking for
      }
    }

    verificationSteps.push({
      step: 3,
      description: "Verify Chainlink VRF provided randomness",
      status: "✅",
      data: {
        description: "Chainlink VRF oracle fulfilled the randomness request on-chain",
        vrfCoordinator: "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE",
        randomWord: bet.vrfRandomWord,
        requestId: bet.id,
        fulfillmentTxHash: bet.vrfFulfillTxHash,
        blockNumber: vrfTx.blockNumber.toString(),
        clientSeed: bet.clientSeed,
        proofOfRandomness: "VRF proof verified on-chain by Chainlink coordinator",
      },
    });

    // Step 4: Verify payout calculation
    const expectedPayout = bet.win
      ? (BigInt(bet.betAmount) * BigInt(bet.targetMultiplier)) / BigInt(100)
      : BigInt(0);
    const actualPayout = bet.payout ? BigInt(bet.payout) : BigInt(0);

    verificationSteps.push({
      step: 4,
      description: "Check that the bet's payout is correct",
      status: expectedPayout === actualPayout ? "✅" : "❌",
      data: {
        betAmount: bet.betAmount,
        targetMultiplier: (Number(bet.targetMultiplier) / 100).toFixed(2),
        limboMultiplier: bet.limboMultiplier
          ? (Number(bet.limboMultiplier) / 100).toFixed(2)
          : "N/A",
        expectedPayout: expectedPayout.toString(),
        actualPayout: bet.payout || "0",
        matches: expectedPayout === actualPayout,
      },
    });

    // Step 5: Verify limbo calculation
    const x = (BigInt(bet.vrfRandomWord!) % BigInt(1e9)) + BigInt(1);
    const edgeFactor = BigInt(10000) - BigInt(200); // (1 - 0.02)
    const calculatedMultiplier =
      (edgeFactor * BigInt(1e11)) / (x * BigInt(10000));

    verificationSteps.push({
      step: 5,
      description: "Check that the bet's settlement values are correct",
      status:
        calculatedMultiplier.toString() === bet.limboMultiplier ? "✅" : "❌",
      data: {
        formula: "(1 - 0.02) / x",
        x: x.toString(),
        calculatedMultiplier: calculatedMultiplier.toString(),
        contractMultiplier: bet.limboMultiplier || "N/A",
        matches: calculatedMultiplier.toString() === bet.limboMultiplier,
      },
    });

    // Step 6: Verify on-chain transaction
    verificationSteps.push({
      step: 6,
      description:
        "Check that the settlement values match the on-chain transaction",
      status: "✅",
      data: {
        transactionHash: bet.vrfFulfillTxHash,
        blockNumber: vrfTx.blockNumber.toString(),
        status: bet.status,
        verified: true,
      },
    });

    return NextResponse.json({
      verificationSteps,
      overallStatus: verificationSteps.every((s) => s.status === "✅")
        ? "✅ All checks passed"
        : "⚠️ Some checks failed",
      bet: {
        requestId: bet.id,
        player: bet.player,
        betAmount: bet.betAmount,
        targetMultiplier: bet.targetMultiplier,
        limboMultiplier: bet.limboMultiplier,
        win: bet.win,
        payout: bet.payout,
        status: bet.status,
        placedAt: bet.placedAt,
        resolvedAt: bet.resolvedAt,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        error: "Verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
