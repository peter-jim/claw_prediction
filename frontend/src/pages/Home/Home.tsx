import MarketList from '../../components/MarketList/MarketList';
import type { MarketData } from '../../components/MarketCard/MarketCard';
import styles from './Home.module.css';

// Mock Data
const MOCK_MARKETS: MarketData[] = [
    {
        id: 'm1',
        title: 'Will Bitcoin reach $100k by the end of March?',
        category: 'Crypto',
        volume: '12.5m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg',
        yesPrice: 52,
        noPrice: 48,
    },
    {
        id: 'm2',
        title: 'Ethereum ETF approved by SEC before Q3?',
        category: 'Crypto',
        volume: '8.2m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Ethereum_logo_translucent.svg',
        yesPrice: 75,
        noPrice: 25,
    },
    {
        id: 'm3',
        title: 'Will the Fed cut interest rates in May?',
        category: 'Economy',
        volume: '5.1m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Money_Flat_Icon.svg/512px-Money_Flat_Icon.svg.png',
        yesPrice: 30,
        noPrice: 70,
    },
    {
        id: 'm4',
        title: 'Oscar for Best Picture: Oppenheimer?',
        category: 'Pop Culture',
        volume: '2.4m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Popcorn.svg/512px-Popcorn.svg.png',
        yesPrice: 88,
        noPrice: 12,
    },
    {
        id: 'm5',
        title: 'Will GPT-5 be announced before June?',
        category: 'Tech',
        volume: '7.9m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png',
        yesPrice: 45,
        noPrice: 55,
    },
    {
        id: 'm6',
        title: 'US Presidential Election 2024 Winner?',
        category: 'Politics',
        volume: '45.2m',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Vote_icon.svg/512px-Vote_icon.svg.png',
        yesPrice: 60,
        noPrice: 40,
    }
];

const Home = () => {
    const handleSelectOutcome = (marketId: string, outcome: 'Yes' | 'No') => {
        console.log(`Selected ${outcome} for market ${marketId}`);
        // Open Order Slip here later
    };

    return (
        <div className={styles.home}>
            {/* Header / Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroBanner}>
                    <h1 className="text-gradient">Predict the future.</h1>
                    <p>Bet on the outcome of real-world events.</p>
                </div>
            </section>

            {/* Markets Section */}
            <section className={styles.marketsSection}>
                <div className="flex-between">
                    <h2 className={styles.sectionTitle}>Trending Markets</h2>
                    <button className={styles.viewAllBtn}>View All</button>
                </div>

                <MarketList
                    markets={MOCK_MARKETS}
                    onSelectOutcome={handleSelectOutcome}
                />
            </section>
        </div>
    );
};

export default Home;
