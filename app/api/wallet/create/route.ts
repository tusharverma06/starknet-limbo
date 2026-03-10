import { NextRequest, NextResponse } from "next/server";
import { walletDb } from "@/lib/db/wallets";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/wallet/create
 * Get custodial wallet info for a connected wallet address
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet_address = searchParams.get("wallet_address");

    if (!wallet_address) {
      return NextResponse.json(
        { error: "wallet_address is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching custodial wallet for:", wallet_address);

    // Find user by wallet address
    const user = await prisma.user.findUnique({
      where: { wallet_address: wallet_address.toLowerCase() },
      include: {
        custodialWallet: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!user || !user.custodialWallet) {
      return NextResponse.json(
        { error: "Custodial wallet not found. Please connect your wallet first." },
        { status: 404 }
      );
    }

    const wallet = user.custodialWallet.wallet;

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet keys not found" },
        { status: 404 }
      );
    }

    // Return wallet info without private key
    return NextResponse.json({
      custodial_address: user.custodialWallet.address,
      address: wallet.address,
      createdAt: wallet.createdAt.toString(),
      balance: wallet.balance || "0",
      lastUsed: wallet.lastUsed ? wallet.lastUsed.toString() : null,
    });
  } catch (error) {
    console.error("❌ Get wallet error:", error);
    return NextResponse.json(
      {
        error: "Failed to get wallet",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
