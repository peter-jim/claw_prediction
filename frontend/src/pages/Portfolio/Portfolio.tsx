import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api, type PortfolioData } from '../../services/api';
import styles from './Portfolio.module.css';

const Portfolio = () => {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        api.portfolio.get()
            .then(data => setPortfolio(data))
            .catch(err => console.error('Failed to load portfolio:', err))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Portfolio</h1>
                </div>
                <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '4rem' }}>
                    Please log in to view your portfolio.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Portfolio</h1>
                </div>
                <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '4rem' }}>Loading...</p>
            </div>
        );
    }

    const positions = portfolio?.positions || [];
    const portfolioValue = portfolio?.portfolioValue ?? 0;
    const totalReturn = portfolio?.totalReturn ?? 0;
    const totalReturnPct = portfolio?.totalReturnPct ?? 0;
    const balance = portfolio?.balance ?? user.balance;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Portfolio</h1>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Portfolio Value</div>
                    <div className={styles.statValue}>${portfolioValue.toFixed(2)}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Cash</div>
                    <div className={styles.statValue}>${balance.toFixed(2)}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Return</div>
                    <div className={`${styles.statValue} ${totalReturn >= 0 ? styles.positive : styles.negative}`}>
                        {totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)} ({totalReturnPct.toFixed(1)}%)
                    </div>
                </div>
            </div>

            <div className={styles.positionsSection}>
                <h2 className={styles.sectionTitle}>Active Positions</h2>
                {positions.length === 0 ? (
                    <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '2rem' }}>
                        No active positions. Start trading to build your portfolio!
                    </p>
                ) : (
                    <div className={styles.positionsList}>
                        {positions.map(pos => (
                            <div key={pos.id} className={styles.positionCard}>
                                <div className={styles.posHeader}>
                                    <h3 className={styles.posTitle}>{pos.marketTitle}</h3>
                                    <div className={pos.returnPct >= 0 ? styles.posReturnPos : styles.posReturnNeg}>
                                        {pos.returnPct >= 0 ? '+' : ''}{pos.returnPct.toFixed(2)}%
                                    </div>
                                </div>

                                <div className={styles.posDetails}>
                                    <div className={styles.posDetailCol}>
                                        <span className={styles.label}>Outcome</span>
                                        <span className={pos.outcome === 'Yes' ? styles.yesObj : styles.noObj}>{pos.outcome}</span>
                                    </div>
                                    <div className={styles.posDetailCol}>
                                        <span className={styles.label}>Shares</span>
                                        <span>{pos.shares.toFixed(1)}</span>
                                    </div>
                                    <div className={styles.posDetailCol}>
                                        <span className={styles.label}>Avg Price</span>
                                        <span>{pos.avgPrice}¢</span>
                                    </div>
                                    <div className={styles.posDetailCol}>
                                        <span className={styles.label}>Current</span>
                                        <span>{pos.currentPrice}¢</span>
                                    </div>
                                    <div className={styles.posDetailCol}>
                                        <span className={styles.label}>Value</span>
                                        <span>${pos.value.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Portfolio;
