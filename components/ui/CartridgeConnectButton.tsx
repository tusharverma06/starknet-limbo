"use client";

import { useCartridgeWallet } from "@/hooks/useCartridgeWallet";

export function CartridgeConnectButton() {
  const { isConnected, isConnecting, address, connect, disconnect, openProfile } =
    useCartridgeWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={openProfile}
          className="relative h-[36px] px-3 bg-gradient-to-b from-[#9945FF] to-[#7028E4] border-2 border-black rounded-lg shadow-[0px_2px_0px_0px_#000000] active:shadow-none active:translate-y-[2px] transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span
              className="text-sm text-white uppercase leading-normal"
              style={{
                textShadow: "0px 1.6px 0px #000000",
                fontFamily: "var(--font-lilita-one)",
              }}
            >
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        </button>
        <button
          onClick={disconnect}
          className="relative h-[36px] px-3 bg-red-500 border-2 border-black rounded-lg shadow-[0px_2px_0px_0px_#000000] active:shadow-none active:translate-y-[2px] transition-all"
        >
          <span
            className="text-sm text-white uppercase leading-normal"
            style={{
              textShadow: "0px 1.6px 0px #000000",
              fontFamily: "var(--font-lilita-one)",
            }}
          >
            Disconnect
          </span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect()}
      disabled={isConnecting}
      className="relative h-[36px] px-4 bg-gradient-to-b from-[#9945FF] to-[#7028E4] border-2 border-black rounded-lg shadow-[0px_2px_0px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed active:shadow-none active:translate-y-[2px] transition-all"
    >
      <div className="flex items-center gap-2">
        {isConnecting ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span
              className="text-sm text-white uppercase leading-normal"
              style={{
                textShadow: "0px 1.6px 0px #000000",
                fontFamily: "var(--font-lilita-one)",
              }}
            >
              Connecting...
            </span>
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="text-sm text-white uppercase leading-normal"
              style={{
                textShadow: "0px 1.6px 0px #000000",
                fontFamily: "var(--font-lilita-one)",
              }}
            >
              Cartridge (Gasless)
            </span>
          </>
        )}
      </div>
    </button>
  );
}
