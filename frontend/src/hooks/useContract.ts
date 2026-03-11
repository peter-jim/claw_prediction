import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '../config/contract';

// ─── Read Hooks ────────────────────────────────────────────

export function useMarketCount() {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getMarketCount',
  });
}

export function useMarket(marketId: bigint) {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getMarket',
    args: [marketId],
  });
}

export function useYesPrice(marketId: bigint) {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getYesPrice',
    args: [marketId],
  });
}

export function useNoPrice(marketId: bigint) {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getNoPrice',
    args: [marketId],
  });
}

import { useState } from 'react';
import { useNetwork } from '../contexts/NetworkContext';

export function usePosition(marketId: bigint, userAddress: `0x${string}` | undefined) {
  const { isMockMode } = useNetwork();
  
  const result = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getPosition',
    args: userAddress ? [marketId, userAddress] : undefined,
    query: { enabled: !!userAddress && !isMockMode },
  });

  if (isMockMode) {
    return { data: [BigInt(550 * 10**18), 0n, 0n, 0n] as any, error: null, isPending: false };
  }
  return result;
}

export function useQuoteBuy(marketId: bigint, outcome: 'Yes' | 'No', amountEth: string) {
  const { isMockMode } = useNetwork();
  const value = amountEth && !isNaN(Number(amountEth)) ? parseEther(amountEth) : 0n;
  
  const result = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'quoteBuy',
    args: [marketId, outcome === 'Yes' ? 1 : 2, value],
    query: { enabled: !isMockMode && value > 0n },
  });

  if (isMockMode) {
    return { data: value * 2n, isPending: false }; // simplistic 50% mock
  }
  return result;
}

export function useQuoteSell(marketId: bigint, outcome: 'Yes' | 'No', shares: bigint) {
  const { isMockMode } = useNetwork();
  
  const result = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'quoteSell',
    args: [marketId, outcome === 'Yes' ? 1 : 2, shares],
    query: { enabled: !isMockMode && shares > 0n },
  });

  if (isMockMode) {
    return { data: shares / 2n, isPending: false };
  }
  return result;
}

// ─── Write Hooks ───────────────────────────────────────────

export function useBuyShares() {
  const { isMockMode } = useNetwork();
  const { writeContract, data: hash, isPending: wagmiPending, error: wagmiError } = useWriteContract();
  const { isLoading: wagmiConfirming, isSuccess: wagmiSuccess } = useWaitForTransactionReceipt({ hash });

  const [mockPending, setMockPending] = useState(false);
  const [mockSuccess, setMockSuccess] = useState(false);

  const buy = (marketId: bigint, outcome: 'Yes' | 'No', amountEth: string, minSharesOut: bigint) => {
    if (isMockMode) {
      setMockPending(true);
      setMockSuccess(false);
      setTimeout(() => {
        setMockPending(false);
        setMockSuccess(true);
      }, 800);
      return;
    }
    
    writeContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'buyShares',
      args: [marketId, outcome === 'Yes' ? 1 : 2, minSharesOut],
      value: parseEther(amountEth),
    });
  };

  return { 
    buy, 
    hash, 
    isPending: isMockMode ? mockPending : wagmiPending, 
    isConfirming: isMockMode ? false : wagmiConfirming, 
    isSuccess: isMockMode ? mockSuccess : wagmiSuccess, 
    error: isMockMode ? null : wagmiError 
  };
}

export function useSellShares() {
  const { isMockMode } = useNetwork();
  const { writeContract, data: hash, isPending: wagmiPending, error: wagmiError } = useWriteContract();
  const { isLoading: wagmiConfirming, isSuccess: wagmiSuccess } = useWaitForTransactionReceipt({ hash });

  const [mockPending, setMockPending] = useState(false);
  const [mockSuccess, setMockSuccess] = useState(false);

  const sell = (marketId: bigint, outcome: 'Yes' | 'No', shares: bigint, minPayout: bigint) => {
    if (isMockMode) {
      setMockPending(true);
      setMockSuccess(false);
      setTimeout(() => {
        setMockPending(false);
        setMockSuccess(true);
      }, 800);
      return;
    }

    writeContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'sellShares',
      args: [marketId, outcome === 'Yes' ? 1 : 2, shares, minPayout],
    });
  };

  return { 
    sell, 
    hash, 
    isPending: isMockMode ? mockPending : wagmiPending, 
    isConfirming: isMockMode ? false : wagmiConfirming, 
    isSuccess: isMockMode ? mockSuccess : wagmiSuccess, 
    error: isMockMode ? null : wagmiError 
  };
}

// ─── Helpers ───────────────────────────────────────────────

/** Convert basis points (0-10000) to percentage display (e.g. 5200 → "52") */
export function bpsToPercent(bps: bigint | undefined): number {
  if (!bps) return 50;
  return Number(bps) / 100;
}

/** Convert basis points to cents display (e.g. 5200 → "52¢") */
export function bpsToCents(bps: bigint | undefined): string {
  if (!bps) return '50¢';
  return `${(Number(bps) / 100).toFixed(0)}¢`;
}

/** Format ETH amount for display */
export function formatEthDisplay(wei: bigint | undefined): string {
  if (!wei) return '0';
  return parseFloat(formatEther(wei)).toFixed(4);
}

/** Format pool size (total volume in ETH) */
export function formatVolume(yesPool: bigint | undefined, noPool: bigint | undefined): string {
  if (!yesPool || !noPool) return '0 ETH';
  const total = parseFloat(formatEther(yesPool + noPool));
  if (total >= 1000) return `${(total / 1000).toFixed(1)}k ETH`;
  return `${total.toFixed(2)} ETH`;
}
