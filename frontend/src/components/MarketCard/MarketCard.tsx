import { useNavigate } from 'react-router-dom';
import styles from './MarketCard.module.css';

export interface MarketData {
    id: string;
    title: string;
    category: string;
    volume: string;
    image: string;
    yesPrice: number;
    noPrice: number;
}

interface MarketCardProps {
    market: MarketData;
    onSelectOutcome?: (marketId: string, outcome: 'Yes' | 'No') => void;
}

const MarketCard = ({ market, onSelectOutcome }: MarketCardProps) => {
    const navigate = useNavigate();

    return (
        <div
            className={styles.card}
            onClick={() => navigate(`/market/${market.id}`)}
            style={{ cursor: 'pointer' }}
        >
            <div className={styles.header}>
                <div className={styles.imagePlaceholder}>
                    <img
                        src={market.image}
                        alt=""
                        className={styles.image}
                        onError={(e) => {
                            e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/600px-No_image_available.svg.png';
                        }}
                    />
                </div>
                <div className={styles.meta}>
                    <div className={styles.category}>{market.category}</div>
                    <div className={styles.volume}>${market.volume} Vol.</div>
                </div>
            </div>

            <h3 className={styles.title}>{market.title}</h3>

            <div className={styles.actions}>
                <button
                    className={`${styles.betBtn} ${styles.yesBtn}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectOutcome?.(market.id, 'Yes');
                    }}
                >
                    <div className={styles.btnTopRow}>
                        <span className={styles.outcome}>Yes</span>
                        <span className={styles.price}>{market.yesPrice}¢</span>
                    </div>
                    <div className={styles.probBarBackground}>
                        <div className={styles.probBarFill} style={{ width: `${market.yesPrice}%` }} />
                    </div>
                </button>
                <button
                    className={`${styles.betBtn} ${styles.noBtn}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectOutcome?.(market.id, 'No');
                    }}
                >
                    <div className={styles.btnTopRow}>
                        <span className={styles.outcome}>No</span>
                        <span className={styles.price}>{market.noPrice}¢</span>
                    </div>
                    <div className={styles.probBarBackground}>
                        <div className={styles.probBarFill} style={{ width: `${market.noPrice}%` }} />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default MarketCard;
