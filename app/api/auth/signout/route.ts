import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/auth/signout
 * Clear SIWE authentication data
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fid } = body;

    if (!fid) {
      return NextResponse.json({ error: "fid is required" }, { status: 400 });
    }

    // Clear signer details
    await prisma.user.update({
      where: { farcaster_id: fid.toString() },
      data: {
        siweSignature: null,
        siweMessage: null,
        siweExpiresAt: null,
      },
    });

    console.log("✅ User signed out:", fid);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
