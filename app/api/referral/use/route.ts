import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const REFERRAL_POINTS = 50;
const MAX_REFERRALS = 50;

/**
 * POST /api/referral/use
 *
 * Process a referral code when a new user lands on the site.
 * Awards points to the referrer if valid.
 *
 * Request: { fid: "123", referrerFid: "456" }
 */
export async function POST(req: NextRequest) {
  try {
    const { fid, referrerFid } = await req.json();

    if (!fid || !referrerFid) {
      return NextResponse.json(
        { error: "fid and referrerFid are required" },
        { status: 400 }
      );
    }

    // Can't refer yourself
    if (fid === referrerFid) {
      return NextResponse.json(
        { error: "Cannot use your own referral code" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { farcaster_id: fid },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if referrer exists
    const referrer = await prisma.user.findUnique({
      where: { farcaster_id: referrerFid },
      include: {
        _count: {
          select: { referralsGiven: true },
        },
      },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Referrer not found" },
        { status: 404 }
      );
    }

    // Check if referrer has reached max referrals
    if (referrer._count.referralsGiven >= MAX_REFERRALS) {
      return NextResponse.json(
        { error: "Referrer has reached maximum referrals" },
        { status: 400 }
      );
    }

    // Check if this referral already exists
    const existingReferral = await prisma.referral.findUnique({
      where: {
        referrerId_referredId: {
          referrerId: referrer.id,
          referredId: user.id,
        },
      },
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: "Referral already used" },
        { status: 400 }
      );
    }

    // Create referral and award points
    await prisma.$transaction(async (tx) => {
      // Create referral record
      await tx.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: user.id,
          points: REFERRAL_POINTS,
        },
      });

      // Award points to referrer
      await tx.user.update({
        where: { id: referrer.id },
        data: {
          totalPoints: {
            increment: REFERRAL_POINTS,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      points: REFERRAL_POINTS,
      message: `${referrer.farcaster_username} earned ${REFERRAL_POINTS} points!`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process referral" },
      { status: 500 }
    );
  }
}
