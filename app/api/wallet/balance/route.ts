import { NextRequest, NextResponse } from "next/server";
import { JsonRpcProvider, formatEther } from "ethers";
import { getUsdValueFromEth } from "@/lib/utils/price";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/wallet/balance
 * Get the current balance of the custodial wallet
 * Fetches directly from blockchain (no locked balance tracking)
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

    // Get balance from blockchain
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL ||
      `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

    if (!rpcUrl || rpcUrl.includes("undefined")) {
      console.error("No valid RPC URL configured");
      return NextResponse.json(
        { error: "RPC URL not configured" },
        { status: 500 },
      );
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const blockchainBalance = await provider.getBalance(custodialAddress);

    // Convert to ETH and USD
    const balanceInEth = parseFloat(formatEther(blockchainBalance));
    const balanceInUsd = await getUsdValueFromEth(balanceInEth);

    return NextResponse.json({
      address: custodialAddress,
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
      { error: "Failed to get balance" },
      { status: 500 },
    );
  }
}
