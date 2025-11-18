"use client";

import { useEffect } from "react";
import { X, Loader2, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ModalWrapper } from "./ModalWrapper";

interface TransactionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

interface WalletTransaction {
  id: string;
  txHash: string;
  txType: string;
  amount: string;
  status: string;
  createdAt: string;
}

export function TransactionsSheet({
  isOpen,
  onClose,
  userId,
}: TransactionsSheetProps) {
  // Fetch wallet transactions
  const {
    data: transactionsData,
    isLoading,
    refetch,
  } = useQuery<{ transactions: WalletTransaction[] }>({
    queryKey: ["transactionsSheet", userId],
    queryFn: async () => {
      if (!userId) {
        return { transactions: [] };
      }
      const response = await fetch(`/api/wallet/transactions?userId=${userId}`, {
        credentials: 'include', // Required for cookies in cross-origin contexts
      });
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      return response.json();
    },
    enabled: !!userId && isOpen,
    refetchOnWindowFocus: false,
    staleTime: 10000,
  });

  const transactions = transactionsData?.transactions || [];

  // Refetch when sheet opens
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  if (!userId) {
    return null;
  }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} variant="bottom">
      <div className="h-[85vh] bg-[#cfd9ff] shadow-xl flex flex-col rounded-t-[12px]">
        {/* Header */}
        <div className="bg-[#2574ff] border-b-2 border-black px-4 py-4 flex items-center justify-between rounded-t-[12px]">
          <h2
            className="text-base text-white uppercase leading-normal"
            style={{
              fontFamily: "var(--font-lilita-one)",
              textShadow: "0px 1.6px 0px #000000",
            }}
          >
            Transactions
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable Transactions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <p className="text-sm mb-1">No transactions yet</p>
                <p className="text-xs">
                  Your transaction history will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="border-2 border-black rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors shadow-[0px_2px_0px_0px_#000000]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p
                        className="text-[14px] text-black font-semibold mb-1"
                        style={{ fontFamily: "var(--font-lilita-one)" }}
                      >
                        {tx.txType === "deposit"
                          ? "Deposit"
                          : tx.txType === "withdraw"
                          ? "Withdraw"
                          : tx.txType === "bet_placed"
                          ? "Bet Placed"
                          : tx.txType === "bet_won"
                          ? "Bet Won"
                          : tx.txType === "bet_lost"
                          ? "Bet Lost"
                          : tx.txType === "payout"
                          ? "Payout"
                          : tx.txType.charAt(0).toUpperCase() +
                            tx.txType.slice(1)}
                      </p>
                      <p className="text-[11px] text-gray-600">
                        {formatDistanceToNow(new Date(tx.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p
                        className={`text-[14px] font-semibold ${
                          tx.txType === "deposit" || tx.txType === "payout" || tx.txType === "bet_won"
                            ? "text-green-600"
                            : tx.txType === "withdraw" || tx.txType === "bet_placed" || tx.txType === "bet_lost"
                            ? "text-red-600"
                            : "text-black"
                        }`}
                        style={{ fontFamily: "var(--font-lilita-one)" }}
                      >
                        {tx.txType === "deposit" || tx.txType === "payout" || tx.txType === "bet_won" ? "+" : "-"}
                        ${parseFloat(tx.amount).toFixed(2)}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          tx.status === "confirmed" || (tx.txHash && tx.txHash.startsWith("0x"))
                            ? "bg-green-100 text-green-700"
                            : tx.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                        style={{ fontFamily: "var(--font-lilita-one)" }}
                      >
                        {tx.txHash && tx.txHash.startsWith("0x") ? "Success" : tx.status}
                      </span>
                    </div>
                  </div>

                  {/* Transaction Hash */}
                  {tx.txHash && tx.txHash.startsWith("0x") && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <a
                        href={`https://basescan.org/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                      >
                        <span className="truncate">
                          {tx.txHash.slice(0, 20)}...{tx.txHash.slice(-10)}
                        </span>
                        <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
