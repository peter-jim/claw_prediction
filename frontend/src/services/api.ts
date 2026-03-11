/* API service — reads market data from backend (which indexes contract data) */
/* Trading actions go directly to the contract via wagmi hooks */

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Market Types ──────────────────────────────────────────

export interface MarketResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  endTime: number;
  status: number;
  resolvedOutcome: number; // 0=None, 1=Yes, 2=No
  yesPrice: number;  // 0-100 (percentage)
  noPrice: number;   // 0-100
  volume: string;    // formatted ETH volume
  yesPool: string;   // raw wei string
  noPool: string;
}

export interface TradeEvent {
  marketId: string;
  buyer: string;
  outcome: string;
  shares: string;
  cost: string;
  timestamp: number;
}

import { useNetwork } from '../contexts/NetworkContext';
import { MOCK_MARKETS, MOCK_ACTIVITY, MOCK_CANDLES, MOCK_PORTFOLIO } from './mockData';

// ─── API Hook ─────────────────────────────────────────

export const useApi = () => {
  const { isMockMode } = useNetwork();

  return {
    markets: {
      list: async (params?: { search?: string; category?: string; sort?: string }) => {
        if (isMockMode) {
          let results = [...MOCK_MARKETS];
          if (params?.category) {
            results = results.filter(m => m.category.toLowerCase() === params.category!.toLowerCase());
          }
          if (params?.search) {
            const q = params.search.toLowerCase();
            results = results.filter(m => m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
          }
          return Promise.resolve(results);
        }

        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.set('search', params.search);
        if (params?.category) searchParams.set('category', params.category);
        if (params?.sort) searchParams.set('sort', params.sort);
        const qs = searchParams.toString();
        return fetchJSON<MarketResponse[]>(`/api/markets${qs ? `?${qs}` : ''}`);
      },
      get: async (id: string) => {
        if (isMockMode) {
          const market = MOCK_MARKETS.find(m => m.id === id) || MOCK_MARKETS[0];
          return Promise.resolve(market);
        }
        return fetchJSON<MarketResponse>(`/api/markets/${id}`);
      },
      activity: async (id: string) => {
        if (isMockMode) return Promise.resolve(MOCK_ACTIVITY);
        return fetchJSON<TradeEvent[]>(`/api/markets/${id}/activity`);
      },
      candles: async (id: string, timeframe: string) => {
        if (isMockMode) {
            const market = MOCK_MARKETS.find(m => m.id === id) || MOCK_MARKETS[0];
            return Promise.resolve(MOCK_CANDLES(market.yesPrice));
        }
        return fetchJSON<Array<{time: string, price: number}>>(`/api/markets/${id}/candles?tf=${timeframe}`);
      },
    },
    portfolio: {
      get: async (address: string) => {
        if (isMockMode) {
            return Promise.resolve({ positions: MOCK_PORTFOLIO } as any);
        }
        return fetchJSON<{
          positions: Array<{
            marketId: string;
            title: string;
            yesShares: string;
            noShares: string;
            yesCost: string;
            noCost: string;
            currentYesPrice: number;
            currentNoPrice: number;
          }>;
        }>(`/api/portfolio/${address}`);
      },
    },
  };
};
