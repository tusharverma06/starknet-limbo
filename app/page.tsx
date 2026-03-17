"use client";

import { DeploymentGate } from "@/components/game/DeploymentGate";
import { MiniappGameBoard } from "@/components/game/MiniappGameBoard";

export default function GamePage() {
  return (
    <DeploymentGate>
      <MiniappGameBoard />;
    </DeploymentGate>
  );
}
