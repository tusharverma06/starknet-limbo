import { NextRequest, NextResponse } from 'next/server';
import { JsonRpcProvider, formatEther } from 'ethers';
import { walletDb } from '@/lib/db/wallets';
import { getUsdValueFromEth } from '@/lib/utils/price';
import { CHAIN } from '@/lib/contract/config';

/**
 * GET /api/wallet/balance?userId=xxx
 * Get the current balance of a user's wallet
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const wallet = await walletDb.getWallet(userId);

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Get balance from blockchain using Alchemy RPC
    const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || CHAIN.rpcUrls.default.http[0];
    const provider = new JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(wallet.address);

    // Update cached balance
    await walletDb.updateBalance(userId, balance.toString());

    // Convert to USD
    const ethBalance = parseFloat(formatEther(balance));
    const usdBalance = await getUsdValueFromEth(ethBalance);

    return NextResponse.json({
      address: wallet.address,
      balance: balance.toString(),
      balanceInEth: ethBalance,
      balanceInUsd: usdBalance,
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}

