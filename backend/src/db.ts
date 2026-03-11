import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'indexer.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance: any = null;

export async function getDb() {
    if (dbInstance) return dbInstance;

    dbInstance = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await initializeSchema(dbInstance);
    return dbInstance;
}

async function initializeSchema(db: any) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS markets (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            imageUrl TEXT,
            endTime INTEGER,
            status INTEGER DEFAULT 0,
            resolvedOutcome INTEGER DEFAULT 0,
            yesPrice INTEGER DEFAULT 50,
            noPrice INTEGER DEFAULT 50,
            volume TEXT DEFAULT '0 ETH',
            yesPool TEXT DEFAULT '0',
            noPool TEXT DEFAULT '0'
        );

        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            marketId TEXT NOT NULL,
            buyer TEXT NOT NULL,
            outcome TEXT NOT NULL,
            shares TEXT NOT NULL,
            cost TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS candles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            marketId TEXT NOT NULL,
            timeframe TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            open INTEGER NOT NULL,
            high INTEGER NOT NULL,
            low INTEGER NOT NULL,
            close INTEGER NOT NULL,
            UNIQUE(marketId, timeframe, timestamp)
        );

        CREATE TABLE IF NOT EXISTS sync_state (
            key TEXT PRIMARY KEY,
            value INTEGER NOT NULL
        );
    `);
}
