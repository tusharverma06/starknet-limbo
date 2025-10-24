"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSiweAuth } from "@/hooks/useSiweAuth";
import { useServerWallet } from "@/hooks/useServerWallet";
import { useFarcaster } from "@/hooks/useFarcaster";
import { Shield, LogOut, Loader2 } from "lucide-react";

export function SiweAuthButton() {
  const { user } = useFarcaster();
  const userId = user?.fid?.toString() || null;
  const { wallet } = useServerWallet(userId);
  const {
    isConnected,
    connectedAddress,
    isAuthenticated,
    custodialWallet,
    isSigning,
    error,
    signIn,
    signOut,
  } = useSiweAuth();

  return (
    <div className="space-y-3">
      {/* Rainbow Kit Connect Button */}
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="w-full py-3 px-4 bg-[#2574ff] hover:bg-[#1e5fd9] text-white font-semibold rounded-lg border-2 border-black shadow-[0px_3px_0px_0px_#000000] hover:translate-y-[1px] hover:shadow-[0px_2px_0px_0px_#000000] transition-all"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg border-2 border-black"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      Wrong Network
                    </button>
                  );
                }

                return (
                  <div className="flex gap-2">
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="flex-1 py-2 px-3 bg-white hover:bg-gray-50 text-black font-medium rounded-lg border-2 border-black text-sm"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      {account.displayName}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

      {/* SIWE Authentication Status */}
      {isConnected && connectedAddress && (
        <div className="space-y-2">
          {!isAuthenticated ? (
            <div className="p-4 bg-yellow-100 border-2 border-black rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <Shield className="w-5 h-5 text-black mt-0.5" />
                <div>
                  <h4
                    className="text-sm font-bold text-black mb-1"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Sign-In Required
                  </h4>
                  <p className="text-xs text-gray-700 mb-2">
                    Sign a message to authorize your custodial wallet (
                    {wallet?.address.slice(0, 6)}...{wallet?.address.slice(-4)})
                    to place bets and initiate withdrawals back to your
                    connected wallet.
                  </p>
                </div>
              </div>

              <button
                onClick={() => wallet && signIn()}
                disabled={isSigning || !wallet}
                className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg border-2 border-black shadow-[0px_2px_0px_0px_#000000] hover:translate-y-[1px] hover:shadow-[0px_1px_0px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                {isSigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Sign In with Ethereum
                  </>
                )}
              </button>

              {error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-green-100 border-2 border-black rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <div>
                    <p
                      className="text-xs font-bold text-black"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      ✓ Authenticated
                    </p>
                    <p className="text-[10px] text-gray-600">
                      Custodial: {custodialWallet?.slice(0, 6)}...
                      {custodialWallet?.slice(-4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 hover:bg-green-200 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
