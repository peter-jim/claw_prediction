import { Router } from 'express';
import { sessions } from './auth.js';
import { MARKETS } from '../data.js';

const router = Router();

// In-memory order store
const orders = new Map(); // userId -> orders[]

function requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const user = sessions.get(token);
    if (!user) return res.status(401).json({ error: 'Invalid or expired session' });
    req.user = user;
    next();
}

// GET /api/orders (user's orders)
router.get('/', requireAuth, (req, res) => {
    const userOrders = orders.get(req.user.id) || [];
    res.json({ orders: userOrders });
});

// POST /api/orders (place an order)
router.post('/', requireAuth, (req, res) => {
    const { marketId, outcome, amount, orderType } = req.body;

    if (!marketId || !outcome || !amount) {
        return res.status(400).json({ error: 'marketId, outcome, and amount are required' });
    }

    if (!['Yes', 'No'].includes(outcome)) {
        return res.status(400).json({ error: 'outcome must be "Yes" or "No"' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const market = MARKETS.find(m => m.id === marketId);
    if (!market) return res.status(404).json({ error: 'Market not found' });

    const price = outcome === 'Yes' ? market.yesPrice : market.noPrice;
    const shares = parsedAmount / (price / 100);

    const order = {
        id: `o_${Date.now()}`,
        userId: req.user.id,
        marketId,
        marketTitle: market.title,
        outcome,
        amount: parsedAmount,
        price,
        shares: parseFloat(shares.toFixed(2)),
        orderType: orderType || 'market',
        status: 'filled',
        createdAt: new Date().toISOString(),
    };

    const userOrders = orders.get(req.user.id) || [];
    userOrders.unshift(order);
    orders.set(req.user.id, userOrders);

    res.status(201).json({ order });
});

export default router;
