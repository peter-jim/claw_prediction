import { prisma } from '../prisma/client';

const MARKETS = [
  {
    title: 'Will Bitcoin reach $100k by the end of March?',
    description: 'This market resolves YES if Bitcoin (BTC) reaches or exceeds $100,000 USD on any major exchange before March 31st, 2025 at 11:59 PM UTC.',
    category: 'Crypto',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg',
    yesPrice: 0.52,
    noPrice: 0.48,
    volume: 12500000,
    endDate: new Date('2025-03-31'),
  },
  {
    title: 'Will Ethereum ETF see $1B inflows in 2025?',
    description: 'This market resolves YES if cumulative net inflows into all approved Ethereum spot ETFs reach $1 billion USD by December 31st, 2025.',
    category: 'Crypto',
    imageUrl: '',
    yesPrice: 0.67,
    noPrice: 0.33,
    volume: 8300000,
    endDate: new Date('2025-12-31'),
  },
  {
    title: 'Will Donald Trump serve full 4-year term?',
    description: 'This market resolves YES if Donald Trump serves his full 4-year presidential term from January 20, 2025 to January 20, 2029 without impeachment, death, resignation, or removal from office.',
    category: 'Politics',
    imageUrl: '',
    yesPrice: 0.78,
    noPrice: 0.22,
    volume: 45000000,
    endDate: new Date('2029-01-20'),
  },
  {
    title: 'Will GPT-5 be released before June 2025?',
    description: 'This market resolves YES if OpenAI officially releases GPT-5 to the public (not just limited testing) before June 1st, 2025.',
    category: 'Tech',
    imageUrl: '',
    yesPrice: 0.35,
    noPrice: 0.65,
    volume: 3200000,
    endDate: new Date('2025-06-01'),
  },
  {
    title: 'Will the Super Bowl LIX be watched by 130M+ viewers?',
    description: 'This market resolves YES if the Super Bowl LIX broadcast achieves a total viewership of 130 million or more viewers across all platforms.',
    category: 'Sports',
    imageUrl: '',
    yesPrice: 0.55,
    noPrice: 0.45,
    volume: 5600000,
    endDate: new Date('2025-02-10'),
  },
  {
    title: 'Will Taylor Swift release a new album in 2025?',
    description: 'This market resolves YES if Taylor Swift releases a brand new original studio album (not re-recordings) in 2025.',
    category: 'Pop Culture',
    imageUrl: '',
    yesPrice: 0.42,
    noPrice: 0.58,
    volume: 2100000,
    endDate: new Date('2025-12-31'),
  },
];

async function seed() {
  console.log('Seeding database...');
  for (const market of MARKETS) {
    const id = market.title.slice(0, 20).replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    await prisma.market.upsert({
      where: { id },
      update: {},
      create: {
        id,
        ...market,
        chartData: {
          create: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
            yesPrice: Math.max(0.01, Math.min(0.99, market.yesPrice + (Math.random() - 0.5) * 0.1)),
            noPrice: Math.max(0.01, Math.min(0.99, market.noPrice + (Math.random() - 0.5) * 0.1)),
            volume: Math.random() * 10000,
          })),
        },
      },
    });
  }
  console.log('Seed complete!');
  await prisma.$disconnect();
}

seed().catch(console.error);
