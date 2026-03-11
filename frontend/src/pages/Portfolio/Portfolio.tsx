import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../services/api';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '../../config/contract';
import styles from './Portfolio.module.css';

interface PositionData {
    marketId: string;
    title: string;
    yesShares: string;
    noShares: string;
    yesCost: string;
    noCost: string;
    currentYesPrice: number;
    currentNoPrice: number;
    marketStatus: number; // 0=Open, 1=Resolved
    resolvedOutcome: number; // 0=None, 1=Yes, 2=No
}

const Portfolio = () => {
    const api = useApi();
    const { address, isConnected } = useAccount();
    const navigate = useNavigate();
    const [positions, setPositions] = useState<PositionData[]>([]);
    const [loading, setLoading] = useState(false);

    const { writeContract: writeClaim, data: claimHash, isPending: isClaiming } = useWriteContract();
    const { isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

    const fetchPortfolio = () => {
        if (!address) return;
        setLoading(true);
        api.portfolio.get(address)
            .then(data => {
                // We need the market status as well to know if they can claim.
                // Fetch full market data to merge it with positions.
                return fetch('http://localhost:3001/api/markets')
                    .then(res => res.json())
                    .then(markets => {
                        const mergedPositions = data.positions.map((pos: any) => {
                            const market = markets.find((m: any) => m.id === pos.marketId);
                            return {
                                ...pos,
                                marketStatus: market ? market.status : 0,
                                resolvedOutcome: market ? market.resolvedOutcome : 0
                            };
                        });
                        setPositions(mergedPositions);
                    });
            })
            .catch(err => console.error('Failed to load portfolio:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPortfolio();
    }, [address, isClaimSuccess]);

    if (!isConnected) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Portfolio</h1>
                <div className={styles.connectPrompt}>
                    <p>Connect your wallet to view your portfolio</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    // Calculate portfolio stats
    const totalValue = positions.reduce((sum, p) => {
        const yesValue = parseFloat(p.yesShares) * (p.currentYesPrice / 100);
        const noValue = parseFloat(p.noShares) * (p.currentNoPrice / 100);
        return sum + yesValue + noValue;
    }, 0);

    const totalCost = positions.reduce((sum, p) => {
        return sum + parseFloat(p.yesCost) + parseFloat(p.noCost);
    }, 0);

    const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost * 100) : 0;
    const activePositions = positions.filter(p =>
        parseFloat(p.yesShares) > 0 || parseFloat(p.noShares) > 0
    );

    const handleClaim = (marketId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigating to market details
        writeClaim({
            address: PREDICTION_MARKET_ADDRESS,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'claimWinnings',
            args: [BigInt(marketId)],
        });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Portfolio</h1>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Portfolio Value</span>
                    <span className={styles.statValue}>{totalValue.toFixed(4)} ETH</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Invested</span>
                    <span className={styles.statValue}>{totalCost.toFixed(4)} ETH</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Return</span>
                    <span className={`${styles.statValue} ${totalReturn >= 0 ? styles.positive : styles.negative}`}>
                        {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
                    </span>
                </div>
            </div>

            <h2 className={styles.sectionTitle}>Active Positions</h2>

            {loading ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-panel skeleton" style={{ height: '120px', borderRadius: '16px' }}></div>
                    ))}
                </div>
            ) : activePositions.length === 0 ? (
                <div className={styles.empty}>
                    <p>No active positions yet</p>
                    <button className={styles.browseBtn} onClick={() => navigate('/')}>Browse Markets</button>
                </div>
            ) : (
                <div className={styles.positionsList}>
                    {activePositions.map((pos) => {
                        const isResolved = pos.marketStatus === 1;
                        const hasWinningShares = isResolved && (
                            (pos.resolvedOutcome === 1 && parseFloat(pos.yesShares) > 0) ||
                            (pos.resolvedOutcome === 2 && parseFloat(pos.noShares) > 0)
                        );
                        const hasLosingShares = isResolved && !hasWinningShares;

                        return (
                            <div key={pos.marketId} className={styles.positionCard} onClick={() => navigate(`/market/${pos.marketId}`)}>
                                <div className={styles.positionHeader}>
                                    <h3 className={styles.positionTitle}>{pos.title}</h3>
                                    {hasWinningShares && (
                                        <button 
                                            className={styles.claimBtn} 
                                            onClick={(e) => handleClaim(pos.marketId, e)}
                                            disabled={isClaiming}
                                        >
                                            {isClaiming ? 'Claiming...' : 'Claim Winnings'}
                                        </button>
                                    )}
                                    {hasLosingShares && (
                                        <span className={styles.lossBadge}>Lost</span>
                                    )}
                                </div>
                                <div className={styles.positionDetails}>
                                    {parseFloat(pos.yesShares) > 0 && (
                                        <div className={styles.positionRow}>
                                            <span className={styles.outcomeYes}>Yes</span>
                                            <span>{parseFloat(pos.yesShares).toFixed(4)} shares</span>
                                            <span>@ avg {(parseFloat(pos.yesCost) / parseFloat(pos.yesShares) * 100).toFixed(0)}¢</span>
                                            <span>Current: {isResolved ? (pos.resolvedOutcome === 1 ? '100¢' : '0¢') : `${pos.currentYesPrice}¢`}</span>
                                        </div>
                                    )}
                                    {parseFloat(pos.noShares) > 0 && (
                                        <div className={styles.positionRow}>
                                            <span className={styles.outcomeNo}>No</span>
                                            <span>{parseFloat(pos.noShares).toFixed(4)} shares</span>
                                            <span>@ avg {(parseFloat(pos.noCost) / parseFloat(pos.noShares) * 100).toFixed(0)}¢</span>
                                            <span>Current: {isResolved ? (pos.resolvedOutcome === 2 ? '100¢' : '0¢') : `${pos.currentNoPrice}¢`}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Portfolio;
