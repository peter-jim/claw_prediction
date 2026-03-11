import { Router } from 'express';
import { contract } from '../contract.js';
import { ethers } from 'ethers';

const router = Router();

// GET /api/portfolio/:address — get user's positions across all markets
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    const count = await contract.getMarketCount();
    const positions = [];

    for (let i = 0; i < Number(count); i++) {
      const pos = await contract.getPosition(i, address);
      const yesShares = pos.yesShares;
      const noShares = pos.noShares;

      // Only include markets where user has a position
      if (yesShares > 0n || noShares > 0n) {
        const m = await contract.getMarket(i);
        const yesPrice = await contract.getYesPrice(i);
        const noPrice = await contract.getNoPrice(i);

        positions.push({
          marketId: i.toString(),
          title: m.title,
          yesShares: ethers.formatEther(yesShares),
          noShares: ethers.formatEther(noShares),
          yesCost: ethers.formatEther(pos.yesCost),
          noCost: ethers.formatEther(pos.noCost),
          currentYesPrice: Math.round(Number(yesPrice) / 100),
          currentNoPrice: Math.round(Number(noPrice) / 100),
        });
      }
    }

    res.json({ positions });
  } catch (error: any) {
    console.error('Error fetching portfolio:', error.message);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

export default router;
