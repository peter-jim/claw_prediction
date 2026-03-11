import { useAuth } from '../../context/AuthContext';
import styles from './Portfolio.module.css';

const POSITIONS = [
    {
        id: 1,
        market: 'Will Bitcoin reach $100k by the end of March?',
        outcome: 'Yes',
        shares: 150.5,
        avgPrice: 45,
        currentPrice: 52,
        value: 78.26,
        return: 15.55 // percentage
    },
    {
        id: 2,
        market: 'Ethereum ETF approved by SEC before Q3?',
        outcome: 'No',
        shares: 50.0,
        avgPrice: 30,
        currentPrice: 25,
        value: 12.50,
        return: -16.67
    }
];

const Portfolio = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Portfolio</h1>
                </div>
                <div className={styles.loginPrompt}>
                    <p>Please log in to view your portfolio.</p>
                </div>
            </div>
        );
    }

    const portfolioValue = POSITIONS.reduce((sum, p) => sum + p.value, 0);
    const totalReturn = POSITIONS.reduce((sum, p) => sum + (p.value * p.return / 100), 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Portfolio</h1>
                <p className={styles.subtitle}>{user?.name}&apos;s holdings</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Portfolio Value</div>
                    <div className={styles.statValue}>${portfolioValue.toFixed(2)}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Cash</div>
                    <div className={styles.statValue}>${(user?.balance ?? 0).toFixed(2)}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Return</div>
                    <div className={`${styles.statValue} ${totalReturn >= 0 ? styles.positive : styles.negative}`}>
                        {totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}{portfolioValue > 0 ? ` (${totalReturn >= 0 ? '+' : ''}${((totalReturn / portfolioValue) * 100).toFixed(1)}%)` : ''}
                    </div>
                </div>
            </div>

            <div className={styles.positionsSection}>
                <h2 className={styles.sectionTitle}>Active Positions</h2>
                <div className={styles.positionsList}>
                    {POSITIONS.map(pos => (
                        <div key={pos.id} className={styles.positionCard}>
                            <div className={styles.posHeader}>
                                <h3 className={styles.posTitle}>{pos.market}</h3>
                                <div className={pos.return >= 0 ? styles.posReturnPos : styles.posReturnNeg}>
                                    {pos.return >= 0 ? '+' : ''}{pos.return}%
                                </div>
                            </div>

                            <div className={styles.posDetails}>
                                <div className={styles.posDetailCol}>
                                    <span className={styles.label}>Outcome</span>
                                    <span className={pos.outcome === 'Yes' ? styles.yesObj : styles.noObj}>{pos.outcome}</span>
                                </div>
                                <div className={styles.posDetailCol}>
                                    <span className={styles.label}>Shares</span>
                                    <span>{pos.shares}</span>
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
                                    <span>${pos.value}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Portfolio;

