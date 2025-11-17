import type { Metadata } from "next";
import { Inter, Lilita_One } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Web3Provider";
import { FarcasterProvider } from "@/components/providers/FarcasterProvider";
import { Toaster } from "sonner";
import "@rainbow-me/rainbowkit/styles.css";

const inter = Inter({ subsets: ["latin"] });
const lilitaOne = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lilita-one",
});

const frame = {
  version: "1",
  imageUrl: "https://limbo-app.vercel.app/og.png",
  button: {
    title: "Play!",
    action: {
      type: "launch_frame",
      name: "Based Limbo",
      url: "https://limbo-app.vercel.app/",
      splashImageUrl: "https://limbo-app.vercel.app/og.png",
      splashBackgroundColor: "#eeccff",
    },
  },
};

export const metadata: Metadata = {
  title: "Based Limbo - Provably Fair",
  description:
    "Try your luck in a provably fair onchain betting game on Farcaster.",
  openGraph: {
    title: "Based Limbo - Provably Fair",
    description:
      "Try your luck in a provably fair onchain betting game on Farcaster.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/og.png`],
  },
  icons: {
    icon: "https://limbo-app.vercel.app/logo.png",
  },
  other: {
    "fc:miniapp": JSON.stringify(frame),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Quick Auth server for better performance */}
        <link rel="preconnect" href="https://auth.farcaster.xyz" />
      </head>
      <body className={`${inter.className} ${lilitaOne.variable}`}>
        <FarcasterProvider>
          <Providers>{children}</Providers>
          <Toaster position="top-center" richColors />
        </FarcasterProvider>
      </body>
    </html>
  );
}
