import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '../../config/contract';
import styles from './Admin.module.css';

export default function Admin() {
    const { address } = useAccount();
    const [markets, setMarkets] = useState<any[]>([]);

    const { data: adminAddress } = useReadContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI as any, // Cast to any to bypass strict type check for now since ABI is imported as json
        functionName: 'admin',
    });

    const isOwner = address && adminAddress && address.toLowerCase() === (adminAddress as unknown as string).toLowerCase();

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
        fetch('http://localhost:3001/api/markets')
            .then(res => res.json())
            .then(data => setMarkets(data))
            .catch(console.error);
    }, [isCreateSuccess, isResolveSuccess]);

    if (!isOwner) {
        return (
            <div className={styles.container}>
                <h1>Admin Panel</h1>
                <p>Access Denied. You are not the contract owner.</p>
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
                            <img src={m.imageUrl} alt={m.title} className={styles.img} />
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
