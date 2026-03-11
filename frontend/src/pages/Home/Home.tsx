import { useSearchParams, useNavigate } from 'react-router-dom';
import MarketList from '../../components/MarketList/MarketList';
import { MOCK_MARKETS } from '../../data/markets';
import styles from './Home.module.css';

const Home = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    const filteredMarkets = MOCK_MARKETS.filter(m => {
        const matchesQuery = !query || m.title.toLowerCase().includes(query.toLowerCase()) || m.category.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = !category || m.category === category;
        return matchesQuery && matchesCategory;
    });

    const handleSelectOutcome = (marketId: string, outcome: 'Yes' | 'No') => {
        navigate(`/market/${marketId}?outcome=${outcome}`);
    };

    const pageTitle = query
        ? `Search results for "${query}"`
        : category
            ? `${category} Markets`
            : 'Trending Markets';

    return (
        <div className={styles.home}>
            {/* Header / Hero Section */}
            {!query && !category && (
                <section className={styles.heroSection}>
                    <div className={styles.heroBanner}>
                        <h1 className="text-gradient">Predict the future.</h1>
                        <p>Bet on the outcome of real-world events.</p>
                    </div>
                </section>
            )}

            {/* Markets Section */}
            <section className={styles.marketsSection}>
                <div className="flex-between">
                    <h2 className={styles.sectionTitle}>{pageTitle}</h2>
                    {(query || category) ? (
                        <button className={styles.viewAllBtn} onClick={() => navigate('/')}>
                            Clear filters
                        </button>
                    ) : (
                        <button className={styles.viewAllBtn} onClick={() => navigate('/?all=1')}>
                            View All
                        </button>
                    )}
                </div>

                {filteredMarkets.length > 0 ? (
                    <MarketList
                        markets={filteredMarkets}
                        onSelectOutcome={handleSelectOutcome}
                    />
                ) : (
                    <div className={styles.emptyState}>
                        <p>No markets found{query ? ` for "${query}"` : ''}.</p>
                        <button className={styles.viewAllBtn} onClick={() => navigate('/')}>
                            Browse all markets
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;

