import { NextRequest, NextResponse } from 'next/server';
import { JsonRpcProvider, Wallet, parseEther } from 'ethers';
import { walletDb } from '@/lib/db/wallets';
import { decryptPrivateKey } from '@/lib/utils/encryption';
import { getEthValueFromUsd } from '@/lib/utils/price';
import { CHAIN } from '@/lib/contract/config';

/**
 * POST /api/wallet/fund
 * Fund server wallet with ETH (converted from USD amount)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, usdAmount } = body;

    // Validate inputs
    if (!userId || !usdAmount) {
      return NextResponse.json(
        { error: 'userId and usdAmount are required' },
        { status: 400 }
      );
    }

    // Validate amount
    const usdAmountNum = parseFloat(usdAmount);
    if (isNaN(usdAmountNum) || usdAmountNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid USD amount' },
        { status: 400 }
      );
    }

    // Convert USD to ETH
    const ethAmount = await getEthValueFromUsd(usdAmountNum);
    if (ethAmount <= 0) {
      return NextResponse.json(
        { error: 'Failed to convert USD to ETH' },
        { status: 400 }
      );
    }

    // Get wallet from database
    const walletData = await walletDb.getWallet(userId);
    if (!walletData) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Return the wallet address and ETH amount for client to send transaction
    return NextResponse.json({
      success: true,
      walletAddress: walletData.address,
      ethAmount: ethAmount.toString(),
      usdAmount: usdAmountNum,
    });
  } catch (error: any) {
    console.error('Fund wallet error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process funding request',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

