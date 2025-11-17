import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export interface AuthenticatedRequest {
  user: {
    id: string;
    fid: string;
    username: string;
    address: string;
    custodialWallet: string;
    siweExpiresAt: Date | null;
  };
}

/**
 * Require session authentication for API routes
 * Validates session cookie and returns authenticated user data
 */
export async function requireAuth(
  req: NextRequest
): Promise<{ data: AuthenticatedRequest } | { error: NextResponse }> {
  // Get session ID from cookie
  const sessionId = req.cookies.get("session_id")?.value;

  if (!sessionId) {
    return {
      error: NextResponse.json(
        {
          error: "Authentication required. Please sign in.",
          code: "NO_SESSION",
          showToast: true
        },
        { status: 401 }
      ),
    };
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
          siweSignature: true,
        }
      }
    },
  });

  if (!session) {
    return {
      error: NextResponse.json(
        {
          error: "Invalid session. Please sign in again.",
          code: "INVALID_SESSION",
          showToast: true
        },
        { status: 401 }
      ),
    };
  }

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    // Delete expired session
    await prisma.session.delete({ where: { id: sessionId } });

    return {
      error: NextResponse.json(
        {
          error: "Session expired. Please sign in again.",
          code: "SESSION_EXPIRED",
          showToast: true
        },
        { status: 401 }
      ),
    };
  }

  const user = session.user;

  // Check if SIWE signature still exists
  if (!user.siweSignature || !user.siweExpiresAt) {
    return {
      error: NextResponse.json(
        {
          error: "Authorization expired. Please sign in again.",
          code: "SIWE_EXPIRED",
          showToast: true
        },
        { status: 401 }
      ),
    };
  }

  // Check if SIWE hasn't expired
  const now = new Date();
  if (now > new Date(user.siweExpiresAt)) {
    return {
      error: NextResponse.json(
        {
          error: "Your session has expired. Please sign in again.",
          code: "SIWE_EXPIRED",
          showToast: true
        },
        { status: 401 }
      ),
    };
  }

  console.log("✅ User authenticated:", user.id);

  // Return authenticated user data
  return {
    data: {
      user: {
        id: user.id,
        fid: user.farcaster_id,
        username: user.farcaster_username,
        address: user.wallet_address || "",
        custodialWallet: user.server_wallet_address || "",
        siweExpiresAt: user.siweExpiresAt,
      },
    },
  };
}
