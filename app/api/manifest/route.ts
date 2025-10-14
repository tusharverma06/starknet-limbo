import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: process.env.ACCOUNT_ASSOCIATION_HEADER,
    },
    frame: {
      version: '1',
      name: process.env.NEXT_PUBLIC_APP_NAME || 'Limbo Game',
      iconUrl: `${process.env.NEXT_PUBLIC_APP_URL}/icon.png`,
      splashImageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/splash.png`,
      splashBackgroundColor: '#0f172a',
      homeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/game`,
    },
  };

  return NextResponse.json(manifest);
}



