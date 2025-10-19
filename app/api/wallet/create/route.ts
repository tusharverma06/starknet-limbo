import { NextRequest, NextResponse } from 'next/server';
import { Wallet } from 'ethers';
import { encryptPrivateKey } from '@/lib/utils/encryption';
import { walletDb } from '@/lib/db/wallets';
import { getOrCreateUser } from '@/lib/getOrCreateUser';

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

    // Get or create user in database (userId is Farcaster FID)
    const user = await getOrCreateUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get or create user' },
        { status: 500 }
      );
    }

    // Check if wallet already exists (use database user ID)
    const existingWallet = await walletDb.getWallet(user.id);
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

    // Store in database (use database user ID, not Farcaster FID)
    const walletData = await walletDb.createWallet(
      user.id,
      address,
      encryptedPrivateKey
    );

    console.log('✅ Created wallet for user:', userId, '(DB ID:', user.id, ') address:', address);

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

    // Get user from database (userId is Farcaster FID)
    const user = await getOrCreateUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get or create user' },
        { status: 500 }
      );
    }

    const wallet = await walletDb.getWallet(user.id);

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

