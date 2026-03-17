import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { isAccountDeployed } from "@/lib/starknet/deployWallet";
import { getStrkBalance } from "@/lib/blockchain/starknet/getStrkBalance";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/wallet/deployment-status
 * Check if user's custodial wallet is deployed on Starknet
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(req);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult.data;

    // Get user's custodial wallet
    const userWithWallet = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        custodialWallet: true,
      },
    });

    if (!userWithWallet?.custodialWallet) {
      return NextResponse.json(
        { error: "Custodial wallet not found" },
        { status: 404 }
      );
    }

    const address = userWithWallet.custodialWallet.address;

    // Check if wallet is deployed on-chain
    const isDeployed = await isAccountDeployed(address);

    // Get STRK balance (useful for frontend to show)
    const strkBalance = await getStrkBalance(address);

    return NextResponse.json({
      custodialWalletAddress: address,
      isDeployed,
      strkBalance: strkBalance.toString(),
      strkBalanceFormatted: (Number(strkBalance) / 1e18).toFixed(4),
    });
  } catch (error) {
    console.error("Deployment status check failed:", error);

    return NextResponse.json(
      {
        error: "Failed to check deployment status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
