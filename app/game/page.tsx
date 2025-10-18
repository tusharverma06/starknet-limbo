"use client";

import { useEffect } from "react";
import { MiniappGameBoard } from "@/components/game/MiniappGameBoard";
import { useFarcaster } from "@/hooks/useFarcaster";
import { useConnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";

export default function GamePage() {
  const { connect, connectors } = useConnect();
  const { isInMiniApp, user } = useFarcaster();

  useEffect(() => {
    if (isInMiniApp && !user && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [isInMiniApp, user, connect, connectors]);

  const handleConnect = () => {
    if (isInMiniApp && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-black">Connect with Farcaster</h2>
          <p className="text-gray-600">
            You need to connect with Farcaster to play
          </p>
          <Button size="lg" onClick={handleConnect}>
            Connect
          </Button>
        </div>
      </div>
    );
  }

  return <MiniappGameBoard />;
}
