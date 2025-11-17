import { NextRequest, NextResponse } from "next/server";
import { walletDb } from "@/lib/db/wallets";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * POST /api/wallet/create
 * Create a new server-side wallet for a user
 * This is a thin API wrapper for client-side calls
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("📝 Creating wallet for Farcaster FID:", userId);

    // Get or create user in database (userId is Farcaster FID)
    let user;
    try {
      user = await getOrCreateUser(userId);
      if (!user) {
        console.error("❌ getOrCreateUser returned null for FID:", userId);
        return NextResponse.json(
          {
            error:
              "Failed to get or create user. Please check your Farcaster account.",
          },
          { status: 500 }
        );
      }
      console.log(
        "✅ User retrieved/created:",
        user.id,
        user.farcaster_username
      );
    } catch (userError) {
      console.error("❌ Error in getOrCreateUser:", userError);
      return NextResponse.json(
        {
          error: "Failed to fetch user from Farcaster",
          details:
            userError instanceof Error ? userError.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Check if wallet already exists
    const existingWallet = await walletDb.getWallet(user.id);
    if (existingWallet) {
      return NextResponse.json(
        {
          error: "Wallet already exists",
          address: existingWallet.address,
        },
        { status: 409 }
      );
    }

    // Use the centralized wallet creation method
    const walletData = await walletDb.createCustodialWallet(user.id);

    return NextResponse.json({
      success: true,
      address: walletData.address,
      createdAt: walletData.createdAt,
    });
  } catch (error) {
    console.error("❌ Wallet creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: "Failed to create wallet",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet/create
 * Get wallet info for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // CRITICAL: Require authentication - only return user's OWN wallet
    const authResult = await requireAuth(req);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult.data;

    console.log("✅ Fetching wallet for authenticated user:", user.id);

    const wallet = await walletDb.getWallet(user.id);

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Return wallet info without private key
    return NextResponse.json({
      address: wallet.address,
      createdAt: wallet.createdAt,
      balance: wallet.balance || "0",
      lastUsed: wallet.lastUsed,
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    return NextResponse.json(
      { error: "Failed to get wallet" },
      { status: 500 }
    );
  }
}
