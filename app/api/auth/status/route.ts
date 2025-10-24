import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/auth/status
 * Check if user is authenticated with SIWE
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        siweSignature: true,
        siweExpiresAt: true,
        server_wallet_address: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { isAuthenticated: false, custodialWallet: null },
        { status: 200 }
      );
    }

    // Check if SIWE is valid and not expired
    const isAuthenticated =
      !!user.siweSignature &&
      !!user.siweExpiresAt &&
      new Date(user.siweExpiresAt) > new Date();

    return NextResponse.json({
      isAuthenticated,
      custodialWallet: user.server_wallet_address,
    });
  } catch (error) {
    console.error("Auth status check error:", error);
    return NextResponse.json(
      { error: "Failed to check auth status" },
      { status: 500 }
    );
  }
}
