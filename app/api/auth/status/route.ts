import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";

/**
 * GET /api/auth/status
 * Check authentication status based on session cookie
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fid = searchParams.get("userId") || searchParams.get("fid");

    if (!fid) {
      return NextResponse.json(
        { error: "fid or userId is required" },
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
      { error: "Failed to check auth status" },
      { status: 500 }
    );
  }
}
