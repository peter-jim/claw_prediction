export interface User {
  id: string;
  email: string;
  passwordHash: string;
  balance: number;
  createdAt: string;
}

export interface Market {
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

export interface Trade {
  id: string;
  userId: string;
  marketId: string;
  outcome: 'Yes' | 'No';
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  amount: number;
  price: number;
  shares: number;
  createdAt: string;
}

export interface Position {
  id: string;
  userId: string;
  marketId: string;
  marketTitle: string;
  outcome: 'Yes' | 'No';
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  returnPct: number;
}
