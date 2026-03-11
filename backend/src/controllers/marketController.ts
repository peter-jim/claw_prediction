import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const createMarketSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(20),
  category: z.string(),
  imageUrl: z.string().url().or(z.literal('')).optional(),
  endDate: z.string().datetime(),
});

export async function getMarkets(req: Request, res: Response) {
  try {
    const { category, status, search, limit = '20', offset = '0' } = req.query;
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) where.title = { contains: search as string };

    const [markets, total] = await Promise.all([
      prisma.market.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { volume: 'desc' },
        select: {
          id: true, title: true, category: true, imageUrl: true,
          yesPrice: true, noPrice: true, volume: true, liquidity: true,
          status: true, endDate: true, createdAt: true,
        },
      }),
      prisma.market.count({ where }),
    ]);

    res.json({ markets, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
}

export async function getMarket(req: Request, res: Response) {
  try {
    const market = await prisma.market.findUnique({
      where: { id: req.params.id },
      include: {
        chartData: { orderBy: { timestamp: 'asc' }, take: 100 },
      },
    });
    if (!market) {
      res.status(404).json({ error: 'Market not found' });
      return;
    }
    res.json(market);
  } catch {
    res.status(500).json({ error: 'Failed to fetch market' });
  }
}

export async function getOrderBook(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const orders = await prisma.order.findMany({
      where: { marketId: id, status: 'PENDING' },
      orderBy: { price: 'desc' },
      select: { outcome: true, price: true, shares: true },
    });

    const yesOrders = orders.filter(o => o.outcome === 'YES').map(o => ({ price: o.price, shares: o.shares }));
    const noOrders = orders.filter(o => o.outcome === 'NO').map(o => ({ price: o.price, shares: o.shares }));

    res.json({ yes: yesOrders, no: noOrders });
  } catch {
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
}

export async function createMarket(req: AuthRequest, res: Response) {
  try {
    const data = createMarketSchema.parse(req.body);
    const market = await prisma.market.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl,
        endDate: new Date(data.endDate),
        yesPrice: 0.5,
        noPrice: 0.5,
      },
    });
    res.status(201).json(market);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    res.status(500).json({ error: 'Failed to create market' });
  }
}
