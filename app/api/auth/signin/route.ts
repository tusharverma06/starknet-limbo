import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth/quickAuthMiddleware";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { walletDb } from "@/lib/db/wallets";

/**
 * POST /api/auth/signin
 * Sign in with Quick Auth and create/get custodial wallet
 * Uses JWT tokens from Farcaster Quick Auth - no more SIWE complexity!
 */
export async function POST(req: NextRequest) {
  // Verify Quick Auth token
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const fid = authResult.fid;

  try {
    console.log("🔐 Quick Auth sign in for FID:", fid);

    // Get or create user
    const user = await getOrCreateUser(fid.toString());
    if (!user) {
      return NextResponse.json(
        { error: "Failed to get or create user" },
        { status: 500 }
      );
    }

    console.log("✅ User retrieved/created:", user.id, user.farcaster_username);

    // Get or create custodial wallet
    let wallet = await walletDb.getWallet(user.id);

    if (!wallet) {
      console.log("📝 Creating new custodial wallet for user:", user.id);
      wallet = await walletDb.createWallet(user.id);
      console.log("✅ Custodial wallet created:", wallet.address);
    } else {
      console.log("✅ Using existing custodial wallet:", wallet.address);
    }

    return NextResponse.json({
      success: true,
      fid,
      custodialWallet: wallet.address,
      username: user.farcaster_username,
    });
  } catch (error) {
    console.error("❌ Quick Auth sign in error:", error);
    return NextResponse.json(
      {
        error: "Sign in failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
