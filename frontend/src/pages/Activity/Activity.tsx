import { useAuth } from '../../context/AuthContext';
import styles from './Activity.module.css';

const MOCK_ACTIVITY = [
    { id: 1, type: 'buy', market: 'Will Bitcoin reach $100k by the end of March?', outcome: 'Yes', shares: 150, price: 45, amount: 67.50, time: '2 hours ago' },
    { id: 2, type: 'buy', market: 'Ethereum ETF approved by SEC before Q3?', outcome: 'No', shares: 50, price: 30, amount: 15.00, time: '1 day ago' },
    { id: 3, type: 'sell', market: 'Will GPT-5 be announced before June?', outcome: 'Yes', shares: 80, price: 50, amount: 40.00, time: '3 days ago' },
    { id: 4, type: 'buy', market: 'US Presidential Election 2024 Winner?', outcome: 'Yes', shares: 200, price: 55, amount: 110.00, time: '5 days ago' },
];

const Activity = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Activity</h1>
            </div>

            {!isAuthenticated ? (
                <div className={styles.loginPrompt}>
                    <p>Please log in to view your activity.</p>
                </div>
            ) : (
                <>
                    <p className={styles.subtitle}>Recent trading activity for <strong>{user?.name}</strong></p>
                    <div className={styles.activityList}>
                        {MOCK_ACTIVITY.map(item => (
                            <div key={item.id} className={styles.activityCard}>
                                <div className={styles.activityLeft}>
                                    <span className={`${styles.typeBadge} ${item.type === 'buy' ? styles.buy : styles.sell}`}>
                                        {item.type.toUpperCase()}
                                    </span>
                                    <div>
                                        <p className={styles.marketName}>{item.market}</p>
                                        <p className={styles.activityMeta}>
                                            {item.shares} shares · {item.outcome} · at {item.price}¢
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.activityRight}>
                                    <span className={styles.amount}>${item.amount.toFixed(2)}</span>
                                    <span className={styles.time}>{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Activity;
