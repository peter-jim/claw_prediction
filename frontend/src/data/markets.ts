import type { MarketData } from '../components/MarketCard/MarketCard';

export const MOCK_MARKETS: MarketData[] = [
    {
        id: 'm1',
        title: 'Will Bitcoin reach $100k by the end of March?',
        category: 'Crypto',
        volume: '12.5m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg',
        yesPrice: 52,
        noPrice: 48,
        endDate: 'Mar 31, 2025',
        description: 'This market resolves to "Yes" if the official index price of Bitcoin (BTC) reaches or exceeds $100,000.00 USD before March 31, 2025, 11:59:59 PM ET. Otherwise, this market will resolve to "No".',
    },
    {
        id: 'm2',
        title: 'Ethereum ETF approved by SEC before Q3?',
        category: 'Crypto',
        volume: '8.2m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Ethereum_logo_translucent.svg',
        yesPrice: 75,
        noPrice: 25,
        endDate: 'Jun 30, 2025',
        description: 'This market resolves to "Yes" if the U.S. Securities and Exchange Commission approves a spot Ethereum ETF before June 30, 2025.',
    },
    {
        id: 'm3',
        title: 'Will the Fed cut interest rates in May?',
        category: 'Economy',
        volume: '5.1m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Money_Flat_Icon.svg/512px-Money_Flat_Icon.svg.png',
        yesPrice: 30,
        noPrice: 70,
        endDate: 'May 31, 2025',
        description: 'This market resolves to "Yes" if the Federal Reserve announces a federal funds rate cut at the May 2025 FOMC meeting.',
    },
    {
        id: 'm4',
        title: 'Oscar for Best Picture: Oppenheimer?',
        category: 'Pop Culture',
        volume: '2.4m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Popcorn.svg/512px-Popcorn.svg.png',
        yesPrice: 88,
        noPrice: 12,
        endDate: 'Apr 15, 2025',
        description: 'This market resolves to "Yes" if Oppenheimer wins the Academy Award for Best Picture at the 97th Academy Awards.',
    },
    {
        id: 'm5',
        title: 'Will GPT-5 be announced before June?',
        category: 'Tech',
        volume: '7.9m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png',
        yesPrice: 45,
        noPrice: 55,
        endDate: 'May 31, 2025',
        description: 'This market resolves to "Yes" if OpenAI officially announces GPT-5 before June 1, 2025.',
    },
    {
        id: 'm6',
        title: 'US Presidential Election 2024 Winner?',
        category: 'Politics',
        volume: '45.2m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Vote_icon.svg/512px-Vote_icon.svg.png',
        yesPrice: 60,
        noPrice: 40,
        endDate: 'Nov 30, 2024',
        description: 'This market resolves to "Yes" (Republican) or "No" (Democrat) based on the winner of the 2024 US Presidential Election.',
    },
    {
        id: 'm7',
        title: 'Will SpaceX land Starship on Mars by 2030?',
        category: 'Tech',
        volume: '3.2m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/SpaceX-Logo-Xonly.svg/512px-SpaceX-Logo-Xonly.svg.png',
        yesPrice: 22,
        noPrice: 78,
        endDate: 'Dec 31, 2030',
        description: 'This market resolves to "Yes" if SpaceX successfully lands a Starship vehicle on Mars before January 1, 2031.',
    },
    {
        id: 'm8',
        title: 'NBA Championship 2025: Boston Celtics?',
        category: 'Sports',
        volume: '9.7m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Smiley_from_commons.svg/512px-Smiley_from_commons.svg.png',
        yesPrice: 35,
        noPrice: 65,
        endDate: 'Jun 30, 2025',
        description: 'This market resolves to "Yes" if the Boston Celtics win the 2025 NBA Championship.',
    },
];

export const getMarketById = (id: string): MarketData | undefined =>
    MOCK_MARKETS.find(m => m.id === id);

export const getMarketsByCategory = (category: string): MarketData[] =>
    category === 'All' || !category
        ? MOCK_MARKETS
        : MOCK_MARKETS.filter(m => m.category.toLowerCase() === category.toLowerCase());

export const searchMarkets = (query: string): MarketData[] => {
    const q = query.toLowerCase().trim();
    if (!q) return MOCK_MARKETS;
    return MOCK_MARKETS.filter(
        m => m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
};
