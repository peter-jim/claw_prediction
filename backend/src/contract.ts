import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load deployment info from the shared workspace
const deploymentPath = path.join(__dirname, '../../contracts/deployments/localhost.json');
export let CONTRACT_ADDRESS = '';
if (fs.existsSync(deploymentPath)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    CONTRACT_ADDRESS = deployment.address;
    console.log(`Loaded V2 proxy contract address: ${CONTRACT_ADDRESS}`);
} else {
    console.warn("Deployment info not found. Did you run deploy.ts?");
}

// ABI matching V2 implementation
const CONTRACT_ABI = [
    "event MarketCreated(uint256 indexed marketId, string title, string category, uint256 endTime, address creator)",
    "event SharesBought(uint256 indexed marketId, address indexed buyer, uint8 outcome, uint256 shares, uint256 cost)",
    "event SharesSold(uint256 indexed marketId, address indexed seller, uint8 outcome, uint256 shares, uint256 payout)",
    "event MarketResolved(uint256 indexed marketId, uint8 outcome)",
    "function getMarket(uint256) view returns (uint256 id, string memory title, string memory description, string memory category, string memory imageUrl, uint256 endTime, uint8 status, uint8 resolvedOutcome, uint256 yesShares, uint256 noShares, uint256 yesPool, uint256 noPool, address creator, uint256 createdAt)",
    "function getMarketCount() view returns (uint256)",
    "function getYesPrice(uint256) view returns (uint256)",
    "function getNoPrice(uint256) view returns (uint256)",
    "function getPoolReserves(uint256) view returns (uint256 yesPool, uint256 noPool, uint256 totalLp)"
];

// Connect to Hardhat network
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
export const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

export { provider };

export async function startIndexer() {
    const db = await getDb();
    
    // Check for last synced block
    let lastSyncedBlock = 0;
    const syncState = await db.get(`SELECT value FROM sync_state WHERE key = 'lastSyncedBlock'`);
    if (syncState) {
        lastSyncedBlock = syncState.value;
    }

    // Determine current block
    const currentBlock = await provider.getBlockNumber();
    
    // Fetch historical events from lastSyncedBlock to currentBlock
    if (lastSyncedBlock === 0) {
        console.log('Starting indexer from scratch... syncing past markets via getter.');
        // Ensure indexer initializes basic structure first
        try {
            const count = await contract.getMarketCount();
            for (let i = 0; i < Number(count); i++) {
                await syncMarketInfo(i.toString());
            }
        } catch (e) {
            console.error("Failed to fetch market count, indexer continuing...", e);
        }
    }

    const fromBlock = Math.max(0, lastSyncedBlock - 100); // overlap for safety
    console.log(`Syncing historical events from block ${fromBlock} to ${currentBlock}...`);

    await syncHistoricalEvents(fromBlock, currentBlock);
}

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
        INSERT INTO markets (id, title, description, category, imageUrl, endTime, status, resolvedOutcome, yesPrice, noPrice, volume, yesPool, noPool)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            resolvedOutcome = excluded.resolvedOutcome,
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
        Number(m.resolvedOutcome),
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

async function syncHistoricalEvents(fromBlock: number, toBlock: number) {
    const db = await getDb();
    const logs = await provider.getLogs({
        address: await contract.getAddress(),
        fromBlock,
        toBlock
    });

    for (const log of logs) {
        try {
            const parsed = contract.interface.parseLog(log);
            if (!parsed) continue;

            if (parsed.name === 'MarketCreated') {
                const marketId = parsed.args[0] as bigint;
                await syncMarketInfo(marketId.toString());
            } else if (parsed.name === 'SharesBought') {
                const marketId = parsed.args[0] as bigint;
                const buyer = parsed.args[1] as string;
                const outcome = parsed.args[2] as bigint;
                const amountObtained = parsed.args[3] as bigint;
                const ethCost = parsed.args[4] as bigint;
                await handleTradeEvent(marketId, buyer, outcome, amountObtained, ethCost, { blockNumber: log.blockNumber });
            } else if (parsed.name === 'SharesSold') {
                const marketId = parsed.args[0] as bigint;
                const seller = parsed.args[1] as string;
                const outcome = parsed.args[2] as bigint;
                const amountSold = parsed.args[3] as bigint;
                const payout = parsed.args[4] as bigint;
                await handleTradeEvent(marketId, seller, outcome, amountSold, payout, { blockNumber: log.blockNumber });
            } else if (parsed.name === 'MarketResolved') {
                const marketId = parsed.args[0] as bigint;
                await syncMarketInfo(marketId.toString());
            }

        } catch (e) {
            // Log might not belong to a known event
        }
    }

    // Update synced block
    await db.run(`
        INSERT INTO sync_state (key, value) VALUES ('lastSyncedBlock', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `, [toBlock]);

    console.log('Historical sync complete. Listening for new events...');

    // Utility to update sync state on every new event
    const updateSyncState = async (event: any) => {
        if (event && event.log && event.log.blockNumber) {
            await db.run(`
                INSERT INTO sync_state (key, value) VALUES ('lastSyncedBlock', ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value
            `, [event.log.blockNumber]);
        }
    };

    contract.on('MarketCreated', async (marketId: bigint, ...args) => {
        const event = args[args.length - 1]; // ethers v6 events are at the end
        console.log(`[Indexer] MarketCreated: ${marketId}`);
        await syncMarketInfo(marketId.toString());
        await updateSyncState(event);
    });

    contract.on('SharesBought', async (marketId: bigint, buyer: string, outcome: bigint, amountObtained: bigint, ethCost: bigint, event) => {
        console.log(`[Indexer] SharesBought: Market ${marketId} by ${buyer}`);
        await handleTradeEvent(marketId, buyer, outcome, amountObtained, ethCost, event);
        await updateSyncState(event);
    });

    contract.on('SharesSold', async (marketId: bigint, seller: string, outcome: bigint, amountSold: bigint, ethReceived: bigint, event) => {
        console.log(`[Indexer] SharesSold: Market ${marketId} by ${seller}`);
        await handleTradeEvent(marketId, seller, outcome, amountSold, ethReceived, event);
        await updateSyncState(event);
    });

    contract.on('MarketResolved', async (marketId: bigint, ...args) => {
        const event = args[args.length - 1];
        console.log(`[Indexer] MarketResolved: ${marketId}`);
        await syncMarketInfo(marketId.toString());
        await updateSyncState(event);
    });
}

