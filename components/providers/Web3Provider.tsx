"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { createConfig, http, type Config } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { sdk } from "@farcaster/miniapp-sdk";
import { type ReactNode, useState, useEffect } from "react";
import { Ponder } from "./PonderProvider";

const queryClient = new QueryClient();

const baseConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>(baseConfig);
  // const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        console.log("🚀 Initializing Farcaster Mini App...");

        await sdk.actions.ready();

        const isInMiniApp = await sdk.isInMiniApp();
        if (isInMiniApp) {
          console.log("🟣 Configuring Farcaster Mini App wallet connector...");
          const newConfig = createConfig({
            chains: [baseSepolia],
            connectors: [miniAppConnector()],
            transports: {
              [baseSepolia.id]: http(),
            },
          });
          console.log("🟣 Mini App config created:", newConfig);
          setConfig(newConfig);
          console.log("🟣 Mini App config set successfully");
        }
      } catch (error) {
        console.log("ℹ️ Not in Farcaster context, using base config:", error);
      } finally {
        // setIsInitialized(true);
      }
    };

    initMiniApp();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme()}
          coolMode={true}
          showRecentTransactions={true}
          modalSize="compact"
          initialChain={baseSepolia}
        >
          <Ponder>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {children as any}
          </Ponder>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
