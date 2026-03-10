"use client";

import { PonderProvider } from "@ponder/react";
import { client } from "@/lib/client";
import { ReactNode } from "react";

export function Ponder({ children }: { children: ReactNode }) {
  return <PonderProvider client={client}>{children}</PonderProvider>;
}
