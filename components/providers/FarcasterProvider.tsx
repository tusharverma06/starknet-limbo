'use client';

import sdk from '@farcaster/miniapp-sdk';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface FarcasterContextType {
  isSDKLoaded: boolean;
  context: any;
  user: any;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isSDKLoaded: false,
  context: null,
  user: null,
});

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if ((await sdk.isInMiniApp())) {
      // Set loading to true when SDK starts loading
      setContext(sdk.context);

      // Wait for SDK to be ready
      sdk.actions.ready();

      setIsSDKLoaded(true);
      const context = await sdk.context
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
