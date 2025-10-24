import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth/quickAuthMiddleware";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/auth/me
 * Get current authenticated user's info
 * Uses Quick Auth JWT tokens
 */
export async function GET(req: NextRequest) {
  // Verify Quick Auth token
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const fid = authResult.fid;

  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { farcaster_id: fid.toString() },
      select: {
        id: true,
        farcaster_id: true,
        farcaster_username: true,
        server_wallet_address: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      fid,
      custodialWallet: user.server_wallet_address,
      username: user.farcaster_username,
    });
  } catch (error) {
    console.error("Error getting user info:", error);
    return NextResponse.json(
      { error: "Failed to get user info" },
      { status: 500 }
    );
  }
}
