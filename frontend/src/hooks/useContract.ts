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

export function usePosition(marketId: bigint, userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getPosition',
    args: userAddress ? [marketId, userAddress] : undefined,
    query: { enabled: !!userAddress },
  });
}

// ─── Write Hooks ───────────────────────────────────────────

export function useBuyShares() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buy = (marketId: bigint, outcome: 'Yes' | 'No', amountEth: string) => {
    writeContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'buyShares',
      args: [marketId, outcome === 'Yes' ? 1 : 2],
      value: parseEther(amountEth),
    });
  };

  return { buy, hash, isPending, isConfirming, isSuccess, error };
}

export function useSellShares() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const sell = (marketId: bigint, outcome: 'Yes' | 'No', shares: bigint) => {
    writeContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'sellShares',
      args: [marketId, outcome === 'Yes' ? 1 : 2, shares],
    });
  };

  return { sell, hash, isPending, isConfirming, isSuccess, error };
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
