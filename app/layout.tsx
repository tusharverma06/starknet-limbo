import type { Metadata } from "next";
import { Inter, Lilita_One } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { Ponder } from "@/components/providers/PonderProvider";
import { Toaster } from "sonner";
import "@rainbow-me/rainbowkit/styles.css";

const inter = Inter({ subsets: ["latin"] });
const lilitaOne = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lilita-one",
});

export const metadata: Metadata = {
  title: "Starknet Limbo - Provably Fair",
  description: "Try your luck in a provably fair onchain betting game.",
  openGraph: {
    title: "Starknet Limbo - Provably Fair",
    description: "Try your luck in a provably fair onchain betting game.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/og.png`],
  },
  icons: {
    icon: "https://limbo-app.vercel.app/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${lilitaOne.variable}`}>
        <Web3Provider>
          <Ponder>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {children as any}
          </Ponder>
        </Web3Provider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
