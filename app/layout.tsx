import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Web3Provider";
import { FarcasterProvider } from "@/components/providers/FarcasterProvider";
import "@rainbow-me/rainbowkit/styles.css";

const inter = Inter({ subsets: ["latin"] });

// const frame = {
//   version: "1",
//   imageUrl: "https://limbo-app.vercel.app/",
//   button: {
//     title: "Clean Wallet",
//     action: {
//       type: "launch_frame",
//       name: "Scrap",
//       url: "https://4da924eb35eb.ngrok-free.app/",
//       splashImageUrl: "https://limbo-app.vercel.app/",
//       splashBackgroundColor: "#0A0A0A",
//     },
//   },
// };

export const metadata: Metadata = {
  title: "Limbo Game - Provably Fair",
  description: "Play Limbo with Chainlink VRF for provably fair randomness",
  openGraph: {
    title: "Limbo Game",
    description: "Provably fair limbo game powered by Chainlink VRF",
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/splash.png`],
  },
  // other: {
  //   "fc:miniapp": JSON.stringify(frame),
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FarcasterProvider>
          <Providers>{children}</Providers>
        </FarcasterProvider>
      </body>
    </html>
  );
}
