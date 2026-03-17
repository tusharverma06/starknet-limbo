"use client";

import { useState } from "react";
import { useStarknet } from "@/components/providers/StarknetProvider";
import { formatStarknetAddress } from "@/lib/starknet/betting";
import { useSession } from "@/hooks/useSession";
import { Copy, Check, ExternalLink } from "lucide-react";

export function StarknetConnectButton() {
  const { connect, disconnect, isConnected, isConnecting, address, hasWallet } = useStarknet();
  const { custodialWallet } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCustodial = () => {
    if (custodialWallet) {
      navigator.clipboard.writeText(custodialWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyExternal = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-3 py-2 bg-[#2574ff] hover:bg-[#094eed] text-white rounded-lg text-sm font-medium transition-colors border-2 border-black shadow-[0px_2px_0px_0px_#000000]"
          style={{ fontFamily: "var(--font-lilita-one)" }}
        >
          {formatStarknetAddress(address)}
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border-2 border-black shadow-xl z-50">
              <div className="p-4 space-y-3">
                {/* External Wallet */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 uppercase" style={{ fontFamily: "var(--font-lilita-one)" }}>
                    Your Wallet
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                    <code className="text-xs text-gray-700 flex-1 truncate">
                      {address}
                    </code>
                    <button
                      onClick={handleCopyExternal}
                      className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Custodial Wallet */}
                {custodialWallet && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1 uppercase" style={{ fontFamily: "var(--font-lilita-one)" }}>
                      Game Wallet (Custodial)
                    </div>
                    <div className="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                      <code className="text-xs text-blue-700 flex-1 truncate">
                        {custodialWallet}
                      </code>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={handleCopyCustodial}
                          className="p-1 hover:bg-blue-200 rounded transition-colors"
                          title="Copy custodial address"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-blue-500" />
                          )}
                        </button>
                        <a
                          href={`https://starkscan.co/contract/${custodialWallet}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-blue-200 rounded transition-colors"
                          title="View on Starkscan"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-500" />
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This is your in-game wallet for placing bets
                    </p>
                  </div>
                )}

                {/* Disconnect Button */}
                <button
                  onClick={() => {
                    disconnect();
                    setShowDropdown(false);
                  }}
                  className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors border-2 border-black shadow-[0px_2px_0px_0px_#000000]"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <a
        href="https://www.argent.xyz/argent-x/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-2 bg-[#2574ff] hover:bg-[#094eed] text-white rounded-lg text-sm font-medium transition-colors border-2 border-black shadow-[0px_2px_0px_0px_#000000]"
        style={{ fontFamily: "var(--font-lilita-one)" }}
      >
        Download Starknet
      </a>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-3 py-2 bg-[#2574ff] hover:bg-[#094eed] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border-2 border-black shadow-[0px_2px_0px_0px_#000000]"
      style={{ fontFamily: "var(--font-lilita-one)" }}
    >
      {isConnecting ? "Connecting..." : "Starknet"}
    </button>
  );
}
