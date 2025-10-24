import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { prisma } from "@/lib/db/prisma";
import { requireApiKey } from "@/lib/security/apiAuth";

// Contract ABI (only the functions we need)
const ESCROW_ABI = [
  "function processPayout(bytes32 payoutId, address recipient, uint256 wager, bool win, uint256 amount, bytes signature) external",
  "function batchProcessPayouts(bytes32[] payoutIds, address[] recipients, uint256[] wagers, bool[] wins, uint256[] amounts, bytes[] signatures) external",
  "function getBalance() external view returns (uint256)",
];

/**
 * POST /api/worker/process-payouts
 * Background worker that processes pending payouts to contract
 *
 * SECURITY: Requires API key authentication via x-api-key header
 */
async function processPayoutsHandler() {
  try {
    const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;
    const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
    const PAYOUT_SIGNER_PRIVATE_KEY = process.env.PAYOUT_SIGNER_PRIVATE_KEY;

    if (!ESCROW_CONTRACT_ADDRESS || !RPC_URL || !PAYOUT_SIGNER_PRIVATE_KEY) {
      throw new Error("Missing environment variables for payout processing");
    }

    // Get pending payouts
    const pendingPayouts = await prisma.bet.findMany({
      where: {
        status: "pending_payout",
        outcome: "win",
        signature: { not: null },
      },
      take: 10, // Batch size
      orderBy: { createdAt: "asc" },
    });

    if (pendingPayouts.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "No pending payouts",
      });
    }

    console.log(`📤 Processing ${pendingPayouts.length} payouts...`);

    // Connect to contract
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PAYOUT_SIGNER_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      ESCROW_CONTRACT_ADDRESS,
      ESCROW_ABI,
      wallet
    );

    // Check contract balance
    const contractBalance = await contract.getBalance();
    console.log(
      `💰 Contract balance: ${ethers.formatEther(contractBalance)} ETH`
    );

    // Process payouts (batch if multiple)
    if (pendingPayouts.length === 1) {
      // Single payout
      const bet = pendingPayouts[0];
      const payoutId = ethers.id(bet.id);

      try {
        const tx = await contract.processPayout(
          payoutId,
          bet.playerId,
          bet.wager,
          true, // win
          bet.payout,
          bet.signature
        );

        console.log(`📝 Payout tx sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Payout confirmed: ${receipt.hash}`);

        // Update bet status
        await prisma.bet.update({
          where: { id: bet.id },
          data: {
            status: "paid_out",
            txHash: receipt.hash,
          },
        });

        // Credit winnings to user's balance NOW (on-chain settlement confirmed)
        const wallet = await prisma.userWallet.findUnique({
          where: { userId: bet.userId },
        });

        if (wallet) {
          const currentBalance = BigInt(wallet.balance || "0");
          const newBalance = currentBalance + BigInt(bet.payout);

          await prisma.userWallet.update({
            where: { userId: bet.userId },
            data: { balance: newBalance.toString() },
          });

          console.log(`💰 Credited ${bet.payout} wei to user ${bet.userId}`);
        }

        // Record payout transaction
        await prisma.walletTransaction.create({
          data: {
            userId: bet.userId,
            txHash: receipt.hash,
            txType: "payout",
            amount: bet.payout,
            status: "confirmed",
            blockNumber: BigInt(receipt.blockNumber),
            gasUsed: receipt.gasUsed?.toString() || "0",
            confirmedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          processed: 1,
          txHash: receipt.hash,
        });
      } catch (error) {
        console.error(`❌ Failed to process payout for bet ${bet.id}:`, error);
        return NextResponse.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    } else {
      // Batch payouts
      const payoutIds = pendingPayouts.map((bet) => ethers.id(bet.id));
      const recipients = pendingPayouts.map((bet) => bet.playerId);
      const wagers = pendingPayouts.map((bet) => bet.wager);
      const wins = pendingPayouts.map(() => true);
      const amounts = pendingPayouts.map((bet) => bet.payout);
      const signatures = pendingPayouts.map((bet) => bet.signature!);

      try {
        const tx = await contract.batchProcessPayouts(
          payoutIds,
          recipients,
          wagers,
          wins,
          amounts,
          signatures
        );

        console.log(`📝 Batch payout tx sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Batch payout confirmed: ${receipt.hash}`);

        // Update all bets and credit winnings
        for (const bet of pendingPayouts) {
          await prisma.bet.update({
            where: { id: bet.id },
            data: {
              status: "paid_out",
              txHash: receipt.hash,
            },
          });

          // Credit winnings to user's balance NOW (on-chain settlement confirmed)
          const wallet = await prisma.userWallet.findUnique({
            where: { userId: bet.userId },
          });

          if (wallet) {
            const currentBalance = BigInt(wallet.balance || "0");
            const newBalance = currentBalance + BigInt(bet.payout);

            await prisma.userWallet.update({
              where: { userId: bet.userId },
              data: { balance: newBalance.toString() },
            });

            console.log(`💰 Credited ${bet.payout} wei to user ${bet.userId}`);
          }

          // Record payout transaction
          await prisma.walletTransaction.create({
            data: {
              userId: bet.userId,
              txHash: receipt.hash,
              txType: "payout",
              amount: bet.payout,
              status: "confirmed",
              blockNumber: BigInt(receipt.blockNumber),
              gasUsed: receipt.gasUsed?.toString() || "0",
              confirmedAt: new Date(),
            },
          });
        }

        return NextResponse.json({
          success: true,
          processed: pendingPayouts.length,
          txHash: receipt.hash,
        });
      } catch (error) {
        console.error(`❌ Failed to process batch payouts:`, error);
        return NextResponse.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Payout worker error occurred");
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Wrap with API key authentication
export const POST = requireApiKey(processPayoutsHandler);

/**
 * GET /api/worker/process-payouts
 * Get pending payouts statistics
 *
 * SECURITY: Requires API key authentication via x-api-key header
 */
async function getPayoutsStatsHandler() {
  try {
    const pendingCount = await prisma.bet.count({
      where: {
        status: "pending_payout",
        outcome: "win",
      },
    });

    const pendingBets = await prisma.bet.findMany({
      where: {
        status: "pending_payout",
        outcome: "win",
      },
      take: 20,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        payout: true,
        createdAt: true,
        playerId: true,
      },
    });

    const totalPending = pendingBets.reduce(
      (sum, bet) => sum + BigInt(bet.payout),
      BigInt(0)
    );

    return NextResponse.json({
      pendingCount,
      totalPending: totalPending.toString(),
      bets: pendingBets,
    });
  } catch (error) {
    console.error("Get payouts error occurred");
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Wrap with API key authentication
export const GET = requireApiKey(getPayoutsStatsHandler);
