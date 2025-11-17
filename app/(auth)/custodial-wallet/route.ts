import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { walletDb } from "@/lib/db/wallets";

/**
 * POST /api/custodial-wallet
 * Get or create custodial wallet address for SIWE message
 * This is called BEFORE signing to get the address to include in the message
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, fid, username, pfp } = body;

    if (!address) {
      return NextResponse.json(
        { error: "address is required" },
        { status: 400 }
      );
    }

    console.log("📝 Getting custodial wallet for:", { address, fid });

    let user;
    console.log("fid", fid);
    console.log("username", username);
    console.log("pfp", pfp);
    console.log("address", address);

    // Find or create user
    if (fid) {
      user = await prisma.user.findUnique({
        where: { farcaster_id: fid.toString() },
      });
      console.log("user", user);

      if (!user) {
        console.log("Creating new user");
        user = await prisma.user.create({
          data: {
            farcaster_id: fid.toString(),
            farcaster_username: username || `user-${fid}`,
            farcaster_pfp: pfp || null,
            wallet_address: address.toLowerCase(),
          },
        });
        console.log("✅ New user created:", user.id);
      }
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Get or create custodial wallet
    let wallet = await walletDb.getWallet(user.id);
    console.log("wallet", wallet);
    if (!wallet) {
      console.log("📝 Creating custodial wallet...");
      wallet = await walletDb.createCustodialWallet(user.id);
      console.log("✅ Custodial wallet created:", wallet.address);
    }
    console.log("wallet", wallet);
    return NextResponse.json({
      custodialWalletAddress: wallet.address,
    });
  } catch (error) {
    console.error("❌ Error getting custodial wallet:", error);
    return NextResponse.json(
      {
        error: "Failed to get custodial wallet",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
