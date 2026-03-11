import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load deployment info and ABI
const deploymentsDir = path.join(__dirname, '..', '..', 'contracts', 'deployments');
const deploymentInfo = JSON.parse(fs.readFileSync(path.join(deploymentsDir, 'localhost.json'), 'utf-8'));
const abi = JSON.parse(fs.readFileSync(path.join(deploymentsDir, 'PredictionMarketABI.json'), 'utf-8'));

export const CONTRACT_ADDRESS = deploymentInfo.address;
export const CONTRACT_ABI = abi;

// Connect to Hardhat network
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
export const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

export { provider };

// ─── Indexer Logic ─────────────────────────────────────────

function formatVolume(totalWei: bigint): string {
    const eth = parseFloat(ethers.formatEther(totalWei));
    if (eth >= 1000) return `${(eth / 1000).toFixed(1)}k ETH`;
    return `${eth.toFixed(2)} ETH`;
}

async function syncMarketInfo(marketId: string) {
    const db = await getDb();
    const m = await contract.getMarket(marketId);
    const yesPrice = await contract.getYesPrice(marketId);
    const noPrice = await contract.getNoPrice(marketId);

    const yesPriceRounded = Math.round(Number(yesPrice) / 100);
    const noPriceRounded = Math.round(Number(noPrice) / 100);
    const vol = formatVolume(m.yesPool + m.noPool);

    await db.run(`
        INSERT INTO markets (id, title, description, category, imageUrl, endTime, status, yesPrice, noPrice, volume, yesPool, noPool)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            yesPrice = excluded.yesPrice,
            noPrice = excluded.noPrice,
            volume = excluded.volume,
            yesPool = excluded.yesPool,
            noPool = excluded.noPool
    `, [
        marketId.toString(),
        m.title,
        m.description,
        m.category,
        m.imageUrl,
        Number(m.endTime),
        Number(m.status),
        yesPriceRounded,
        noPriceRounded,
        vol,
        m.yesPool.toString(),
        m.noPool.toString()
    ]);
    
    return { yesPriceRounded, noPriceRounded };
}

async function handleTradeEvent(marketId: bigint, buyer: string, outcome: bigint, shares: bigint, cost: bigint, event: any) {
    const db = await getDb();
    const marketIdStr = marketId.toString();
    const outcomeStr = Number(outcome) === 1 ? 'Yes' : 'No';
    const block = await provider.getBlock(event.blockNumber);
    const timestamp = block ? block.timestamp : Math.floor(Date.now() / 1000);

    // Save trade
    await db.run(`
        INSERT INTO trades (marketId, buyer, outcome, shares, cost, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
        marketIdStr,
        buyer,
        outcomeStr,
        ethers.formatEther(shares),
        ethers.formatEther(cost),
        timestamp
    ]);

    // Update market prices and pool info
    const { yesPriceRounded, noPriceRounded } = await syncMarketInfo(marketIdStr);

    // Add candle for 1D timeframe (simplified)
    const currentPrice = outcomeStr === 'Yes' ? yesPriceRounded : noPriceRounded;
    const dayTimestamp = Math.floor(timestamp / 86400) * 86400; // Start of day

    const existingCandle = await db.get(`SELECT * FROM candles WHERE marketId = ? AND timeframe = '1D' AND timestamp = ?`, [marketIdStr, dayTimestamp]);

    if (existingCandle) {
        await db.run(`
            UPDATE candles 
            SET high = MAX(high, ?), low = MIN(low, ?), close = ?
            WHERE id = ?
        `, [currentPrice, currentPrice, currentPrice, existingCandle.id]);
    } else {
        await db.run(`
            INSERT INTO candles (marketId, timeframe, timestamp, open, high, low, close)
            VALUES (?, '1D', ?, ?, ?, ?, ?)
        `, [marketIdStr, dayTimestamp, currentPrice, currentPrice, currentPrice, currentPrice]);
    }
}

export async function startIndexer() {
    console.log('Starting indexer... syncing past markets.');
    const count = await contract.getMarketCount();
    for (let i = 0; i < Number(count); i++) {
        await syncMarketInfo(i.toString());
    }

    console.log('Listening for new events...');

    contract.on(contract.getEvent('MarketCreated'), async (marketId: bigint) => {
        console.log(`[Indexer] MarketCreated: ${marketId}`);
        await syncMarketInfo(marketId.toString());
    });

    contract.on(contract.getEvent('SharesBought'), async (marketId: bigint, buyer: string, outcome: bigint, shares: bigint, cost: bigint, event) => {
        console.log(`[Indexer] SharesBought: Market ${marketId} by ${buyer}`);
        await handleTradeEvent(marketId, buyer, outcome, shares, cost, event);
    });

    contract.on(contract.getEvent('SharesSold'), async (marketId: bigint, seller: string, outcome: bigint, shares: bigint, payout: bigint, event) => {
        console.log(`[Indexer] SharesSold: Market ${marketId} by ${seller}`);
        // Treat as a trade for charting and history purposes
        await handleTradeEvent(marketId, seller, outcome, shares, payout, event);
    });

    contract.on(contract.getEvent('MarketResolved'), async (marketId: bigint) => {
        console.log(`[Indexer] MarketResolved: ${marketId}`);
        await syncMarketInfo(marketId.toString());
    });
}

