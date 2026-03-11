import { Router } from 'express';
import { sessions } from './auth.js';
import { MARKETS } from '../data.js';

const router = Router();

// Mock portfolio data per user
const portfolioData = new Map();

function requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const user = sessions.get(token);
    if (!user) return res.status(401).json({ error: 'Invalid or expired session' });
    req.user = user;
    next();
}

// GET /api/portfolio
router.get('/', requireAuth, (req, res) => {
    // Return mock positions for demo purposes
    const positions = [
        {
            id: 'p1',
            marketId: 'm1',
            market: MARKETS.find(m => m.id === 'm1')?.title || '',
            outcome: 'Yes',
            shares: 150.5,
            avgPrice: 45,
            currentPrice: MARKETS.find(m => m.id === 'm1')?.yesPrice || 52,
            value: 78.26,
            returnPct: 15.55,
        },
        {
            id: 'p2',
            marketId: 'm2',
            market: MARKETS.find(m => m.id === 'm2')?.title || '',
            outcome: 'No',
            shares: 50.0,
            avgPrice: 30,
            currentPrice: MARKETS.find(m => m.id === 'm2')?.noPrice || 25,
            value: 12.50,
            returnPct: -16.67,
        },
    ];

    const portfolioValue = positions.reduce((sum, p) => sum + p.value, 0);

    res.json({
        positions,
        portfolioValue: parseFloat(portfolioValue.toFixed(2)),
        cash: req.user.balance || 1250.00,
    });
});

export { portfolioData };
export default router;
