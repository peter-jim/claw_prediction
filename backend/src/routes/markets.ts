import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { search, category } = req.query;
  const markets = db.getMarkets({
    search: search as string | undefined,
    category: category as string | undefined,
  });
  res.json(markets);
});

router.get('/:id', (req, res) => {
  const market = db.getMarketById(req.params.id);
  if (!market) {
    res.status(404).json({ error: 'Market not found' });
    return;
  }
  res.json(market);
});

router.get('/:id/activity', (req, res) => {
  const trades = db.getRecentTrades(req.params.id);
  res.json(trades);
});

export default router;
