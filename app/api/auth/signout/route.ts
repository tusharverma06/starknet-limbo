import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/auth/signout
 * Clear SIWE authentication data
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Clear SIWE data
    await prisma.user.update({
      where: { id: userId },
      data: {
        siweSignature: null,
        siweMessage: null,
        siweExpiresAt: null,
      },
    });

    console.log("✅ User signed out:", userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
