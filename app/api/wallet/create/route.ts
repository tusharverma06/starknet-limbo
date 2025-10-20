import { NextRequest, NextResponse } from 'next/server';
import { Wallet } from 'ethers';
import { encryptPrivateKey } from '@/lib/utils/encryption';
import { walletDb } from '@/lib/db/wallets';
import { getOrCreateUser } from '@/lib/getOrCreateUser';
import { prisma } from '@/lib/db/prisma';

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

    console.log('📝 Creating wallet for Farcaster FID:', userId);

    // Get or create user in database (userId is Farcaster FID)
    let user;
    try {
      user = await getOrCreateUser(userId);
      if (!user) {
        console.error('❌ getOrCreateUser returned null for FID:', userId);
        return NextResponse.json(
          { error: 'Failed to get or create user. Please check your Farcaster account.' },
          { status: 500 }
        );
      }
      console.log('✅ User retrieved/created:', user.id, user.farcaster_username);
    } catch (userError) {
      console.error('❌ Error in getOrCreateUser:', userError);
      return NextResponse.json(
        {
          error: 'Failed to fetch user from Farcaster',
          details: userError instanceof Error ? userError.message : 'Unknown error'
        },
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
    console.log('🔐 Generating new wallet...');
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const privateKey = wallet.privateKey;
    console.log('✅ Wallet generated:', address);

    // Encrypt the private key
    console.log('🔒 Encrypting private key...');
    const encryptedPrivateKey = encryptPrivateKey(privateKey);
    console.log('✅ Private key encrypted');

    // Store in database (use database user ID, not Farcaster FID)
    console.log('💾 Storing wallet in database for user ID:', user.id);
    let walletData;
    try {
      walletData = await walletDb.createWallet(
        user.id,
        address,
        encryptedPrivateKey
      );
      console.log('✅ Wallet stored in database');

      // Update user with server wallet address
      await prisma.user.update({
        where: { id: user.id },
        data: { server_wallet_address: address }
      });
      console.log('✅ Updated user with server wallet address');

      console.log('✅ Created wallet for user:', userId, '(DB ID:', user.id, ') address:', address);
    } catch (dbError) {
      console.error('❌ Database error when creating wallet:', dbError);
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      address: walletData.address,
      createdAt: walletData.createdAt,
    });
  } catch (error) {
    console.error('❌ Wallet creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { message: errorMessage, stack: errorStack });

    return NextResponse.json(
      {
        error: 'Failed to create wallet',
        details: errorMessage
      },
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

