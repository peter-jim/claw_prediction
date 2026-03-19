import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, Clock } from 'lucide-react';
import { ethers } from 'ethers';
import { useApi, type MarketResponse } from '../../services/api';
import { useBuyShares, useSellShares, usePosition, useQuoteBuy, useQuoteSell } from '../../hooks/useContract';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '../../config/contract';
import MarketImage from '../../components/MarketImage/MarketImage';
import styles from './MarketDetail.module.css';

const MarketDetail = () => {
    const api = useApi();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    
    // Convert route param to BigInt for contract calls
    // Mock IDs like "m_001" need numeric extraction; on-chain IDs are pure numbers
    const marketIdBigInt = (() => {
        try {
            const numericStr = (id || '0').replace(/\D/g, '');
            return BigInt(numericStr || '0');
        } catch {
            return 0n;
        }
    })();

    const [market, setMarket] = useState<MarketResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [activity, setActivity] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'liquidity' | 'activity' | 'rules'>('liquidity');
    const [timeframe, setTimeframe] = useState('1D');
    const [side, setSide] = useState<'buy' | 'sell'>('buy');
    const [outcome, setOutcome] = useState<'Yes' | 'No'>('Yes');
    const [amount, setAmount] = useState('');
    const [slippage, setSlippage] = useState('0.5'); // 0.5% default slippage
    const [tradeMessage, setTradeMessage] = useState('');
    const [chartData, setChartData] = useState<Array<{time: string, price: number}>>([]);

    const { buy, isPending: isBuyPending, isConfirming: isBuyConfirming, isSuccess: isBuySuccess, error: buyError } = useBuyShares();
    const { sell, isPending: isSellPending, isConfirming: isSellConfirming, isSuccess: isSellSuccess, error: sellError } = useSellShares();
    const { data: posData } = usePosition(marketIdBigInt, address);

    const amountWei = amount && !isNaN(Number(amount)) ? ethers.parseEther(amount) : 0n;
    const { data: quoteBuyData } = useQuoteBuy(marketIdBigInt, outcome, side === 'buy' ? amount : '');
    const { data: quoteSellData } = useQuoteSell(marketIdBigInt, outcome, side === 'sell' ? amountWei : 0n);

    const { writeContract: writeClaim, data: claimHash, isPending: isClaiming } = useWriteContract();
    const { isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

    // Fetch market data from backend
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        
        const fetchData = () => {
            Promise.all([
                api.markets.get(id),
                api.markets.activity(id).catch(() => []),
                api.markets.candles(id, timeframe).catch(() => [])
            ]).then(([marketData, activityData, candlesData]) => {
                setMarket(marketData);
                setActivity(activityData);
                
                // Format candles data if needed, or fallback if empty
                if (candlesData && candlesData.length > 0) {
                    setChartData(candlesData);
                } else if (marketData) {
                    // Flat line if no trades yet
                    setChartData([{ time: 'Now', price: marketData.yesPrice }]);
                }
            }).catch(err => {
                console.error('Failed to load market:', err);
            }).finally(() => setLoading(false));
        };

        fetchData();

        // Real-time auto polling every 10 seconds
        const intervalId = setInterval(fetchData, 10000);

        return () => clearInterval(intervalId);
    }, [id, isBuySuccess, isClaimSuccess, timeframe]); // Refresh on buy or claim or timeframe change

    // Watch for trade success
    useEffect(() => {
        if (isBuySuccess || isSellSuccess) {
            setTradeMessage(`Successfully ${isBuySuccess ? 'bought' : 'sold'}!`);
            setAmount('');
        }
    }, [isBuySuccess, isSellSuccess]);

    useEffect(() => {
        if (buyError) setTradeMessage(`Trade failed: ${buyError.message.substring(0, 60)}`);
        if (sellError) setTradeMessage(`Trade failed: ${sellError.message.substring(0, 60)}`);
    }, [buyError, sellError]);

    const isPending = side === 'buy' ? isBuyPending : isSellPending;
    const isConfirming = side === 'buy' ? isBuyConfirming : isSellConfirming;

    // Quoting Calculations
    let estOutputDisplay = '0.00';
    let minOutputRaw = 0n;

    if (side === 'buy' && quoteBuyData) {
        // quoteBuyData is expected shares out (gross).
        const sharesOut = Number(ethers.formatEther(quoteBuyData as bigint));
        estOutputDisplay = sharesOut.toFixed(2);
        
        // Slippage deduction
        const slippageMultiplier = 1 - (parseFloat(slippage) / 100);
        const minSharesNum = sharesOut * slippageMultiplier;
        minOutputRaw = ethers.parseEther(minSharesNum.toFixed(18));
    } else if (side === 'sell' && quoteSellData) {
        // quoteSellData is expected ETH out (gross). Fee is 0.2% (20 bps).
        const grossEth = Number(ethers.formatEther(quoteSellData as bigint));
        const netEth = grossEth * (1 - 0.002);
        estOutputDisplay = netEth.toFixed(4);

        const slippageMultiplier = 1 - (parseFloat(slippage) / 100);
        const minPayoutNum = netEth * slippageMultiplier;
        minOutputRaw = ethers.parseEther(minPayoutNum.toFixed(18));
    }


    const priceChange = chartData.length >= 2
        ? chartData[chartData.length - 1].price - chartData[0].price
        : 0;
    const priceChangeStr = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(1)}¢ (${timeframe})`;

    const handleTrade = useCallback(() => {
        if (!amount || !market || !isConnected) return;
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) return;

        setTradeMessage('');
        if (side === 'buy') {
            buy(marketIdBigInt, outcome, amount, minOutputRaw);
        } else {
            sell(marketIdBigInt, outcome, amountWei, minOutputRaw);
        }
    }, [amount, market, isConnected, outcome, side, buy, sell, minOutputRaw, amountWei]);

    const handleClaim = () => {
        if (!id) return;
        writeClaim({
            address: PREDICTION_MARKET_ADDRESS,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'claimWinnings',
            args: [marketIdBigInt],
        });
    };

    if (loading && !market) {
        return (
            <div className={styles.container}>
                <div className={styles.leftColumn}>
                    <div className={styles.header}>
                        <div className="skeleton" style={{ width: '120px', height: '24px', borderRadius: '4px' }}></div>
                        <div className={styles.titleArea}>
                            <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '12px' }}></div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="skeleton" style={{ width: '80%', height: '32px', borderRadius: '4px' }}></div>
                                <div className="skeleton" style={{ width: '40%', height: '20px', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel skeleton" style={{ width: '100%', height: '400px', borderRadius: '16px' }}></div>
                </div>
                <div className={styles.rightColumn}>
                    <div className="glass-panel-heavy skeleton" style={{ width: '100%', height: '300px', borderRadius: '16px' }}></div>
                </div>
            </div>
        );
    }

    if (!market) {
        return <div className={styles.container}><div className={styles.error}>Market not found</div></div>;
    }

    const endDate = new Date(market.endTime * 1000).toLocaleDateString();
    
    // Check if market is resolved and user has winning shares
    // Explicitly check for market.resolvedOutcome dynamically from API/contract if possible, but currently API returns status
    // Assuming status === 1 means resolved. We will need resolvedOutcome to know who won.
    // For now, if the user has shares in the winning side, show claim.
    const isResolved = market.status === 1;
    const resolvedOutcome = market.resolvedOutcome || 0; 
    
    let hasWinningShares = false;
    if (isResolved && posData) {
        // Viem might return named tuples as objects or arrays
        const pos: any = posData;
        const yesShares = pos.yesShares !== undefined ? pos.yesShares : pos[0];
        const noShares = pos.noShares !== undefined ? pos.noShares : pos[1];
        
        if (resolvedOutcome === 1 && (yesShares as bigint) > 0n) hasWinningShares = true;
        if (resolvedOutcome === 2 && (noShares as bigint) > 0n) hasWinningShares = true;
    }


    return (
        <div className={styles.container}>
            <div className={styles.leftColumn}>

                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        Back to Markets
                    </button>
                    <div className={styles.titleArea}>
                        <MarketImage src={market.imageUrl} alt={market.title} category={market.category} size={72} />
                        <div>
                            <h1 className={styles.title}>
                                {market.title}
                                {isResolved && <span className={styles.resolvedBadge}>RESOLVED</span>}
                            </h1>
                            <div className={styles.badges}>
                                <span className={styles.badge}><TrendingUp size={14} /> {market.category}</span>
                                <span className={styles.badge}><Clock size={14} /> Ends {endDate}</span>
                                <span className={styles.badgeVolume}>{market.volume} Vol</span>
                            </div>
                        </div>
                    </div>
                </div>

                {isResolved && hasWinningShares && (
                    <div className={styles.claimBanner}>
                        <h3>🎉 You won this market!</h3>
                        <p>Click below to claim your ETH winnings directly to your wallet.</p>
                        <button className={styles.claimBtn} onClick={handleClaim} disabled={isClaiming}>
                            {isClaiming ? 'Claiming...' : 'Claim Winnings'}
                        </button>
                    </div>
                )}

                <div className={styles.chartContainer}>
                    <div className={styles.chartHeader}>
                        <div className={styles.priceDisplay}>
                            <span className={styles.priceLabel}>Yes</span>
                            <span className={styles.currentPrice}>{isResolved ? (resolvedOutcome === 1 ? '100¢' : '0¢') : `${market.yesPrice}¢`}</span>
                            <span className={styles.priceChange} style={{ color: priceChange >= 0 ? '#22c55e' : '#ef4444' }}>{priceChangeStr}</span>
                        </div>
                        <div className={styles.timeframes}>
                            {['1H', '1D', '1W', '1M', 'ALL'].map(tf => (
                                <button
                                    key={tf}
                                    className={`${styles.tfBtn} ${timeframe === tf ? styles.tfActive : ''}`}
                                    onClick={() => setTimeframe(tf)}
                                >{tf}</button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} hide />
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8 }}
                                formatter={(value: any) => [`${value}¢`, 'Price']}
                            />
                            <Area type="monotone" dataKey="price" stroke="#22c55e" fill="url(#priceGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className={styles.tabs}>
                    {(['liquidity', 'activity', 'rules'] as const).map(tab => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'liquidity' ? 'Pool Liquidity' : tab === 'activity' ? 'Activity' : 'Rules'}
                        </button>
                    ))}
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'liquidity' && (
                        <div className={styles.liquidityPool}>
                            <h3 className={styles.poolTitle}>Automated Market Maker (AMM) Depth</h3>
                            <p className={styles.poolDesc}>This market uses a constant-product AMM. Prices are determined by the ratio of ETH in each outcome's pool.</p>
                            
                            <div className={styles.poolStats}>
                                <div className={styles.poolStatCard}>
                                    <span className={styles.poolStatLabel}>Total Volume</span>
                                    <span className={styles.poolStatValue}>{market.volume}</span>
                                </div>
                                <div className={styles.poolStatCard}>
                                    <span className={styles.poolStatLabel}>Yes Pool</span>
                                    <span className={styles.poolStatValue} style={{ color: 'var(--accent-green-bright)' }}>
                                        {market.yesPool ? parseFloat(ethers.formatEther(market.yesPool)).toFixed(4) : '0.0000'} ETH
                                    </span>
                                </div>
                                <div className={styles.poolStatCard}>
                                    <span className={styles.poolStatLabel}>No Pool</span>
                                    <span className={styles.poolStatValue} style={{ color: 'var(--accent-red-bright)' }}>
                                        {market.noPool ? parseFloat(ethers.formatEther(market.noPool)).toFixed(4) : '0.0000'} ETH
                                    </span>
                                </div>
                            </div>

                            <div className={styles.poolVisual}>
                                <div className={styles.poolVisualBar}>
                                    <div 
                                        className={styles.poolVisualYes} 
                                        style={{ width: `${Math.max(5, market.yesPrice)}%` }}
                                    ></div>
                                    <div 
                                        className={styles.poolVisualNo} 
                                        style={{ width: `${Math.max(5, market.noPrice)}%` }}
                                    ></div>
                                </div>
                                <div className={styles.poolVisualLabels}>
                                    <span>Yes Liquidity</span>
                                    <span>No Liquidity</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'activity' && (
                        <div className={styles.activityList}>
                            {activity.length === 0 ? (
                                <div className={styles.emptyState}>No recent activity</div>
                            ) : (
                                activity.map((t, i) => (
                                    <div key={i} className={styles.activityRow}>
                                        <span className={styles.activitySide} style={{ color: t.outcome === 'Yes' ? 'var(--accent-green-bright)' : 'var(--accent-red-bright)' }}>
                                            {t.outcome}
                                        </span>
                                        <span className={styles.activityShares}>{parseFloat(t.shares).toFixed(2)} shares</span>
                                        <span className={styles.activityAddr}>{t.buyer.substring(0, 6)}...{t.buyer.substring(38)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === 'rules' && (
                        <div className={styles.rules}>
                            <p>{market.description}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.rightColumn}>
                <div className={styles.tradingPanel}>
                    {isResolved ? (
                        <div className={styles.resolvedOverlay}>
                            <h3>Market is resolved</h3>
                            <p>Winning outcome: <strong>{resolvedOutcome === 1 ? 'Yes' : 'No'}</strong></p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.tradeHeader}>
                                <div className={styles.buyToggle}>
                                    <button
                                        className={`${styles.toggleBtn} ${side === 'buy' ? styles.buyActive : ''}`}
                                        onClick={() => setSide('buy')}
                                    >Buy</button>
                                    <button
                                        className={`${styles.toggleBtn} ${side === 'sell' ? styles.sellActive : ''}`}
                                        onClick={() => setSide('sell')}
                                    >Sell</button>
                                </div>
                            </div>

                            <div className={styles.outcomeGrid}>
                                <button
                                    className={`${styles.outcomeSelect} ${outcome === 'Yes' ? styles.yesSelected : ''}`}
                                    onClick={() => setOutcome('Yes')}
                                >
                                    <span className={styles.outcomeName}>Yes</span>
                                    <span className={styles.outcomeProb}>{market.yesPrice}¢</span>
                                </button>
                                <button
                                    className={`${styles.outcomeSelect} ${outcome === 'No' ? styles.noSelected : ''}`}
                                    onClick={() => setOutcome('No')}
                                >
                                    <span className={styles.outcomeName}>No</span>
                                    <span className={styles.outcomeProb}>{market.noPrice}¢</span>
                                </button>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>
                                    Amount
                                    {side === 'sell' && posData && (
                                        <span style={{ float: 'right', fontWeight: 400 }}>
                                            Max: {ethers.formatEther(outcome === 'Yes' 
                                                ? ((posData as any).yesShares ?? (posData as any)[0]) 
                                                : ((posData as any).noShares ?? (posData as any)[1]))}
                                        </span>
                                    )}
                                </label>
                                <div className={`${styles.inputWrapper} ${styles.inputFocus}`}>
                                    {side === 'buy' && <span className={styles.currencyPrefix}>Ξ</span>}
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={amount}
                                        onChange={(e) => { setAmount(e.target.value); setTradeMessage(''); }}
                                        className={styles.input}
                                        step="0.01"
                                        min="0"
                                    />
                                    <span className={styles.currencySuffix}>{side === 'buy' ? 'ETH' : 'Shares'}</span>
                                </div>
                                <div className={styles.quickAmounts}>
                                    {side === 'buy' ? (
                                        ['0.01', '0.05', '0.1', '0.5'].map(v => (
                                            <button key={v} className={styles.quickVal} onClick={() => setAmount(v)}>
                                                {v} ETH
                                            </button>
                                        ))
                                    ) : (
                                        ['10', '50', '100', 'Max'].map(v => (
                                            <button key={v} className={styles.quickVal} onClick={() => {
                                                if (v === 'Max' && posData) {
                                                    const shares = outcome === 'Yes' ? ((posData as any).yesShares ?? (posData as any)[0]) : ((posData as any).noShares ?? (posData as any)[1]);
                                                    setAmount(ethers.formatEther(shares));
                                                } else {
                                                    setAmount(v);
                                                }
                                            }}>
                                                {v}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className={styles.summaryArea}>
                                <div className={styles.summaryRow}>
                                    <span>{side === 'buy' ? 'Est. Shares Received' : 'Est. ETH Payout (Net)'}</span>
                                    <span className={styles.highlightVal}>{estOutputDisplay} {side === 'buy' ? '' : 'ETH'}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Slippage Tolerance</span>
                                    <select 
                                        className={styles.slippageSelect} 
                                        value={slippage} 
                                        onChange={(e) => setSlippage(e.target.value)}
                                        style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 600, textAlign: 'right', cursor: 'pointer' }}
                                    >
                                        <option value="0.1">0.1%</option>
                                        <option value="0.5">0.5%</option>
                                        <option value="1.0">1.0%</option>
                                        <option value="2.0">2.0%</option>
                                    </select>
                                </div>
                            </div>

                            {isConnected ? (
                                <button
                                    className={`${styles.placeOrderBtn} ${outcome === 'Yes' ? styles.yesBtnBrand : styles.noBtnBrand}`}
                                    onClick={handleTrade}
                                    disabled={!amount || isPending || isConfirming}
                                >
                                    {isPending ? 'Confirm in wallet...' :
                                     isConfirming ? 'Confirming...' :
                                     `${side === 'buy' ? 'Buy' : 'Sell'} ${outcome}`}
                                </button>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <ConnectButton />
                                </div>
                            )}

                            <p className={styles.feeNotice}>Trading fee: 0.2%</p>

                            {tradeMessage && (
                                <p className={`${styles.tradeMessage} ${isBuySuccess ? styles.tradeSuccess : styles.tradeError}`}>
                                    {tradeMessage}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketDetail;
