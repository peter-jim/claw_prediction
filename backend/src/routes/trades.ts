import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();

router.post('/', authMiddleware, (req: AuthRequest, res) => {
  const { marketId, outcome, side, orderType, amount } = req.body;

  if (!marketId || !outcome || !side || !amount) {
    res.status(400).json({ error: 'Missing required fields: marketId, outcome, side, amount' });
    return;
  }

  if (!['Yes', 'No'].includes(outcome)) {
    res.status(400).json({ error: 'Outcome must be "Yes" or "No"' });
    return;
  }

  if (!['buy', 'sell'].includes(side)) {
    res.status(400).json({ error: 'Side must be "buy" or "sell"' });
    return;
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400).json({ error: 'Amount must be a positive number' });
    return;
  }

  const trade = db.createTrade(
    req.userId!,
    marketId,
    outcome,
    side,
    orderType || 'market',
    numAmount
  );

  if (!trade) {
    res.status(400).json({ error: 'Trade failed. Check balance or market availability.' });
    return;
  }

  const balance = db.getUserBalance(req.userId!);
  res.status(201).json({ trade, balance });
});

export default router;
