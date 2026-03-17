import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { walletDb } from "@/lib/db/wallets";
import { starknetWalletDb } from "@/lib/db/starknetWallets";

/**
 * POST /api/session/link-wallet
 * Links an external wallet address to a custodial wallet
 *
 * Flow:
 * 1. Check if wallet already exists in database
 * 2. If yes: Return existing custodial wallet
 * 3. If no: Create new user + custodial wallet
 * 4. Optionally save SIWE signature if provided
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet_address, siwe_message, siwe_signature, session_id } = body;

    if (!wallet_address) {
      return NextResponse.json(
        { error: "wallet_address is required" },
        { status: 400 }
      );
    }

    const normalizedAddress = wallet_address.toLowerCase();
    const sessionId: string | null =
      typeof session_id === "string" && session_id.trim().length > 0
        ? session_id
        : null;

    console.log("🔗 Processing wallet connection:", normalizedAddress);

    // Check if user already exists for this wallet address
    let user = await prisma.user.findUnique({
      where: { wallet_address: normalizedAddress },
      include: {
        custodialWallet: true,
      },
    });

    if (user) {
      console.log("✅ Existing user found:", user.id);

      // Attach session to existing user if provided
      if (sessionId && user.sessionId !== sessionId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { sessionId },
          include: { custodialWallet: true },
        });
      }

      // Update SIWE data if provided
      if (siwe_message && siwe_signature) {
        console.log("💾 Updating SIWE signature...");
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            siwe_message,
            siwe_signature,
            siwe_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          include: {
            custodialWallet: true,
          },
        });
        console.log("✅ SIWE signature updated");
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          wallet_address: user.wallet_address,
          custodial_wallet_id: user.custodial_wallet_id,
        },
        custodial_wallet: user.custodialWallet.address,
        is_new: false,
      });
    }

    // If no user for this wallet address, try to reuse an existing custodial wallet
    // based on the browser session (allows multiple wallets to share one custodial wallet)
    let custodialWalletIdToUse: string | null = null;

    if (sessionId) {
      const existingSessionUser = await prisma.user.findFirst({
        where: { sessionId },
        include: { custodialWallet: true },
      });

      if (existingSessionUser && existingSessionUser.custodialWallet) {
        console.log(
          "🔁 Reusing custodial wallet from existing session user:",
          existingSessionUser.id,
        );
        custodialWalletIdToUse = existingSessionUser.custodial_wallet_id;
      }
    }

    // If no existing session user, create a new custodial wallet
    if (!custodialWalletIdToUse) {
      console.log("✨ Creating new user and custodial wallet...");

      // Detect if wallet is Starknet (>42 chars) or EVM (42 chars)
      const isStarknetAddress = normalizedAddress.length > 42;

      let custodialWalletData;
      if (isStarknetAddress) {
        console.log("🔷 Creating Starknet custodial wallet...");
        custodialWalletData = await starknetWalletDb.createCustodialWallet("mainnet");
      } else {
        console.log("🔶 Creating EVM custodial wallet...");
        custodialWalletData = await walletDb.createCustodialWallet();
      }

      console.log("✅ Custodial wallet created:", custodialWalletData.address);
      custodialWalletIdToUse = custodialWalletData.custodialWalletId;
    }

    // Create user linked to custodial wallet
    const siweData: {
      siwe_message?: string;
      siwe_signature?: string;
      siwe_expires_at?: Date;
    } = {};
    if (siwe_message && siwe_signature) {
      siweData.siwe_message = siwe_message;
      siweData.siwe_signature = siwe_signature;
      siweData.siwe_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    try {
      user = await prisma.user.create({
        data: {
          wallet_address: normalizedAddress,
          custodial_wallet_id: custodialWalletIdToUse,
          sessionId: sessionId ?? undefined,
          ...siweData,
        },
        include: {
          custodialWallet: true,
        },
      });

      console.log("✅ User created:", {
        user_id: user.id,
        wallet: normalizedAddress,
        custodial: user.custodialWallet.address,
      });
    } catch (createError) {
      // Handle race condition: wallet address already exists (P2002)
      if (
        createError &&
        typeof createError === "object" &&
        "code" in createError &&
        createError.code === "P2002"
      ) {
        console.log("⚠️  User already exists (concurrent request), fetching existing user...");

        // Fetch the existing user
        const existingUser = await prisma.user.findUnique({
          where: { wallet_address: normalizedAddress },
          include: { custodialWallet: true },
        });

        if (!existingUser) {
          throw new Error("User creation race condition - user not found after conflict");
        }

        user = existingUser;
        console.log("✅ Existing user found:", {
          user_id: user.id,
          wallet: normalizedAddress,
          custodial: user.custodialWallet?.address,
        });
      } else {
        // Re-throw if not a unique constraint error
        throw createError;
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        wallet_address: user.wallet_address,
        custodial_wallet_id: user.custodial_wallet_id,
      },
      custodial_wallet: user.custodialWallet.address,
      is_new: true,
    });
  } catch (error) {
    console.error("❌ Error linking wallet:", error);
    return NextResponse.json(
      {
        error: "Failed to link wallet",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
