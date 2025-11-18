import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "ethers";
import { prisma } from "@/lib/db/prisma";
import { walletDb } from "@/lib/db/wallets";
import { cookies } from "next/headers";

/**
 * POST /api/siwe
 * Simple SIWE authentication flow:
 * 1. User connects wallet with Farcaster connector
 * 2. Gets custodial wallet address from backend
 * 3. Signs SIWE message showing custodial wallet
 * 4. Backend verifies signature and stores in DB
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, signature, message, fid, username, pfp } = body;

    // Validate required fields
    if (!address || !signature || !message) {
      return NextResponse.json(
        { error: "address, signature, and message are required" },
        { status: 400 }
      );
    }

    console.log("🔐 SIWE sign-in request:", {
      address,
      fid,
      origin: req.headers.get('origin'),
      referer: req.headers.get('referer'),
      userAgent: req.headers.get('user-agent'),
      host: req.headers.get('host')
    });

    // Verify the signature
    let recoveredAddress: string;
    try {
      recoveredAddress = verifyMessage(message, signature);
    } catch (error) {
      console.error("❌ Signature verification failed:", error);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 }
      );
    }

    console.log("✅ Signature verified");

    // Extract expiration from message
    const expirationMatch = message.match(/Expiration Time: (.+)/);
    let expiresAt: Date | null = null;
    if (expirationMatch) {
      try {
        expiresAt = new Date(expirationMatch[1]);
      } catch (error) {
        console.warn("⚠️ Could not parse expiration time:", error);
      }
    }

    // If we have Farcaster data, use it. Otherwise, we'll get it later from SDK
    let user;

    if (fid) {
      // Find or create user by Farcaster FID
      user = await prisma.user.findUnique({
        where: { farcaster_id: fid.toString() },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            farcaster_id: fid.toString(),
            farcaster_username: username || `user-${fid}`,
            farcaster_pfp: pfp || null,
            wallet_address: address.toLowerCase(),
          },
        });
        console.log("✅ New user created:", user.id);
      } else {
        // Update wallet address if changed
        if (user.wallet_address?.toLowerCase() !== address.toLowerCase()) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { wallet_address: address.toLowerCase() },
          });
        }
      }
    } else {
      // No FID yet - find user by wallet address
      user = await prisma.user.findFirst({
        where: { wallet_address: address.toLowerCase() },
      });

      if (!user) {
        // Create temporary user - will be updated when we get FID from SDK
        user = await prisma.user.create({
          data: {
            farcaster_id: `temp-${address.toLowerCase()}`,
            farcaster_username: `user-${address.slice(0, 6)}`,
            wallet_address: address.toLowerCase(),
          },
        });
        console.log("✅ Temporary user created:", user.id);
      }
    }

    // Get or create custodial wallet
    let wallet = await walletDb.getWallet(user.id);

    if (!wallet) {
      console.log("📝 Creating custodial wallet for user:", user.id);
      wallet = await walletDb.createCustodialWallet(user.id);
      console.log("✅ Custodial wallet created:", wallet.address);
    }

    const custodialWalletAddress = wallet.address;

    // Update user with SIWE data and custodial wallet reference
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        wallet_address: address.toLowerCase(),
        server_wallet_address: custodialWalletAddress.toLowerCase(),
        siweSignature: signature,
        siweMessage: message,
        siweExpiresAt: expiresAt,
      },
    });

    console.log("✅ SIWE authentication complete for user:", updatedUser.id);

    // Create session in database (7 days for convenience)
    const session = await prisma.session.create({
      data: {
        userId: updatedUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    console.log("🎟️ Session created:", session.id);

    // Create response first
    const response = NextResponse.json({
      success: true,
      user: {
        fid: updatedUser.farcaster_id,
        username: updatedUser.farcaster_username,
        custodialWalletAddress: updatedUser.server_wallet_address,
      },
    });

    // Determine if we're on HTTPS (production/ngrok) or HTTP (local dev)
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const isSecure = protocol === 'https';

    // Set session cookie with environment-aware settings
    // For HTTPS (Vercel/ngrok): Use Secure, SameSite=None, Partitioned for iframe support
    // For HTTP (local dev): Use SameSite=Lax without Secure
    const cookieParts = [
      `session_id=${session.id}`,
      'Path=/',
      'HttpOnly',
      ...(isSecure ? ['Secure', 'SameSite=None', 'Partitioned'] : ['SameSite=Lax']),
      `Max-Age=${7 * 24 * 60 * 60}`
    ];
    const cookieValue = cookieParts.join('; ');
    response.headers.set('Set-Cookie', cookieValue);

    console.log("🍪 Session cookie set:", {
      sessionId: session.id,
      protocol,
      isSecure,
      maxAge: "7 days",
      sameSite: isSecure ? "None" : "Lax",
      secure: isSecure,
      partitioned: isSecure,
      httpOnly: true
    });

    return response;
  } catch (error) {
    console.error("❌ SIWE authentication error:", error);
    return NextResponse.json(
      {
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/siwe/status
 * Check authentication status based on session cookie
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fid = searchParams.get("fid");

    if (!fid) {
      return NextResponse.json(
        { error: "fid is required" },
        { status: 400 }
      );
    }

    // Get session cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    console.log("🔍 Checking auth status for FID:", fid, "Session ID:", sessionId ? "exists" : "missing");

    if (!sessionId) {
      return NextResponse.json({
        isAuthenticated: false,
        isExpired: false,
        custodialWallet: null,
        reason: "no_session_cookie",
      });
    }

    // Verify session exists in database and hasn't expired
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            farcaster_id: true,
            farcaster_username: true,
            wallet_address: true,
            server_wallet_address: true,
            siweExpiresAt: true,
          },
        },
      },
    });

    if (!session) {
      console.log("❌ Session not found in database");
      return NextResponse.json({
        isAuthenticated: false,
        isExpired: true,
        custodialWallet: null,
        reason: "invalid_session",
      });
    }

    // Check if session has expired
    if (session.expiresAt < new Date()) {
      console.log("❌ Session expired:", session.expiresAt);
      // Delete expired session
      await prisma.session.delete({ where: { id: sessionId } });
      return NextResponse.json({
        isAuthenticated: false,
        isExpired: true,
        custodialWallet: null,
        reason: "session_expired",
      });
    }

    // Verify session belongs to the requested user
    if (session.user.farcaster_id !== fid) {
      console.log("❌ Session FID mismatch:", {
        sessionFid: session.user.farcaster_id,
        requestedFid: fid,
      });
      return NextResponse.json({
        isAuthenticated: false,
        isExpired: false,
        custodialWallet: null,
        reason: "fid_mismatch",
      });
    }

    console.log("✅ Session valid for user:", session.user.farcaster_username);

    return NextResponse.json({
      isAuthenticated: true,
      isExpired: false,
      custodialWallet: session.user.server_wallet_address,
    });
  } catch (error) {
    console.error("❌ Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
