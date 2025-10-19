"use client";

import sdk from "@farcaster/miniapp-sdk";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface FarcasterUser {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface FarcasterContext {
  client?: {
    safeAreaInsets?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    clientFid?: number;
  };
  user?: FarcasterUser;
}

interface FarcasterContextType {
  isSDKLoaded: boolean;
  context: FarcasterContext | null;
  user: FarcasterUser | null;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isSDKLoaded: false,
  context: null,
  user: null,
});

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [user, setUser] = useState<FarcasterUser | null>(null);

  useEffect(() => {
    const load = async () => {
      if (await sdk.isInMiniApp()) {
        // Wait for SDK to be ready
        sdk.actions.ready();

        setIsSDKLoaded(true);
        const context = await sdk.context;
        setContext(context);

        // Get user info if authenticated
        if (context.user) {
          setUser(context.user);
        }
      } else {
        // If not in mini app, mark as loaded anyway for development
        setIsSDKLoaded(true);
      }
    };

    // Check if we're in a mini app
    load();
  }, []);

  return (
    <FarcasterContext.Provider value={{ isSDKLoaded, context, user }}>
      {children}
    </FarcasterContext.Provider>
  );
}

export const useFarcasterContext = () => useContext(FarcasterContext);
