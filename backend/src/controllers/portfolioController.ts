import { Response } from 'express';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middleware/auth';

export async function getPortfolio(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const [user, positions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      }),
      prisma.position.findMany({
        where: { userId },
        include: { market: { select: { id: true, title: true, category: true, yesPrice: true, noPrice: true, status: true } } },
      }),
    ]);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const positionsWithValue = positions.map(pos => {
      const currentPrice = pos.outcome === 'YES' ? pos.market.yesPrice : pos.market.noPrice;
      const currentValue = pos.shares * currentPrice;
      const costBasis = pos.shares * pos.avgPrice;
      const pnl = currentValue - costBasis;
      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      return {
        id: pos.id,
        market: pos.market,
        outcome: pos.outcome,
        shares: pos.shares,
        avgPrice: pos.avgPrice,
        currentPrice,
        currentValue,
        costBasis,
        pnl,
        pnlPercent,
      };
    });

    const totalValue = positionsWithValue.reduce((sum, p) => sum + p.currentValue, 0);
    const totalCost = positionsWithValue.reduce((sum, p) => sum + p.costBasis, 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    res.json({
      cash: user.balance,
      portfolioValue: totalValue + user.balance,
      totalReturn: totalPnl,
      totalReturnPercent: totalPnlPercent,
      positions: positionsWithValue,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
}
