import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '../../config/contract';
import { useApi } from '../../services/api';
import MarketImage from '../../components/MarketImage/MarketImage';
import styles from './Admin.module.css';

export default function Admin() {
    const api = useApi();
    const { isConnected } = useAccount();
    const [markets, setMarkets] = useState<any[]>([]);

    // Form states
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState('');
    const [imgUrl, setImgUrl] = useState('');
    const [endTimeDate, setEndTimeDate] = useState('');

    const { writeContract: writeCreate, data: createHash, isPending: isCreating } = useWriteContract();
    const { isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({ hash: createHash });

    const { writeContract: writeResolve, data: resolveHash, isPending: isResolving } = useWriteContract();
    const { isSuccess: isResolveSuccess } = useWaitForTransactionReceipt({ hash: resolveHash });

    useEffect(() => {
        api.markets.list()
            .then(data => setMarkets(data))
            .catch(console.error);
    }, [isCreateSuccess, isResolveSuccess]);

    if (!isConnected) {
        return (
            <div className={styles.container}>
                <h1>Admin Panel</h1>
                <p>Please connect your wallet to access the Admin panel.</p>
            </div>
        );
    }

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const endTime = Math.floor(new Date(endTimeDate).getTime() / 1000);
        writeCreate({
            address: PREDICTION_MARKET_ADDRESS,
            abi: PREDICTION_MARKET_ABI as any,
            functionName: 'createMarket',
            args: [title, desc, category, imgUrl, BigInt(endTime)],
        });
    };

    const handleResolve = (marketId: string, outcome: 'Yes' | 'No') => {
        writeResolve({
            address: PREDICTION_MARKET_ADDRESS,
            abi: PREDICTION_MARKET_ABI as any,
            functionName: 'resolveMarket',
            args: [BigInt(marketId), outcome === 'Yes' ? 1 : 2],
        });
    };

    return (
        <div className={styles.container}>
            <h1>Admin Dashboard</h1>

            <section className={styles.section}>
                <h2>Create Market</h2>
                <form onSubmit={handleCreate} className={styles.form}>
                    <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
                    <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} required />
                    <input placeholder="Category (e.g. Crypto, Politics)" value={category} onChange={e => setCategory(e.target.value)} required />
                    <input placeholder="Image URL" value={imgUrl} onChange={e => setImgUrl(e.target.value)} required />
                    <input type="datetime-local" value={endTimeDate} onChange={e => setEndTimeDate(e.target.value)} required />
                    <button type="submit" disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create Market'}
                    </button>
                    {isCreateSuccess && <p className={styles.success}>Market created successfully!</p>}
                </form>
            </section>

            <section className={styles.section}>
                <h2>Resolve Active Markets</h2>
                <div className={styles.marketList}>
                    {markets.filter(m => m.status === 0).map(m => (
                        <div key={m.id} className={styles.marketCard}>
                            <MarketImage src={m.imageUrl} alt={m.title} category={m.category} size={48} />
                            <div className={styles.details}>
                                <span className={styles.id}>#{m.id}</span>
                                <h3>{m.title}</h3>
                            </div>
                            <div className={styles.actions}>
                                <button onClick={() => handleResolve(m.id, 'Yes')} disabled={isResolving} className={styles.btnYes}>
                                    Resolve YES
                                </button>
                                <button onClick={() => handleResolve(m.id, 'No')} disabled={isResolving} className={styles.btnNo}>
                                    Resolve NO
                                </button>
                            </div>
                        </div>
                    ))}
                    {markets.filter(m => m.status === 0).length === 0 && <p>No open markets.</p>}
                </div>
            </section>
        </div>
    );
}
