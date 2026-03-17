import { NextRequest, NextResponse } from "next/server";
import { formatEther } from "ethers";
import { getUsdValueFromEth } from "@/lib/utils/price";
import { prisma } from "@/lib/db/prisma";
import { getStarknetBalance } from "@/lib/starknet/provider";

/**
 * GET /api/wallet/balance
 * Get the current balance of the Starknet custodial wallet
 * Fetches directly from blockchain
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "address is required" },
        { status: 400 },
      );
    }

    // Find user by external wallet address
    const user = await prisma.user.findUnique({
      where: { wallet_address: address.toLowerCase() },
      include: {
        custodialWallet: true,
      },
    });

    if (!user || !user.custodialWallet) {
      return NextResponse.json(
        { error: "User or custodial wallet not found" },
        { status: 404 }
      );
    }

    const custodialAddress = user.custodialWallet.address;

    // Get balance from Starknet blockchain with retry logic
    console.log("📊 Fetching Starknet balance for:", custodialAddress);

    let blockchainBalance: bigint;

    try {
      blockchainBalance = await getStarknetBalance(custodialAddress);
      console.log("✅ Starknet balance:", blockchainBalance.toString());
    } catch (error) {
      console.error("Failed to get Starknet balance after retries:", error);
      return NextResponse.json(
        {
          error: "Failed to get Starknet balance",
          message: "RPC endpoint temporarily unavailable. Please try again.",
        },
        { status: 500 },
      );
    }

    // Convert to ETH and USD
    const balanceInEth = parseFloat(formatEther(blockchainBalance));
    const balanceInUsd = await getUsdValueFromEth(balanceInEth);

    return NextResponse.json({
      address: custodialAddress,
      network: "starknet",
      // Blockchain balance (total available)
      balance: blockchainBalance.toString(),
      balanceInEth,
      balanceInUsd,
      // Available balance = total balance (no locked balance tracking)
      availableBalance: blockchainBalance.toString(),
      availableBalanceInEth: balanceInEth,
      availableBalanceInUsd: balanceInUsd,
      // Legacy fields (set to 0 for backward compatibility)
      lockedBalance: "0",
      lockedBalanceInEth: 0,
      lockedBalanceInUsd: 0,
    });
  } catch (error) {
    console.error("Get balance error:", error);
    return NextResponse.json(
      {
        error: "Failed to get balance",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
