import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyBet } from "@/lib/utils/provablyFair";

/**
 * POST /api/verify
 * Verify a bet's provably fair properties
 *
 * This endpoint verifies that:
 * 1. SHA256(serverSeed) === serverSeedHash
 * 2. randomValue === SHA256(serverSeed + playerId + betId)
 * 3. gameNumber is correctly derived from randomValue
 * 4. limboMultiplier is correctly calculated from gameNumber
 * 5. outcome (win/lose) matches the multiplier comparison
 * 6. payout is correctly calculated
 */
export async function POST(req: NextRequest) {
  try {
    const { betId, requestId } = await req.json();

    // Support both betId and requestId for backwards compatibility
    const id = betId || requestId;

    if (!id) {
      return NextResponse.json(
        { error: "betId or requestId is required" },
        { status: 400 }
      );
    }

    // Fetch bet from database
    const bet = await prisma.bet.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            farcaster_username: true,
            farcaster_pfp: true,
          },
        },
      },
    });

    if (!bet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    // Check if bet has verification data available
    // We can verify provably fair aspects even if payout hasn't been sent yet
    if (!bet.serverSeed) {
      return NextResponse.json(
        {
          error: "Bet not resolved yet",
          status: bet.status,
          note: "The bet needs to be resolved before the provably fair verification can be performed. The server seed has not been revealed yet.",
        },
        { status: 400 }
      );
    }

    // Check if this is a win that hasn't been settled yet (no payout tx)
    const isPendingSettlement = bet.outcome === "win" && !bet.txHash;
    if (isPendingSettlement) {
      console.log(
        "⚠️ Bet is a win without payout transaction - pending settlement"
      );
    }

    // Perform verification
    const verification = verifyBet({
      serverSeed: bet.serverSeed,
      serverSeedHash: bet.serverSeedHash,
      playerId: bet.playerId,
      betId: bet.id,
      randomValue: bet.randomValue,
      gameNumber: bet.gameNumber,
      limboMultiplier: bet.limboMultiplier || "0",
      targetMultiplier: bet.targetMultiplier,
      outcome: bet.outcome,
      wager: bet.wager,
      payout: bet.payout,
    });

    // Build verification steps for frontend display
    const verificationSteps = [
      {
        step: 1,
        description: "Verify server seed hash commitment",
        status: verification.checks.serverSeedHashMatches ? "✅" : "❌",
        data: {
          description:
            "Check that SHA256(serverSeed) matches the committed hash",
          serverSeed: bet.serverSeed,
          serverSeedHash: bet.serverSeedHash,
          formula: "SHA256(serverSeed) === serverSeedHash",
          verified: verification.checks.serverSeedHashMatches,
        },
      },
      {
        step: 2,
        description: "Verify random value generation",
        status: verification.checks.randomValueMatches ? "✅" : "❌",
        data: {
          description:
            "Check that random value is correctly generated from inputs",
          formula: "SHA256(serverSeed + playerId + betId)",
          inputs: {
            serverSeed: bet.serverSeed,
            playerId: bet.playerId,
            betId: bet.id,
          },
          randomValue: bet.randomValue,
          verified: verification.checks.randomValueMatches,
        },
      },
      {
        step: 3,
        description: "Verify game number derivation",
        status: verification.checks.gameNumberMatches ? "✅" : "❌",
        data: {
          description:
            "Check that game number is correctly derived from random value",
          formula: "(BigInt(0x + randomValue) % 1e9) + 1",
          randomValue: bet.randomValue,
          gameNumber: bet.gameNumber,
          verified: verification.checks.gameNumberMatches,
        },
      },
      {
        step: 4,
        description: "Verify limbo multiplier calculation",
        status: verification.checks.multiplierMatches ? "✅" : "❌",
        data: {
          description:
            "Check that the limbo multiplier is correctly calculated",
          formula: "(1 - houseEdge) / (gameNumber / 1e9)",
          houseEdge: "0.02 (2%)",
          gameNumber: bet.gameNumber,
          limboMultiplier: bet.limboMultiplier
            ? (Number(bet.limboMultiplier) / 100).toFixed(2) + "x"
            : "N/A",
          verified: verification.checks.multiplierMatches,
        },
      },
      {
        step: 5,
        description: "Verify bet outcome",
        status: verification.checks.outcomeMatches ? "✅" : "❌",
        data: {
          description: "Check that win/lose outcome is correct",
          limboMultiplier: Number(bet.limboMultiplier) / 100,
          targetMultiplier: Number(bet.targetMultiplier) / 100,
          formula: "limboMultiplier >= targetMultiplier = WIN",
          outcome: bet.outcome,
          verified: verification.checks.outcomeMatches,
        },
      },
      {
        step: 6,
        description: "Verify payout calculation",
        status: verification.checks.payoutMatches ? "✅" : "❌",
        data: {
          description: "Check that payout is correctly calculated",
          formula:
            bet.outcome === "win"
              ? "wager * (targetMultiplier / 100)"
              : "0 (loss)",
          wager: bet.wager,
          targetMultiplier: Number(bet.targetMultiplier) / 100,
          expectedPayout: bet.payout,
          actualPayout: bet.payout,
          verified: verification.checks.payoutMatches,
        },
      },
    ];

    return NextResponse.json({
      verificationSteps,
      overallStatus: verification.valid
        ? isPendingSettlement
          ? "✅ Provably fair verified - ⏳ Pending payout settlement"
          : "✅ All checks passed - Bet is provably fair"
        : "⚠️ Some checks failed - Verification issues detected",
      valid: verification.valid,
      errors: verification.errors,
      isPendingSettlement,
      bet: {
        betId: bet.id,
        player: bet.playerId,
        playerName: bet.user.farcaster_username,
        playerPfp: bet.user.farcaster_pfp,
        betAmount: bet.wager,
        targetMultiplier: Number(bet.targetMultiplier) / 100,
        limboMultiplier: bet.limboMultiplier
          ? Number(bet.limboMultiplier) / 100
          : null,
        outcome: bet.outcome,
        payout: bet.payout,
        status: bet.status,
        placedAt: bet.createdAt.toISOString(),
        resolvedAt: bet.resolvedAt?.toISOString() || null,
        txHash: bet.txHash,
        hasPayout: !!bet.txHash,
      },
      provablyFair: {
        serverSeed: bet.serverSeed,
        serverSeedHash: bet.serverSeedHash,
        clientSeed: bet.clientSeed,
        randomValue: bet.randomValue,
        gameNumber: bet.gameNumber,
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

/**
 * GET /api/verify?betId=xxx
 * Verify a bet via GET request
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const betId = searchParams.get("betId") || searchParams.get("requestId");

    if (!betId) {
      return NextResponse.json(
        { error: "betId or requestId query parameter is required" },
        { status: 400 }
      );
    }

    // Call POST handler with the betId
    return POST(
      new NextRequest(req.url, {
        method: "POST",
        body: JSON.stringify({ betId }),
      })
    );
  } catch (error) {
    console.error("Verification GET error:", error);
    return NextResponse.json(
      {
        error: "Verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
