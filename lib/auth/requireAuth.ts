import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export interface AuthenticatedRequest {
  user: {
    id: string;
    address: string;
    custodialWalletId: string;
  };
  body?: Record<string, unknown>; // Parsed body if it was read during auth
}

/**
 * Simple wallet-based authentication
 * Expects wallet address in request
 * Used for custodial wallet operations
 */
export async function requireAuth(
  req: NextRequest
): Promise<{ data: AuthenticatedRequest } | { error: NextResponse }> {
  try {
    // Get wallet address from query params or request body
    const url = new URL(req.url);
    let address = url.searchParams.get("address") || url.searchParams.get("wallet_address");
    let parsedBody: Record<string, unknown> | undefined = undefined;

    // If not in query params, check request body for POST requests
    if (!address && req.method === "POST") {
      try {
        parsedBody = await req.json() as Record<string, unknown>;
        address = (parsedBody.address as string) || (parsedBody.wallet_address as string);
      } catch {
        // If body parsing fails, continue without it
      }
    }

    if (!address) {
      return {
        error: NextResponse.json(
          {
            error: "Wallet address required",
            code: "NO_ADDRESS",
          },
          { status: 400 }
        ),
      };
    }

    // Normalize address
    const normalizedAddress = address.toLowerCase();

    // Get user by wallet address
    const user = await prisma.user.findUnique({
      where: { wallet_address: normalizedAddress },
      include: {
        custodialWallet: true,
      },
    });

    if (!user) {
      return {
        error: NextResponse.json(
          {
            error: "User not found. Please connect your wallet first.",
            code: "USER_NOT_FOUND",
          },
          { status: 404 }
        ),
      };
    }

    // Return authenticated user data (include parsed body if we read it)
    return {
      data: {
        user: {
          id: user.id,
          address: user.wallet_address,
          custodialWalletId: user.custodial_wallet_id,
        },
        body: parsedBody,
      },
    };
  } catch (error) {
    console.error("❌ Authentication error:", error);
    return {
      error: NextResponse.json(
        {
          error: "Authentication failed",
          code: "AUTH_FAILED",
        },
        { status: 500 }
      ),
    };
  }
}
