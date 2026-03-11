import type { MarketResponse, TradeEvent } from './api';

export const MOCK_MARKETS: MarketResponse[] = [
    {
        id: "m_001",
        title: "Will Bitcoin hit $100k by end of 2024?",
        description: "This market resolves to Yes if the price of Bitcoin (BTC) reaches or exceeds $100,000 USD on Binance by December 31, 2024, 11:59 PM ET.",
        category: "Crypto",
        imageUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
        endTime: new Date("2024-12-31T23:59:00Z").getTime() / 1000,
        status: 0,
        yesPrice: 58,
        noPrice: 42,
        volume: "1,245.5 ETH",
        yesPool: "150000000000000000000", // 150 ETH
        noPool: "108000000000000000000", // 108 ETH
    },
    {
        id: "m_002",
        title: "Will SpaceX land humans on Mars before 2030?",
        description: "Resolves Yes if a crewed SpaceX mission successfully lands on the surface of Mars before January 1, 2030.",
        category: "Tech",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ee/SpaceX-Logo.svg",
        endTime: new Date("2029-12-31T23:59:00Z").getTime() / 1000,
        status: 0,
        yesPrice: 35,
        noPrice: 65,
        volume: "850.2 ETH",
        yesPool: "105000000000000000000",
        noPool: "195000000000000000000",
    },
    {
        id: "m_003",
        title: "Will Artificial General Intelligence (AGI) be achieved by 2027?",
        description: "Market resolves Yes if OpenAI or DeepMind publicly announce the creation of an AGI system before 2027.",
        category: "Tech",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        endTime: new Date("2026-12-31T23:59:00Z").getTime() / 1000,
        status: 0,
        yesPrice: 82,
        noPrice: 18,
        volume: "3,100.0 ETH",
        yesPool: "820000000000000000000",
        noPool: "180000000000000000000",
    },
    {
        id: "m_004",
        title: "2024 US Presidential Election Winner",
        description: "Will the Democratic nominee win the 2024 US Presidential Election?",
        category: "Politics",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/US_Capitol_Building.jpg/800px-US_Capitol_Building.jpg",
        endTime: new Date("2024-11-05T23:59:00Z").getTime() / 1000,
        status: 1, // Resolved
        yesPrice: 100,
        noPrice: 0,
        volume: "12,500.0 ETH",
        yesPool: "1200000000000000000000",
        noPool: "100000000000000000000",
    }
];

export const MOCK_CANDLES = (basePrice: number) => {
    const data = [];
    let currentPrice = basePrice;
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Daily
        // Random walk
        currentPrice += (Math.random() - 0.5) * 10;
        currentPrice = Math.max(1, Math.min(99, currentPrice));
        data.push({ time: d.toLocaleDateString(), price: Math.round(currentPrice) });
    }
    return data;
};

export const MOCK_ACTIVITY: TradeEvent[] = Array(8).fill(null).map(() => ({
    marketId: "m_001",
    buyer: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    outcome: Math.random() > 0.5 ? 'Yes' : 'No',
    shares: (Math.random() * 500 + 10).toFixed(2),
    cost: (Math.random() * 5).toFixed(2),
    timestamp: Date.now() - Math.random() * 86400000 * 2,
})).sort((a, b) => b.timestamp - a.timestamp);

export const MOCK_PORTFOLIO = [
    {
        marketId: "m_001",
        title: "Will Bitcoin hit $100k by end of 2024?",
        yesShares: "550.00",
        noShares: "0.00",
        yesCost: "2.5",
        noCost: "0",
        currentYesPrice: 58,
        currentNoPrice: 42,
    },
    {
        marketId: "m_003",
        title: "Will Artificial General Intelligence (AGI) be achieved by 2027?",
        yesShares: "0.00",
        noShares: "1200.50",
        yesCost: "0",
        noCost: "1.2",
        currentYesPrice: 82,
        currentNoPrice: 18,
    }
];
