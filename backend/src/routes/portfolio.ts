import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const positions = db.getPositions(req.userId!);
  const balance = db.getUserBalance(req.userId!);

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.avgPrice * p.shares / 100, 0);
  const totalReturn = totalValue - totalCost;
  const totalReturnPct = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

  res.json({
    balance,
    portfolioValue: parseFloat(totalValue.toFixed(2)),
    totalReturn: parseFloat(totalReturn.toFixed(2)),
    totalReturnPct: parseFloat(totalReturnPct.toFixed(2)),
    positions,
  });
});

export default router;
