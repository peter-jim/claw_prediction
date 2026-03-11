import { prisma } from '../prisma/client';

export async function getUserBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });
  return user?.balance ?? 0;
}

export async function getUserPositionValue(userId: string): Promise<number> {
  const positions = await prisma.position.findMany({
    where: { userId },
    include: { market: { select: { yesPrice: true, noPrice: true } } },
  });

  return positions.reduce((sum, pos) => {
    const price = pos.outcome === 'YES' ? pos.market.yesPrice : pos.market.noPrice;
    return sum + pos.shares * price;
  }, 0);
}
