"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StarknetProvider } from "./StarknetProvider";
import { type ReactNode, useState } from "react";

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StarknetProvider>{children}</StarknetProvider>
    </QueryClientProvider>
  );
}
