import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import {
  deployStarknetAccount,
  isAccountDeployed,
} from "@/lib/starknet/deployWallet";
import { decryptPrivateKey } from "@/lib/utils/encryption";
import { getStrkBalance } from "@/lib/blockchain/starknet/getStrkBalance";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/wallet/deploy
 * Deploy user's custodial wallet on Starknet
 * Requires the wallet to have STRK balance for gas fees
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(req);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult.data;

    // Get custodial wallet with encrypted keys
    const userWithWallet = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        custodialWallet: {
          include: { wallet: true },
        },
      },
    });

    if (!userWithWallet?.custodialWallet?.wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const walletAddress = userWithWallet.custodialWallet.address;

    console.log("🔍 Deployment request for:", walletAddress);

    // Check if already deployed
    const isDeployed = await isAccountDeployed(walletAddress);
    if (isDeployed) {
      console.log("✅ Wallet already deployed");
      return NextResponse.json({
        success: true,
        message: "Wallet already deployed",
        address: walletAddress,
        alreadyDeployed: true,
      });
    }

    // Check STRK balance
    console.log("💰 Checking STRK balance...");
    const strkBalance = await getStrkBalance(walletAddress);
    const strkBalanceEth = Number(strkBalance) / 1e18;

    console.log(`   Balance: ${strkBalanceEth.toFixed(4)} STRK`);

    if (strkBalance === BigInt(0)) {
      return NextResponse.json(
        {
          error: "No STRK balance",
          message:
            "Please fund the wallet with STRK first. Send at least 0.001 STRK to cover deployment fees.",
          address: walletAddress,
        },
        { status: 400 }
      );
    }

    // Minimum required: 0.001 STRK (conservative estimate for deployment)
    const minimumRequired = BigInt("1000000000000000"); // 0.001 STRK in wei
    if (strkBalance < minimumRequired) {
      return NextResponse.json(
        {
          error: "Insufficient STRK",
          message: `Need at least 0.001 STRK for deployment. Current balance: ${strkBalanceEth.toFixed(4)} STRK`,
          address: walletAddress,
          currentBalance: strkBalance.toString(),
        },
        { status: 400 }
      );
    }

    // Decrypt private key
    console.log("🔓 Decrypting private key...");
    const privateKey = decryptPrivateKey(
      userWithWallet.custodialWallet.wallet.encryptedPrivateKey
    );

    // Deploy the account
    console.log("🚀 Deploying custodial wallet...");
    console.log("   This will take 30-60 seconds...");

    let txHash: string;
    let address: string;

    try {
      const result = await deployStarknetAccount(
        privateKey,
        walletAddress,
        false // No paymaster, use wallet's STRK balance
      );
      txHash = result.txHash;
      address = result.address;
    } catch (deployError: unknown) {
      console.error("❌ Deployment error:", deployError);

      // Handle specific Starknet/MetaMask errors
      const errorMessage = deployError instanceof Error ? deployError.message : String(deployError);
      const errorObj = deployError as { code?: number; message?: string; data?: { walletRpcError?: { code?: number } } };

      // MetaMask Snap error code 163 - deployment failed
      if (errorObj.data?.walletRpcError?.code === 163 || errorObj.code === 163) {
        return NextResponse.json(
          {
            error: "Account deployment failed",
            message: "This appears to be a MetaMask Starknet Snap error. Your custodial wallet uses OpenZeppelin account standard which may not be compatible with MetaMask Snap deployment. Please use the withdrawal feature instead - it will auto-deploy when needed.",
            address: walletAddress,
            details: "Error code 163: Incompatible account type or deployment parameters",
          },
          { status: 400 }
        );
      }

      // Account already deployed
      if (errorMessage.includes("already deployed") || errorMessage.includes("ALREADY_DEPLOYED")) {
        return NextResponse.json({
          success: true,
          message: "Wallet already deployed",
          address: walletAddress,
          alreadyDeployed: true,
        });
      }

      // Insufficient funds
      if (errorMessage.includes("Insufficient") || errorMessage.includes("insufficient")) {
        return NextResponse.json(
          {
            error: "Insufficient funds",
            message: "Not enough STRK to cover deployment fees. Please add more STRK and try again.",
            address: walletAddress,
          },
          { status: 400 }
        );
      }

      // Re-throw for generic error handler
      throw deployError;
    }

    console.log("✅ Wallet deployed successfully!");
    console.log("   TX Hash:", txHash);

    // Record deployment transaction in database
    await prisma.walletTransaction.create({
      data: {
        custodialWalletId: userWithWallet.custodialWallet.id,
        txHash,
        txType: "deploy",
        amount: "0", // Deployment fee is paid from balance
        status: "confirmed",
        confirmedAt: new Date(),
      },
    });

    console.log("📝 Deployment transaction recorded");

    const network =
      process.env.NEXT_PUBLIC_STARKNET_NETWORK || "mainnet";
    const explorerUrl =
      network === "sepolia"
        ? `https://sepolia.starkscan.co/tx/${txHash}`
        : `https://starkscan.co/tx/${txHash}`;

    return NextResponse.json({
      success: true,
      txHash,
      address,
      explorerUrl,
      message: "Wallet deployed successfully! You can now place bets.",
    });
  } catch (error) {
    console.error("❌ Deployment failed:", error);

    return NextResponse.json(
      {
        error: "Deployment failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
