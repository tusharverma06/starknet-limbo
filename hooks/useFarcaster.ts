import sdk from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import { useFarcasterContext } from "@/components/providers/FarcasterProvider";

export function useFarcaster() {
  const { isSDKLoaded, context, user } = useFarcasterContext();
  const [isInMiniApp, setIsInMiniApp] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsInMiniApp(await sdk.isInMiniApp());
    };
    load();
  }, []);

  // Sign in with Farcaster

  // Open URL
  const openUrl = (url: string) => {
    sdk.actions.openUrl(url);
  };

  // Close mini app
  const close = () => {
    sdk.actions.close();
  };

  // Add mini app to user's apps
  const addMiniApp = async () => {
    try {
      await sdk.actions.addMiniApp();
    } catch (error) {
      console.error("Add mini app failed:", error);
    }
  };

  // Share cast with game result
  // const shareCast = async (text: string, embeds?: string[]) => {
  //   try {
  //     await sdk.actions.composeCast({
  //       text,
  //       embeds,
  //     });
  //   } catch (error) {
  //     console.error('Share cast failed:', error);
  //   }
  // };

  return {
    isSDKLoaded,
    isInMiniApp,
    context,
    user,
    openUrl,
    close,
    addMiniApp,
  };
}
