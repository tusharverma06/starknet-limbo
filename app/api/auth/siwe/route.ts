import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { walletDb } from "@/lib/db/wallets";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { verifySiweSignature } from "@/lib/utils/siwe";

/**
 * POST /api/auth/siwe
 * Verify SIWE authentication and create user + wallet if they don't exist
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, message, signature, userWalletAddress } = body;

    // Validate inputs
    if (!userId || !message || !signature || !userWalletAddress) {
      return NextResponse.json(
        {
          error:
            "userId, message, signature, and userWalletAddress are required",
        },
        { status: 400 }
      );
    }

    console.log("🔐 SIWE authentication request:", {
      userId,
      userWalletAddress,
    });

    // Verify the signature
    const isValid = verifySiweSignature(message, signature, userWalletAddress);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("✅ SIWE signature verified");

    // Get or create user (userId is Farcaster FID)
    const user = await getOrCreateUser(userId);
    if (!user) {
      console.error("❌ getOrCreateUser returned null for FID:", userId);
      return NextResponse.json(
        { error: "Failed to get or create user" },
        { status: 500 }
      );
    }
    console.log("✅ User retrieved/created:", user.id, user.farcaster_username);

    // Get the existing custodial wallet (should already exist from sign-in flow)
    const wallet = await walletDb.getWallet(user.id);
    if (!wallet) {
      console.error("❌ No custodial wallet found for user:", user.id);
      return NextResponse.json(
        { error: "Custodial wallet not found. Please try signing in again." },
        { status: 400 }
      );
    }

    const custodialWalletAddress = wallet.address;
    console.log("✅ Using custodial wallet:", custodialWalletAddress);

    // Extract expiration time from message
    const expirationMatch = message.match(/Expiration Time: (.+)/);
    let expiresAt: Date | null = null;
    if (expirationMatch) {
      try {
        expiresAt = new Date(expirationMatch[1]);
      } catch (error) {
        console.error("Error parsing expiration time:", error);
      }
    }

    // Update user with SIWE authentication data and wallet addresses
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        wallet_address: userWalletAddress.toLowerCase(),
        server_wallet_address: custodialWalletAddress.toLowerCase(),
        siweSignature: signature,
        siweMessage: message,
        siweExpiresAt: expiresAt,
      },
    });

    console.log("✅ SIWE authentication saved for user:", updatedUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        walletAddress: updatedUser.wallet_address,
        custodialWalletAddress: updatedUser.server_wallet_address,
        expiresAt: updatedUser.siweExpiresAt,
      },
    });
  } catch (error) {
    console.error("SIWE authentication error:", error);
    return NextResponse.json(
      {
        error: "SIWE authentication failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
