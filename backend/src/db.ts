import { v4 as uuidv4 } from 'uuid';
import type { User, Market, Trade, Position } from './types.js';

// Simple hash for demo purposes (not production-grade)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

const users: Map<string, User> = new Map();
const markets: Map<string, Market> = new Map();
const trades: Trade[] = [];
const positions: Map<string, Position[]> = new Map(); // userId -> positions

// Seed markets
const SEED_MARKETS: Market[] = [
  {
    id: 'm1',
    title: 'Will Bitcoin reach $100k by the end of March?',
    category: 'Crypto',
    volume: '12.5m',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg',
    yesPrice: 52,
    noPrice: 48,
    endDate: '2024-03-31',
    rules: 'This market resolves to "Yes" if the official index price of Bitcoin (BTC) reaches or exceeds $100,000.00 USD according to the highly liquid aggregate index before March 31, 2024, 11:59:59 PM ET. Otherwise, this market will resolve to "No".',
  },
  {
    id: 'm2',
    title: 'Ethereum ETF approved by SEC before Q3?',
    category: 'Crypto',
    volume: '8.2m',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Ethereum_logo_translucent.svg',
    yesPrice: 75,
    noPrice: 25,
    endDate: '2024-07-01',
    rules: 'This market resolves to "Yes" if the U.S. Securities and Exchange Commission approves a spot Ethereum ETF before July 1, 2024. Otherwise, this market will resolve to "No".',
  },
  {
    id: 'm3',
    title: 'Will the Fed cut interest rates in May?',
    category: 'Economy',
    volume: '5.1m',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Money_Flat_Icon.svg/512px-Money_Flat_Icon.svg.png',
    yesPrice: 30,
    noPrice: 70,
    endDate: '2024-05-31',
    rules: 'This market resolves to "Yes" if the Federal Reserve announces a reduction in the federal funds rate at their May 2024 FOMC meeting.',
  },
  {
    id: 'm4',
    title: 'Oscar for Best Picture: Oppenheimer?',
    category: 'Pop Culture',
    volume: '2.4m',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Popcorn.svg/512px-Popcorn.svg.png',
    yesPrice: 88,
    noPrice: 12,
    endDate: '2024-03-10',
    rules: 'This market resolves to "Yes" if Oppenheimer wins the Academy Award for Best Picture at the 96th Academy Awards.',
  },
  {
    id: 'm5',
    title: 'Will GPT-5 be announced before June?',
    category: 'Tech',
    volume: '7.9m',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png',
    yesPrice: 45,
    noPrice: 55,
    endDate: '2024-06-01',
    rules: 'This market resolves to "Yes" if OpenAI officially announces GPT-5 (or equivalent next-generation model) before June 1, 2024.',
  },
  {
    id: 'm6',
    title: 'US Presidential Election 2024 Winner?',
    category: 'Politics',
    volume: '45.2m',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Vote_icon.svg/512px-Vote_icon.svg.png',
    yesPrice: 60,
    noPrice: 40,
    endDate: '2024-11-05',
    rules: 'This market resolves based on the winner of the 2024 United States Presidential Election as certified by Congress.',
  },
];

SEED_MARKETS.forEach((m) => markets.set(m.id, m));

export const db = {
  // Users
  createUser(email: string, password: string): User {
    const id = uuidv4();
    const user: User = {
      id,
      email,
      passwordHash: simpleHash(password),
      balance: 1250.0,
      createdAt: new Date().toISOString(),
    };
    users.set(id, user);
    return user;
  },

  findUserByEmail(email: string): User | undefined {
    for (const user of users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  },

  findUserById(id: string): User | undefined {
    return users.get(id);
  },

  verifyPassword(user: User, password: string): boolean {
    return user.passwordHash === simpleHash(password);
  },

  // Markets
  getMarkets(query?: { search?: string; category?: string }): Market[] {
    let result = Array.from(markets.values());
    if (query?.category && query.category !== 'home' && query.category !== 'trending') {
      result = result.filter(
        (m) => m.category.toLowerCase() === query.category!.toLowerCase()
      );
    }
    if (query?.search) {
      const searchLower = query.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(searchLower) ||
          m.category.toLowerCase().includes(searchLower)
      );
    }
    return result;
  },

  getMarketById(id: string): Market | undefined {
    return markets.get(id);
  },

  // Trades
  createTrade(
    userId: string,
    marketId: string,
    outcome: 'Yes' | 'No',
    side: 'buy' | 'sell',
    orderType: 'market' | 'limit',
    amount: number
  ): Trade | null {
    const market = markets.get(marketId);
    const user = users.get(userId);
    if (!market || !user) return null;

    const price = outcome === 'Yes' ? market.yesPrice : market.noPrice;
    const shares = amount / (price / 100);

    if (side === 'buy' && user.balance < amount) return null;

    if (side === 'buy') {
      user.balance -= amount;
    } else {
      user.balance += amount;
    }

    const trade: Trade = {
      id: uuidv4(),
      userId,
      marketId,
      outcome,
      side,
      orderType,
      amount,
      price,
      shares,
      createdAt: new Date().toISOString(),
    };
    trades.push(trade);

    // Update positions
    this.updatePosition(userId, marketId, market.title, outcome, side, shares, price);
    return trade;
  },

  updatePosition(
    userId: string,
    marketId: string,
    marketTitle: string,
    outcome: 'Yes' | 'No',
    side: 'buy' | 'sell',
    shares: number,
    price: number
  ) {
    const userPositions = positions.get(userId) || [];
    const existing = userPositions.find(
      (p) => p.marketId === marketId && p.outcome === outcome
    );

    if (existing) {
      if (side === 'buy') {
        const totalCost = existing.avgPrice * existing.shares + price * shares;
        existing.shares += shares;
        existing.avgPrice = totalCost / existing.shares;
      } else {
        existing.shares -= shares;
        if (existing.shares <= 0) {
          const idx = userPositions.indexOf(existing);
          userPositions.splice(idx, 1);
        }
      }
      if (existing.shares > 0) {
        existing.currentPrice = price;
        existing.value = existing.shares * (existing.currentPrice / 100);
        existing.returnPct =
          ((existing.currentPrice - existing.avgPrice) / existing.avgPrice) * 100;
      }
    } else if (side === 'buy') {
      const pos: Position = {
        id: uuidv4(),
        userId,
        marketId,
        marketTitle: marketTitle,
        outcome,
        shares,
        avgPrice: price,
        currentPrice: price,
        value: shares * (price / 100),
        returnPct: 0,
      };
      userPositions.push(pos);
    }

    positions.set(userId, userPositions);
  },

  getPositions(userId: string): Position[] {
    return positions.get(userId) || [];
  },

  getRecentTrades(marketId?: string): Trade[] {
    let result = [...trades].reverse().slice(0, 20);
    if (marketId) {
      result = result.filter((t) => t.marketId === marketId);
    }
    return result;
  },

  getUserBalance(userId: string): number {
    return users.get(userId)?.balance ?? 0;
  },
};
