import { Response } from 'express';
import { prisma } from '../prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const placeOrderSchema = z.object({
  marketId: z.string(),
  type: z.enum(['MARKET', 'LIMIT']),
  side: z.enum(['BUY', 'SELL']),
  outcome: z.enum(['YES', 'NO']),
  amount: z.number().positive(),
  price: z.number().min(0.01).max(0.99).optional(),
});

export async function placeOrder(req: AuthRequest, res: Response) {
  try {
    const data = placeOrderSchema.parse(req.body);
    const userId = req.userId!;

    const market = await prisma.market.findUnique({ where: { id: data.marketId } });
    if (!market || market.status !== 'ACTIVE') {
      res.status(400).json({ error: 'Market not available for trading' });
      return;
    }

    const price = data.type === 'MARKET'
      ? (data.outcome === 'YES' ? market.yesPrice : market.noPrice)
      : (data.price ?? (data.outcome === 'YES' ? market.yesPrice : market.noPrice));

    const shares = data.amount / price;
    const cost = data.amount;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (data.side === 'BUY' && user.balance < cost) {
      res.status(400).json({ error: 'Insufficient balance' });
      return;
    }

    if (data.side === 'SELL') {
      const position = await prisma.position.findUnique({
        where: { userId_marketId_outcome: { userId, marketId: data.marketId, outcome: data.outcome } },
      });
      if (!position || position.shares < shares) {
        res.status(400).json({ error: 'Insufficient shares to sell' });
        return;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          marketId: data.marketId,
          type: data.type,
          side: data.side,
          outcome: data.outcome,
          amount: data.amount,
          price,
          shares,
          status: 'FILLED',
        },
      });

      if (data.side === 'BUY') {
        await tx.user.update({
          where: { id: userId },
          data: { balance: { decrement: cost } },
        });
      } else {
        await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: cost } },
        });
      }

      const existingPosition = await tx.position.findUnique({
        where: { userId_marketId_outcome: { userId, marketId: data.marketId, outcome: data.outcome } },
      });

      if (data.side === 'BUY') {
        if (existingPosition) {
          const totalShares = existingPosition.shares + shares;
          const newAvgPrice = ((existingPosition.shares * existingPosition.avgPrice) + cost) / totalShares;
          await tx.position.update({
            where: { userId_marketId_outcome: { userId, marketId: data.marketId, outcome: data.outcome } },
            data: { shares: totalShares, avgPrice: newAvgPrice, currentPrice: price },
          });
        } else {
          await tx.position.create({
            data: { userId, marketId: data.marketId, outcome: data.outcome, shares, avgPrice: price, currentPrice: price },
          });
        }
      } else {
        if (existingPosition) {
          const newShares = existingPosition.shares - shares;
          if (newShares <= 0) {
            await tx.position.delete({
              where: { userId_marketId_outcome: { userId, marketId: data.marketId, outcome: data.outcome } },
            });
          } else {
            await tx.position.update({
              where: { userId_marketId_outcome: { userId, marketId: data.marketId, outcome: data.outcome } },
              data: { shares: newShares },
            });
          }
        }
      }

      const newVolume = market.volume + cost;
      const newYesPrice = data.outcome === 'YES'
        ? Math.min(0.99, price + 0.01)
        : Math.max(0.01, market.yesPrice - 0.005);
      const newNoPrice = parseFloat((1 - newYesPrice).toFixed(4));

      await tx.market.update({
        where: { id: data.marketId },
        data: { volume: newVolume, yesPrice: newYesPrice, noPrice: newNoPrice },
      });

      await tx.chartPoint.create({
        data: { marketId: data.marketId, yesPrice: newYesPrice, noPrice: newNoPrice, volume: cost },
      });

      return order;
    });

    res.status(201).json(result);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    res.status(500).json({ error: 'Failed to place order' });
  }
}

export async function getOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { market: { select: { title: true, category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}
