import { prisma } from '../prisma/client';

export async function updateMarketPrices(marketId: string) {
  const orders = await prisma.order.findMany({
    where: { marketId, status: 'FILLED' },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  if (orders.length === 0) return;

  const yesOrders = orders.filter(o => o.outcome === 'YES');
  const noOrders = orders.filter(o => o.outcome === 'NO');

  const totalYes = yesOrders.reduce((s, o) => s + o.shares, 0);
  const totalNo = noOrders.reduce((s, o) => s + o.shares, 0);
  const total = totalYes + totalNo;

  if (total === 0) return;

  const yesPrice = parseFloat((totalYes / total).toFixed(4));
  const noPrice = parseFloat((1 - yesPrice).toFixed(4));

  await prisma.market.update({
    where: { id: marketId },
    data: { yesPrice, noPrice },
  });
}
