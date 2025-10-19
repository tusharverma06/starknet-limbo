import { Address } from "viem";
import { User } from "@/lib/generated/prisma-client";
import { prisma } from "./db/prisma";

export const getNeyNarWalletAddress = async (
  userFid: string
): Promise<Address | null> => {
  const options = {
    method: "GET",
    headers: { "x-api-key": process.env.NEYNAR_API_KEY!, cache: "no-store" },
  };

  const neynarUserJson = await fetch(
    "https://api.neynar.com/v2/farcaster/user/bulk?fids=" + userFid,
    options
  ).then((response) => response.json());

  if (
    !neynarUserJson ||
    !neynarUserJson.users ||
    neynarUserJson.users.length === 0
  ) {
    return null;
  }

  const neynarUser = neynarUserJson.users[0];

  const walletAddress = neynarUser.verified_addresses.primary.eth_address;

  return walletAddress as Address;
};

export const getOrCreateUser = async (
  userFid: string
): Promise<User | null> => {
  try {
    console.log('🔍 Fetching user from Neynar, FID:', userFid);

    const options = {
      method: "GET",
      headers: { "x-api-key": process.env.NEYNAR_API_KEY!, cache: "no-store" },
    };

    const response = await fetch(
      "https://api.neynar.com/v2/farcaster/user/bulk?fids=" + userFid,
      options
    );

    if (!response.ok) {
      console.error('❌ Neynar API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Neynar response:', errorText);
      return null;
    }

    const neynarUserJson = await response.json();

    if (
      !neynarUserJson ||
      !neynarUserJson.users ||
      neynarUserJson.users.length === 0
    ) {
      console.error('❌ No users found in Neynar response for FID:', userFid);
      return null;
    }

    const neynarUser = neynarUserJson.users[0];
    console.log('✅ Neynar user found:', neynarUser.username);

    const walletAddress = neynarUser.verified_addresses?.primary?.eth_address || null;

    const user = await prisma.user.upsert({
      where: { farcaster_id: String(userFid) },
      update: {
        farcaster_username: neynarUser.username,
        farcaster_pfp: neynarUser.pfp_url,
        wallet_address: walletAddress,
      },
      create: {
        farcaster_id: String(userFid),
        farcaster_username: neynarUser.username,
        farcaster_pfp: neynarUser.pfp_url,
        wallet_address: walletAddress,
      },
    });

    console.log('✅ User upserted in DB:', user.id);
    return user;
  } catch (error) {
    console.error('❌ Error in getOrCreateUser:', error);
    throw error;
  }
};
