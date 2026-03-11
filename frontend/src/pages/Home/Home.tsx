import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MarketList from '../../components/MarketList/MarketList';
import type { MarketData } from '../../components/MarketCard/MarketCard';
import { useApi } from '../../services/api';
import styles from './Home.module.css';

const Home = () => {
    const api = useApi();
    const [markets, setMarkets] = useState<MarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const sort = searchParams.get('sort') || '';

    useEffect(() => {
        setLoading(true);
        api.markets.list({ search, category, sort })
            .then(data => {
                setMarkets(data.map(m => ({
                    id: m.id,
                    title: m.title,
                    category: m.category,
                    volume: m.volume,
                    image: m.imageUrl,
                    yesPrice: m.yesPrice,
                    noPrice: m.noPrice,
                })));
            })
            .catch(err => console.error('Failed to load markets:', err))
            .finally(() => setLoading(false));
    }, [search, category, sort]);

    const handleSelectOutcome = (marketId: string, _outcome: 'Yes' | 'No') => {
        navigate(`/market/${marketId}`);
    };

    const title = search
        ? `Results for "${search}"`
        : category
            ? `${category} Markets`
            : 'Trending Markets';

    return (
        <div className={styles.container}>
            {!search && !category && (
                <div className={styles.hero}>
                    <h1>Predict the future.</h1>
                    <p>Bet on the outcome of real-world events.</p>
                </div>
            )}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{title}</h2>
                    <button className={styles.viewAllBtn}>View All</button>
                </div>
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', width: '100%' }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-panel skeleton" style={{ height: '240px', borderRadius: '16px' }}></div>
                        ))}
                    </div>
                ) : markets.length === 0 ? (
                    <div className={styles.empty}>No markets found</div>
                ) : (
                    <MarketList markets={markets} onSelectOutcome={handleSelectOutcome} />
                )}
            </div>
        </div>
    );
};

export default Home;
