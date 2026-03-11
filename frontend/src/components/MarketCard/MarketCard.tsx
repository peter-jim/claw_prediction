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
    endDate?: string;
    description?: string;
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
                    <span className={styles.outcome}>Yes</span>
                    <span className={styles.price}>{market.yesPrice}¢</span>
                </button>
                <button
                    className={`${styles.betBtn} ${styles.noBtn}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectOutcome?.(market.id, 'No');
                    }}
                >
                    <span className={styles.outcome}>No</span>
                    <span className={styles.price}>{market.noPrice}¢</span>
                </button>
            </div>
        </div>
    );
};

export default MarketCard;
