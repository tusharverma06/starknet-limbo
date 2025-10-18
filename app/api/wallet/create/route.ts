import { NextRequest, NextResponse } from 'next/server';
import { Wallet } from 'ethers';
import { encryptPrivateKey } from '@/lib/utils/encryption';
import { walletDb } from '@/lib/db/wallets';

/**
 * POST /api/wallet/create
 * Create a new server-side wallet for a user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if wallet already exists
    const existingWallet = await walletDb.getWallet(userId);
    if (existingWallet) {
      return NextResponse.json(
        {
          error: 'Wallet already exists',
          address: existingWallet.address,
        },
        { status: 409 }
      );
    }

    // Create a new random wallet
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const privateKey = wallet.privateKey;

    // Encrypt the private key
    const encryptedPrivateKey = encryptPrivateKey(privateKey);

    // Store in database
    const walletData = await walletDb.createWallet(
      userId,
      address,
      encryptedPrivateKey
    );

    console.log('✅ Created wallet for user:', userId, 'address:', address);

    return NextResponse.json({
      success: true,
      address: walletData.address,
      createdAt: walletData.createdAt,
    });
  } catch (error) {
    console.error('Wallet creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create wallet' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet/create?userId=xxx
 * Get wallet info for a user
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

    // Return wallet info without private key
    return NextResponse.json({
      address: wallet.address,
      createdAt: wallet.createdAt,
      balance: wallet.balance || '0',
      lastUsed: wallet.lastUsed,
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to get wallet' },
      { status: 500 }
    );
  }
}

