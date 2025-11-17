import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/signout
 * Clear session cookie and SIWE authentication data
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, fid } = body;

    if (!address && !fid) {
      return NextResponse.json(
        { error: "address or fid is required" },
        { status: 400 }
      );
    }

    let user;

    if (fid) {
      user = await prisma.user.findUnique({
        where: { farcaster_id: fid },
      });
    } else if (address) {
      user = await prisma.user.findFirst({
        where: { wallet_address: address.toLowerCase() },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete all sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Clear SIWE data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        siweSignature: null,
        siweMessage: null,
        siweExpiresAt: null,
      },
    });

    console.log("✅ User signed out:", user.farcaster_id);

    // Create response and clear session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete("session_id");

    return response;
  } catch (error) {
    console.error("❌ Sign out error:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
