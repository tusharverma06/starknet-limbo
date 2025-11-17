"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { createConfig, http, type Config } from "wagmi";
import { CHAIN } from "@/lib/constants";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { sdk } from "@farcaster/miniapp-sdk";
import { type ReactNode, useState, useEffect } from "react";
import { Ponder } from "./PonderProvider";

const queryClient = new QueryClient();

const baseConfig = createConfig({
  chains: [CHAIN],
  transports: {
    [CHAIN.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>(baseConfig);

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        await sdk.actions.ready();

        const isInMiniApp = await sdk.isInMiniApp();
        if (isInMiniApp) {
          const newConfig = createConfig({
            chains: [CHAIN],
            connectors: [miniAppConnector()],
            transports: {
              [CHAIN.id]: http(),
            },
          });
          console.log("🟣 Mini App config created:", newConfig);
          setConfig(newConfig);
          console.log("🟣 Mini App config set successfully");
        }
      } catch (error) {
        console.error("MiniApp init error:", error);
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
          initialChain={CHAIN}
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
