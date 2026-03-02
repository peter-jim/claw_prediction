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
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Portfolio</h1>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Portfolio Value</div>
                    <div className={styles.statValue}>$90.76</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Cash</div>
                    <div className={styles.statValue}>$1,250.00</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Return</div>
                    <div className={`${styles.statValue} ${styles.positive}`}>+$12.45 (15.5%)</div>
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
