import { http, createConfig } from "wagmi";
import { CHAIN } from "@/lib/constants";

export const config = createConfig({
  chains: [CHAIN],
  transports: {
    [CHAIN.id]: http(),
  },
});
