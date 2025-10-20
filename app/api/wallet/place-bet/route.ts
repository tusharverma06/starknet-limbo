import { NextRequest, NextResponse } from "next/server";
import {
  JsonRpcProvider,
  Wallet,
  parseEther,
  Contract,
  randomBytes,
} from "ethers";
import { walletDb } from "@/lib/db/wallets";
import { decryptPrivateKey } from "@/lib/utils/encryption";
import { getEthValueFromUsd } from "@/lib/utils/price";
import { CHAIN, CONTRACT_ADDRESS } from "@/lib/contract/config";
import { LIMBO_GAME_ABI } from "@/lib/contract/abi";
import { toContractMultiplier } from "@/lib/utils/multiplier";
import { MIN_BET_USD } from "@/lib/constants";
import { estimateContractGas } from "@/lib/utils/gas";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/wallet/place-bet
 * Place a bet using the server-side wallet
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, usdBetAmount, targetMultiplier } = body;

    // Validate inputs
    if (!userId || !usdBetAmount || !targetMultiplier) {
      return NextResponse.json(
        { error: "userId, usdBetAmount, and targetMultiplier are required" },
        { status: 400 }
      );
    }

    // Validate bet amount
    const usdAmountNum = parseFloat(usdBetAmount);
    if (isNaN(usdAmountNum) || usdAmountNum <= 0) {
      return NextResponse.json(
        { error: "Invalid USD bet amount" },
        { status: 400 }
      );
    }

    // Check minimum bet requirement
    if (usdAmountNum < MIN_BET_USD) {
      return NextResponse.json(
        { error: `Minimum bet is $${MIN_BET_USD} USD` },
        { status: 400 }
      );
    }

    // Convert USD to ETH
    console.log("💵 USD bet amount:", usdAmountNum);
    const ethAmount = await getEthValueFromUsd(usdAmountNum);
    console.log("💎 ETH amount after conversion:", ethAmount);

    if (ethAmount <= 0) {
      return NextResponse.json(
        { error: "Failed to convert USD to ETH" },
        { status: 400 }
      );
    }

    // Validate ETH amount is reasonable based on USD amount
    // For minimum bet of $1.00, at ETH price of ~$2000-5000, we expect 0.0002-0.0005 ETH
    // If the calculated amount is less than what $0.01 should be at $10,000 ETH price,
    // something is wrong with the price feed
    const minimumReasonableEth = 0.000001; // ~$0.01 at $10,000 ETH
    if (ethAmount < minimumReasonableEth) {
      console.error(
        "⚠️ Suspiciously low ETH amount. Price conversion may have failed.",
        { usdAmount: usdAmountNum, ethAmount, minimumReasonableEth }
      );
      return NextResponse.json(
        {
          error: "Price conversion failed",
          message:
            "Unable to get accurate ETH price. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    // Validate multiplier
    const multiplierNum = parseFloat(targetMultiplier);
    if (isNaN(multiplierNum) || multiplierNum < 1.01) {
      return NextResponse.json(
        { error: "Invalid target multiplier" },
        { status: 400 }
      );
    }

    // Get user from database (userId is Farcaster FID)
    const user = await getOrCreateUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get or create user' },
        { status: 500 }
      );
    }

    // Get wallet from database
    const walletData = await walletDb.getWallet(user.id);
    if (!walletData) {
      return NextResponse.json(
        { error: "Wallet not found. Please create a wallet first." },
        { status: 404 }
      );
    }

    // Decrypt private key
    const privateKey = decryptPrivateKey(walletData.encryptedPrivateKey);

    // Create provider and wallet using Alchemy RPC
    const rpcUrl =
      process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || CHAIN.rpcUrls.default.http[0];
    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(privateKey, provider);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    // Round to 18 decimals to avoid parseEther precision errors
    const ethAmountRounded = parseFloat(ethAmount.toFixed(18));
    const betAmountWei = parseEther(ethAmountRounded.toString());

    console.log("💰 Wallet balance:", balance.toString());
    console.log("💰 Bet amount:", betAmountWei.toString());

    // Estimate gas for the transaction
    const contract = new Contract(CONTRACT_ADDRESS, LIMBO_GAME_ABI, wallet);
    const contractMultiplier = toContractMultiplier(multiplierNum);

    // Generate client seed for provably fair gaming
    const clientSeed = randomBytes(32);

    // Check house balance and potential payout
    try {
      const houseBalance = await contract.houseBalance();
      // Calculate potential payout using contract multiplier
      const potentialPayout =
        (betAmountWei * BigInt(contractMultiplier)) / BigInt(100);

      console.log("🏠 House balance:", houseBalance.toString());
      console.log("💰 Potential payout:", potentialPayout.toString());
      console.log("🎯 Contract multiplier:", contractMultiplier);

      if (houseBalance < potentialPayout) {
        return NextResponse.json(
          {
            error: "House has insufficient funds to cover potential payout",
            houseBalance: houseBalance.toString(),
            potentialPayout: potentialPayout.toString(),
            message:
              "The house needs more funding. Please contact support or try a smaller bet.",
          },
          { status: 400 }
        );
      }
    } catch (balanceError) {
      console.error("House balance check error:", balanceError);
      // Continue anyway - let the gas estimation catch it
    }

    // Log bet amount for debugging
    console.log("✅ Bet amount validation passed:", {
      usdAmount: usdAmountNum,
      ethAmount: ethAmountRounded,
      betAmountWei: betAmountWei.toString(),
    });

    try {
      // Use the gas estimation utility
      const gasEstimation = await estimateContractGas(
        contract,
        "placeBet",
        [BigInt(contractMultiplier), clientSeed],
        betAmountWei
      );

      const { gasLimit, gasPrice, totalCost } = gasEstimation;

      console.log("⛽ Gas limit:", gasLimit.toString());
      console.log("⛽ Gas price:", gasPrice.toString(), "wei");
      console.log("⛽ Total gas cost:", totalCost.toString());

      // Check if we have enough for bet + gas
      if (balance < betAmountWei + totalCost) {
        return NextResponse.json(
          {
            error: "Insufficient balance",
            required: (betAmountWei + totalCost).toString(),
            available: balance.toString(),
            needsToFund: (betAmountWei + totalCost - balance).toString(),
          },
          { status: 400 }
        );
      }
    } catch (estimateError) {
      console.error("❌ Gas estimation error:", estimateError);
      console.error("📊 Failed transaction details:", {
        betAmountWei: betAmountWei.toString(),
        contractMultiplier,
        balance: balance.toString(),
        walletAddress: wallet.address,
      });

      // Provide more helpful error messages
      let errorMessage = "Contract call would fail";
      if (estimateError instanceof Error && estimateError.message) {
        if (estimateError.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        } else if (
          estimateError.message.includes("require(false)") ||
          estimateError.message.includes("execution reverted")
        ) {
          errorMessage =
            "Bet rejected by contract. The bet amount is too small to cover VRF callback gas costs. Minimum bet is $1 USD.";
        } else if ((estimateError as { reason?: string }).reason) {
          errorMessage = `Transaction would revert: ${
            (estimateError as { reason?: string }).reason
          }`;
        }
      }

      return NextResponse.json(
        {
          error: "Failed to estimate gas",
          message: errorMessage,
          details:
            estimateError instanceof Error
              ? estimateError.message
              : "Unknown error",
        },
        { status: 400 }
      );
    }

    // Place the bet
    console.log("🎲 Placing bet:", {
      usdBetAmount: usdAmountNum,
      ethAmount: ethAmountRounded,
      targetMultiplier,
      contractMultiplier,
      contractAddress: CONTRACT_ADDRESS,
    });

    const tx = await contract.placeBet(BigInt(contractMultiplier), clientSeed, {
      value: betAmountWei,
    });
    console.log(tx);
    console.log("📝 Bet transaction sent:", tx.hash);

    // Record pending transaction
    await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        txHash: tx.hash,
        txType: 'bet',
        amount: betAmountWei.toString(),
        status: 'pending',
      }
    });
    console.log("📝 Wallet transaction recorded");

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("🎲 Receipt:", receipt.logs);

    // Update transaction status
    await prisma.walletTransaction.updateMany({
      where: { txHash: tx.hash },
      data: {
        status: 'confirmed',
        blockNumber: BigInt(receipt?.blockNumber || 0),
        gasUsed: receipt?.gasUsed?.toString() || '0',
        confirmedAt: new Date(),
      }
    });
    console.log("✅ Transaction confirmed in database");

    // Update last used timestamp
    await walletDb.updateLastUsed(user.id);

    // Update balance
    const newBalance = await provider.getBalance(wallet.address);
    await walletDb.updateBalance(user.id, newBalance.toString());

    console.log("✅ Bet confirmed:", receipt?.hash);

    // Extract BetPlaced event from receipt
    let requestId = null;
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });
          if (parsedLog && parsedLog.name === "BetPlaced") {
            requestId = parsedLog.args.requestId?.toString();
            console.log("🎰 BetPlaced event found, requestId:", requestId);
          }
        } catch {
          // Not a BetPlaced event, skip
        }
      }
    }

    return NextResponse.json({
      success: true,
      txHash: receipt?.hash,
      requestId,
      usdBetAmount: usdAmountNum,
      ethAmount: ethAmountRounded,
      targetMultiplier,
      blockNumber: receipt?.blockNumber,
      newBalance: newBalance.toString(),
      clientSeed: clientSeed,
    });
  } catch (error) {
    console.error("Place bet error:", error);
    return NextResponse.json(
      {
        error: "Bet placement failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
