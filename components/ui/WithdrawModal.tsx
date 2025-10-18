'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { X, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { getEthValueFromUsd, getUsdValueFromEth } from '@/lib/utils/price';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  currentBalance: string;
  onWithdraw: (amount: string, toAddress: string) => Promise<void>;
}

export function WithdrawModal({ isOpen, onClose, walletAddress, currentBalance, onWithdraw }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [usdBalance, setUsdBalance] = useState<number | null>(null);
  const [ethAmount, setEthAmount] = useState<number | null>(null);

  // Convert current balance to USD
  useEffect(() => {
    if (currentBalance) {
      const ethBalance = parseFloat(currentBalance);
      getUsdValueFromEth(ethBalance).then(setUsdBalance).catch(() => setUsdBalance(null));
    } else {
      setUsdBalance(null);
    }
  }, [currentBalance]);

  // Convert USD amount to ETH when amount changes
  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const usdValue = parseFloat(amount);
      if (usdValue > 0 && isFinite(usdValue)) {
        getEthValueFromUsd(usdValue).then((ethValue) => {
          if (isFinite(ethValue) && ethValue > 0) {
            setEthAmount(ethValue);
          } else {
            setEthAmount(null);
          }
        }).catch(() => setEthAmount(null));
      } else {
        setEthAmount(null);
      }
    } else {
      setEthAmount(null);
    }
  }, [amount]);

  if (!isOpen) return null;

  const handleWithdraw = async () => {
    if (!amount || !toAddress) {
      setError('Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (usdBalance && numAmount > usdBalance) {
      setError('Insufficient balance');
      return;
    }

    if (toAddress.length !== 42 || !toAddress.startsWith('0x')) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setError('');
    setIsWithdrawing(true);

    try {
      await onWithdraw(amount, toAddress);
      setAmount('');
      setToAddress('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleMaxAmount = () => {
    // Leave some USD for gas fees (roughly $1-2)
    if (usdBalance) {
      const maxAmount = Math.max(0, usdBalance - 2);
      setAmount(maxAmount.toFixed(2));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full">
        <Card className="p-4 bg-white border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-black">Withdraw Funds</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Balance */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="text-xs text-gray-600 mb-1">Available Balance</div>
            <div className="text-lg font-bold text-black">
              {parseFloat(currentBalance).toFixed(4)} ETH
            </div>
            {usdBalance !== null && (
              <div className="text-sm text-gray-500">
                ≈ ${usdBalance.toFixed(2)}
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2 mb-4">
            <div className="text-sm font-semibold text-black">Amount to Withdraw (USD)</div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
                step="0.01"
                min="0"
                max={usdBalance || undefined}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMaxAmount}
                className="text-xs px-3 py-2"
              >
                Max
              </Button>
            </div>
            {ethAmount !== null && (
              <div className="text-xs text-gray-500">
                ≈ {ethAmount.toFixed(6)} ETH
              </div>
            )}
          </div>

          {/* Recipient Address */}
          <div className="space-y-2 mb-4">
            <div className="text-sm font-semibold text-black">Recipient Address</div>
            <Input
              type="text"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <span className="text-xs text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isWithdrawing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              className="flex-1"
              disabled={isWithdrawing || !amount || !toAddress}
            >
              {isWithdrawing ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  Withdraw
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
