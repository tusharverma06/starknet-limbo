import { NextRequest, NextResponse } from "next/server";
import { JsonRpcProvider, formatEther } from "ethers";
import { walletDb } from "@/lib/db/wallets";
import { getUsdValueFromEth } from "@/lib/utils/price";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/wallet/balance
 * Get the current balance of authenticated user's wallet
 * Requires JWT authentication (verified by middleware)
 */
export async function GET(req: NextRequest) {
  try {
    // Require JWT authentication
    const authResult = await requireAuth(req);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult.data;

    console.log("✅ JWT authentication valid, fetching balance for user:", user.id);

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
    const blockchainBalance = await provider.getBalance(wallet.address);

    // Get locked balance from DB (funds committed to pending bets)
    const lockedBalance = BigInt(wallet.lockedBalance || "0");

    // Available balance = blockchain balance - locked balance
    const availableBalance = blockchainBalance - lockedBalance;

    // DON'T cache blockchain balance - always fetch fresh from chain
    // Only use DB for locked balance tracking

    // Convert to USD
    const blockchainEth = parseFloat(formatEther(blockchainBalance));
    const availableEth = parseFloat(formatEther(availableBalance));
    const lockedEth = parseFloat(formatEther(lockedBalance));

    const blockchainUsd = await getUsdValueFromEth(blockchainEth);
    const availableUsd = await getUsdValueFromEth(availableEth);
    const lockedUsd = await getUsdValueFromEth(lockedEth);

    return NextResponse.json({
      address: wallet.address,
      // Blockchain balance (total on-chain)
      balance: blockchainBalance.toString(),
      balanceInEth: blockchainEth,
      balanceInUsd: blockchainUsd,
      // Available balance (what user can bet with)
      availableBalance: availableBalance.toString(),
      availableBalanceInEth: availableEth,
      availableBalanceInUsd: availableUsd,
      // Locked balance (committed to pending bets)
      lockedBalance: lockedBalance.toString(),
      lockedBalanceInEth: lockedEth,
      lockedBalanceInUsd: lockedUsd,
    });
  } catch (error) {
    console.error("Get balance error:", error);
    return NextResponse.json(
      { error: "Failed to get balance" },
      { status: 500 }
    );
  }
}
