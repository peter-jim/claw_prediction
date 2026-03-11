import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// GET /api/markets — list all markets with optional search/category filter
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { search, category } = req.query;
    
    let query = 'SELECT * FROM markets WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (search && typeof search === 'string') {
      query += ' AND (title LIKE ? OR category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category && typeof category === 'string') {
      query += ' AND category = ?';
      params.push(category);
    }

    // Apply sorting
    const sort = req.query.sort as string;
    if (sort === 'volume') {
      query += ' ORDER BY CAST(yesPool AS REAL) + CAST(noPool AS REAL) DESC';
    } else if (sort === 'new') {
      // Since schema doesn't have a rigid createdAt inside SQLite yet, we'll order by ID which represents creation sequence
      query += ' ORDER BY id DESC';
    } else {
      // Default to trend: combination of recent activity and volume, or just high volume
      query += ' ORDER BY CAST(yesPool AS REAL) + CAST(noPool AS REAL) DESC, id DESC';
    }

    const markets = await db.all(query, params);
    
    // SQLite returns numbers/strings, map to API format
    res.json(markets.map((m: any) => ({
      ...m,
      status: Number(m.status),
      yesPrice: Number(m.yesPrice),
      noPrice: Number(m.noPrice)
    })));
  } catch (error: any) {
    console.error('Error fetching markets:', error.message);
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
});

// GET /api/markets/:id — get single market
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const id = req.params.id;
    
    const m = await db.get('SELECT * FROM markets WHERE id = ?', [id]);
    
    if (!m) {
      return res.status(404).json({ error: 'Market not found' });
    }

    res.json({
      ...m,
      status: Number(m.status),
      yesPrice: Number(m.yesPrice),
      noPrice: Number(m.noPrice)
    });
  } catch (error: any) {
    console.error('Error fetching market:', error.message);
    res.status(500).json({ error: 'Failed to fetch market' });
  }
});

// GET /api/markets/:id/activity — recent trades for this market
router.get('/:id/activity', async (req, res) => {
  try {
    const db = await getDb();
    const id = req.params.id;
    
    const activity = await db.all(`
      SELECT * FROM trades 
      WHERE marketId = ? 
      ORDER BY timestamp DESC 
      LIMIT 20
    `, [id]);

    res.json(activity);
  } catch (error: any) {
    console.error('Error fetching activity:', error.message);
    res.json([]);
  }
});

// GET /api/markets/:id/candles — chart data
router.get('/:id/candles', async (req, res) => {
  try {
    const db = await getDb();
    const id = req.params.id;
    const tf = (req.query.tf as string) || '1D';

    const candles = await db.all(`
      SELECT * FROM candles 
      WHERE marketId = ? AND timeframe = ?
      ORDER BY timestamp ASC
    `, [id, tf]);

    res.json(candles);
  } catch (error: any) {
    console.error('Error fetching candles:', error.message);
    res.json([]);
  }
});

export default router;
