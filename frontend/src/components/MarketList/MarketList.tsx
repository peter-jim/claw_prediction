import MarketCard, { type MarketData } from '../MarketCard/MarketCard';
import styles from './MarketList.module.css';

interface MarketListProps {
    markets: MarketData[];
    onSelectOutcome?: (marketId: string, outcome: 'Yes' | 'No') => void;
}

const MarketList = ({ markets, onSelectOutcome }: MarketListProps) => {
    return (
        <div className={styles.grid}>
            {markets.map((market) => (
                <MarketCard
                    key={market.id}
                    market={market}
                    onSelectOutcome={onSelectOutcome}
                />
            ))}
        </div>
    );
};

export default MarketList;
