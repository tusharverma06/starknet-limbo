import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/session/check-siwe
 * Check if a wallet has completed SIWE authentication
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

    // Find user by wallet address
    const user = await prisma.user.findUnique({
      where: { wallet_address: wallet_address.toLowerCase() },
      include: {
        custodialWallet: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        hasSiwe: false,
        custodial_wallet: null,
      });
    }

    // Check if user has valid SIWE signature
    const hasSiwe = !!(
      user.siwe_signature &&
      user.siwe_message &&
      user.siwe_expires_at &&
      user.siwe_expires_at > new Date()
    );

    return NextResponse.json({
      hasSiwe,
      custodial_wallet: user.custodialWallet?.address || null,
    });
  } catch (error) {
    console.error("Check SIWE error:", error);
    return NextResponse.json(
      { error: "Failed to check SIWE" },
      { status: 500 }
    );
  }
}
