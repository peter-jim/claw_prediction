import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Clock, Info, Activity, List, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMarketById } from '../../data/markets';
import styles from './MarketDetail.module.css';

// Enhanced Mock Data
const generateChartData = (baseVal: number, points: number) => {
    let current = baseVal;
    return Array.from({ length: points }, (_, i) => {
        const time = new Date();
        time.setHours(time.getHours() - (points - i));
        current = Math.max(1, Math.min(99, current + (Math.random() * 10 - 4.5)));
        return {
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: Math.round(current)
        };
    });
};

const ORDER_BOOK = {
    yes: [
        { price: 51.5, shares: 12450 }, { price: 51.0, shares: 8300 },
        { price: 50.5, shares: 25100 }, { price: 50.0, shares: 45000 }
    ],
    no: [
        { price: 48.5, shares: 9200 }, { price: 49.0, shares: 15400 },
        { price: 49.5, shares: 32000 }, { price: 50.0, shares: 51000 }
    ]
};

const MarketDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, user } = useAuth();

    const market = getMarketById(id || '');
    const initialOutcome = (searchParams.get('outcome') as 'Yes' | 'No') || 'Yes';

    const [timeframe, setTimeframe] = useState('1D');
    const [activeTab, setActiveTab] = useState('orderbook');
    const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
    const [orderType, setOrderType] = useState('market');
    const [outcome, setOutcome] = useState<'Yes' | 'No'>(initialOutcome);
    const [amount, setAmount] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);

    const currentPrice = market ? (outcome === 'Yes' ? market.yesPrice : market.noPrice) : 52.0;
    const chartData = generateChartData(currentPrice, 24);
    const estShares = amount ? (parseFloat(amount) / (currentPrice / 100)).toFixed(2) : '0.00';
    const potReturn = amount ? ((parseFloat(estShares) - parseFloat(amount)) / parseFloat(amount) * 100).toFixed(2) : '0.00';

    const handlePlaceOrder = () => {
        if (!amount || parseFloat(amount) <= 0) return;
        if (!user) return;
        // Simulate order placement
        setOrderPlaced(true);
        setTimeout(() => {
            setOrderPlaced(false);
            setAmount('');
        }, 2000);
    };

    if (!market) {
        return (
            <div className={styles.container}>
                <div className={styles.leftColumn}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} /> Back to Markets
                    </button>
                    <p style={{ color: '#9ca3af', padding: '2rem' }}>Market not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.leftColumn}>

                {/* Header Section */}
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        Back to Markets
                    </button>
                    <div className={styles.titleArea}>
                        <img
                            src={market.image}
                            alt="Market"
                            className={styles.image}
                            onError={(e) => { e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/600px-No_image_available.svg.png'; }}
                        />
                        <div>
                            <h1 className={styles.title}>{market.title}</h1>
                            <div className={styles.badges}>
                                <span className={styles.badge}><TrendingUp size={14} /> {market.category}</span>
                                {market.endDate && <span className={styles.badge}><Clock size={14} /> Ends {market.endDate}</span>}
                                <span className={styles.badgeVolume}>${market.volume} Vol</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className={styles.chartContainer}>
                    <div className={styles.chartHeader}>
                        <div className={styles.priceDisplay}>
                            <span className={styles.priceLabel}>{outcome}</span>
                            <span className={styles.currentPrice}>{currentPrice}¢</span>
                            <span className={styles.priceChange}>+4.2¢ (24h)</span>
                        </div>
                        <div className={styles.timeframes}>
                            {['1H', '1D', '1W', '1M', 'ALL'].map(tf => (
                                <button
                                    key={tf}
                                    className={`${styles.tfBtn} ${timeframe === tf ? styles.tfActive : ''}`}
                                    onClick={() => setTimeframe(tf)}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.chartArea}>
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                                <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}¢`} domain={['dataMin - 5', 'dataMax + 5']} />
                                <Tooltip
                                    contentStyle={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#4ade80', fontWeight: 600 }}
                                    labelStyle={{ color: '#a3a3a3', marginBottom: '4px' }}
                                />
                                <ReferenceLine y={50} stroke="#333" strokeDasharray="3 3" />
                                <Area type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" activeDot={{ r: 6, fill: '#22c55e', stroke: '#1a1b1e', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className={styles.contentSection}>
                    <div className={styles.tabs}>
                        <button className={`${styles.tab} ${activeTab === 'orderbook' ? styles.tabActive : ''}`} onClick={() => setActiveTab('orderbook')}>
                            <List size={16} /> Order Book
                        </button>
                        <button className={`${styles.tab} ${activeTab === 'activity' ? styles.tabActive : ''}`} onClick={() => setActiveTab('activity')}>
                            <Activity size={16} /> Activity
                        </button>
                        <button className={`${styles.tab} ${activeTab === 'rules' ? styles.tabActive : ''}`} onClick={() => setActiveTab('rules')}>
                            <Info size={16} /> Rules
                        </button>
                    </div>

                    <div className={styles.tabContent}>
                        {activeTab === 'orderbook' && (
                            <div className={styles.orderBook}>
                                <div className={styles.obHeader}>
                                    <span>Outcome</span>
                                    <span>Size</span>
                                    <span>Price</span>
                                </div>
                                <div className={styles.obSide}>
                                    <h4 className={styles.yesTitle}>Yes Orders</h4>
                                    {ORDER_BOOK.yes.map((o, i) => (
                                        <div key={i} className={styles.obRow}>
                                            <div className={styles.obDepth} style={{ width: `${(o.shares / 50000) * 100}%`, background: 'rgba(34, 197, 94, 0.1)' }}></div>
                                            <span className={styles.obYesColor}>Yes</span>
                                            <span>{o.shares.toLocaleString()}</span>
                                            <span>{o.price}¢</span>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.obSide}>
                                    <h4 className={styles.noTitle}>No Orders</h4>
                                    {ORDER_BOOK.no.map((o, i) => (
                                        <div key={i} className={styles.obRow}>
                                            <div className={styles.obDepth} style={{ width: `${(o.shares / 50000) * 100}%`, background: 'rgba(248, 113, 113, 0.1)' }}></div>
                                            <span className={styles.obNoColor}>No</span>
                                            <span>{o.shares.toLocaleString()}</span>
                                            <span>{o.price}¢</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className={styles.activityList}>
                                <div className={styles.activityItem}>
                                    <div>Bought <strong>450 Yes</strong> at {market.yesPrice}¢</div>
                                    <span className={styles.timeAgo}>2 mins ago</span>
                                </div>
                                <div className={styles.activityItem}>
                                    <div>Bought <strong>120 No</strong> at {market.noPrice}¢</div>
                                    <span className={styles.timeAgo}>5 mins ago</span>
                                </div>
                                <div className={styles.activityItem}>
                                    <div>Sold <strong>800 Yes</strong> at {market.yesPrice - 1}¢</div>
                                    <span className={styles.timeAgo}>12 mins ago</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'rules' && (
                            <div className={styles.rulesContent}>
                                <h3>Resolution Conditions</h3>
                                <p>{market.description || 'Resolution conditions not available.'}</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <div className={styles.rightColumn}>
                <div className={styles.tradingPanel}>
                    <div className={styles.tradeHeader}>
                        <div className={styles.buyToggle}>
                            <button
                                className={`${styles.toggleBtn} ${tradeMode === 'buy' ? styles.buyActive : ''}`}
                                onClick={() => setTradeMode('buy')}
                            >
                                Buy
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${tradeMode === 'sell' ? styles.buyActive : ''}`}
                                onClick={() => setTradeMode('sell')}
                            >
                                Sell
                            </button>
                        </div>
                        <button className={styles.settingsBtn}><Settings size={18} /></button>
                    </div>

                    <div className={styles.orderTypeToggle}>
                        <button className={`${styles.typeBtn} ${orderType === 'market' ? styles.typeActive : ''}`} onClick={() => setOrderType('market')}>Market</button>
                        <button className={`${styles.typeBtn} ${orderType === 'limit' ? styles.typeActive : ''}`} onClick={() => setOrderType('limit')}>Limit</button>
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

                    {orderType === 'limit' && (
                        <div className={styles.inputGroup}>
                            <label>Limit Price (¢)</label>
                            <div className={styles.inputWrapper}>
                                <input type="number" placeholder={`${currentPrice}`} className={styles.input} />
                            </div>
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Amount</label>
                        <div className={`${styles.inputWrapper} ${styles.inputFocus}`}>
                            <span className={styles.currencyPrefix}>$</span>
                            <input
                                type="number"
                                placeholder="0"
                                className={styles.input}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="0"
                            />
                            <span className={styles.currencySuffix}>USDC</span>
                        </div>
                    </div>

                    <div className={styles.quickAmounts}>
                        {['10', '50', '100', 'Max'].map(val => (
                            <button
                                key={val}
                                className={styles.quickVal}
                                onClick={() => setAmount(val === 'Max' ? String(user?.balance?.toFixed(0) ?? '1250') : val)}
                            >
                                {val}
                            </button>
                        ))}
                    </div>

                    <div className={styles.summaryArea}>
                        <div className={styles.summaryRow}>
                            <span>Est. Shares</span>
                            <span className={styles.highlightVal}>{estShares}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Potential return</span>
                            <span className={Number(potReturn) > 0 ? styles.returnPos : ''}>
                                ${amount ? (parseFloat(estShares) - parseFloat(amount)).toFixed(2) : '0.00'} ({amount ? potReturn : '0.00'}%)
                            </span>
                        </div>
                        {isAuthenticated && user && (
                            <div className={styles.summaryRow}>
                                <span>Balance</span>
                                <span className={styles.highlightVal}>${user.balance.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {orderPlaced ? (
                        <button className={`${styles.placeOrderBtn} ${styles.orderSuccess}`} disabled>
                            ✓ Order Placed!
                        </button>
                    ) : isAuthenticated ? (
                        <button
                            className={`${styles.placeOrderBtn} ${outcome === 'Yes' ? styles.yesBtnBrand : styles.noBtnBrand}`}
                            onClick={handlePlaceOrder}
                            disabled={!amount || parseFloat(amount) <= 0}
                        >
                            {tradeMode === 'buy' ? 'Buy' : 'Sell'} {outcome}
                        </button>
                    ) : (
                        <button
                            className={`${styles.placeOrderBtn} ${styles.loginPromptBtn}`}
                            onClick={() => navigate('/?login=1')}
                        >
                            Log In to Trade
                        </button>
                    )}

                    <div className={styles.feeNotice}>
                        No trading fees. Powered by Polygon.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketDetail;

