const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; balance: number };
}

export interface MarketData {
  id: string;
  title: string;
  category: string;
  volume: string;
  image: string;
  yesPrice: number;
  noPrice: number;
  endDate: string;
  rules: string;
}

export interface TradeResponse {
  trade: {
    id: string;
    marketId: string;
    outcome: 'Yes' | 'No';
    side: 'buy' | 'sell';
    amount: number;
    price: number;
    shares: number;
    createdAt: string;
  };
  balance: number;
}

export interface PortfolioData {
  balance: number;
  portfolioValue: number;
  totalReturn: number;
  totalReturnPct: number;
  positions: {
    id: string;
    marketId: string;
    marketTitle: string;
    outcome: 'Yes' | 'No';
    shares: number;
    avgPrice: number;
    currentPrice: number;
    value: number;
    returnPct: number;
  }[];
}

export const api = {
  auth: {
    login(email: string, password: string) {
      return request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    register(email: string, password: string) {
      return request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    me() {
      return request<{ id: string; email: string; balance: number }>('/api/auth/me');
    },
  },
  markets: {
    list(params?: { search?: string; category?: string }) {
      const qs = new URLSearchParams();
      if (params?.search) qs.set('search', params.search);
      if (params?.category) qs.set('category', params.category);
      const queryStr = qs.toString();
      return request<MarketData[]>(`/api/markets${queryStr ? `?${queryStr}` : ''}`);
    },
    get(id: string) {
      return request<MarketData>(`/api/markets/${id}`);
    },
    activity(id: string) {
      return request<TradeResponse['trade'][]>(`/api/markets/${id}/activity`);
    },
  },
  trades: {
    place(data: {
      marketId: string;
      outcome: 'Yes' | 'No';
      side: 'buy' | 'sell';
      orderType: 'market' | 'limit';
      amount: number;
    }) {
      return request<TradeResponse>('/api/trades', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
  portfolio: {
    get() {
      return request<PortfolioData>('/api/portfolio');
    },
  },
};
