import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { CHAIN } from "./constants";

export const config = getDefaultConfig({
  appName: "Limbo",
  projectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [CHAIN],
  ssr: true,
});
