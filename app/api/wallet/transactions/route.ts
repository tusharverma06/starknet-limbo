import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getOrCreateUser } from '@/lib/getOrCreateUser';

/**
 * GET /api/wallet/transactions?userId=xxx
 * Get wallet transactions for a user
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

    // Get transactions for this user
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 transactions
    });

    return NextResponse.json({
      transactions: transactions.map(tx => ({
        id: tx.id,
        txHash: tx.txHash,
        txType: tx.txType,
        amount: tx.amount,
        status: tx.status,
        blockNumber: tx.blockNumber?.toString(),
        gasUsed: tx.gasUsed,
        createdAt: tx.createdAt.toISOString(),
        confirmedAt: tx.confirmedAt?.toISOString(),
      }))
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get wallet transactions' },
      { status: 500 }
    );
  }
}
