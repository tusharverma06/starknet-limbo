import { NextRequest, NextResponse } from "next/server";
import { JsonRpcProvider, formatEther } from "ethers";
import { walletDb } from "@/lib/db/wallets";
import { getUsdValueFromEth } from "@/lib/utils/price";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

/**
 * GET /api/wallet/balance?userId=xxx
 * Get the current balance of a user's wallet
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user from database (userId is Farcaster FID)
    const user = await getOrCreateUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Failed to get or create user" },
        { status: 500 }
      );
    }

    const wallet = await walletDb.getWallet(user.id);

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Get balance from blockchain
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL ||
      `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

    if (!rpcUrl || rpcUrl.includes("undefined")) {
      console.error("No valid RPC URL configured");
      return NextResponse.json(
        { error: "RPC URL not configured" },
        { status: 500 }
      );
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(wallet.address);

    // Update cached balance
    await walletDb.updateBalance(user.id, balance.toString());

    // Convert to USD
    const ethBalance = parseFloat(formatEther(balance));
    const usdBalance = await getUsdValueFromEth(ethBalance);

    return NextResponse.json({
      address: wallet.address,
      balance: balance.toString(),
      balanceInEth: ethBalance,
      balanceInUsd: usdBalance,
    });
  } catch (error) {
    console.error("Get balance error:", error);
    return NextResponse.json(
      { error: "Failed to get balance" },
      { status: 500 }
    );
  }
}
