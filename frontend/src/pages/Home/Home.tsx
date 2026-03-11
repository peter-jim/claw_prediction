import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MarketList from '../../components/MarketList/MarketList';
import type { MarketData } from '../../components/MarketCard/MarketCard';
import { api } from '../../services/api';
import styles from './Home.module.css';

const Home = () => {
    const [markets, setMarkets] = useState<MarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    useEffect(() => {
        setLoading(true);
        api.markets.list({ search, category })
            .then(data => setMarkets(data))
            .catch(err => console.error('Failed to load markets:', err))
            .finally(() => setLoading(false));
    }, [search, category]);

    const handleSelectOutcome = (marketId: string, outcome: 'Yes' | 'No') => {
        console.log(`Selected ${outcome} for market ${marketId}`);
    };

    const title = search
        ? `Search: "${search}"`
        : category
            ? `${category.charAt(0).toUpperCase() + category.slice(1)} Markets`
            : 'Trending Markets';

    return (
        <div className={styles.home}>
            {!search && !category && (
                <section className={styles.heroSection}>
                    <div className={styles.heroBanner}>
                        <h1 className="text-gradient">Predict the future.</h1>
                        <p>Bet on the outcome of real-world events.</p>
                    </div>
                </section>
            )}

            <section className={styles.marketsSection}>
                <div className="flex-between">
                    <h2 className={styles.sectionTitle}>{title}</h2>
                    {!search && !category && (
                        <button className={styles.viewAllBtn}>View All</button>
                    )}
                </div>

                {loading ? (
                    <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '2rem' }}>Loading markets...</p>
                ) : markets.length === 0 ? (
                    <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '2rem' }}>No markets found.</p>
                ) : (
                    <MarketList
                        markets={markets}
                        onSelectOutcome={handleSelectOutcome}
                    />
                )}
            </section>
        </div>
    );
};

export default Home;
