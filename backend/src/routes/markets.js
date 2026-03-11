import { Router } from 'express';
import { MARKETS } from '../data.js';

const router = Router();

// GET /api/markets
router.get('/', (req, res) => {
    const { category, q, sort } = req.query;

    let markets = [...MARKETS];

    if (q) {
        const query = String(q).toLowerCase();
        markets = markets.filter(
            m => m.title.toLowerCase().includes(query) || m.category.toLowerCase().includes(query)
        );
    }

    if (category) {
        markets = markets.filter(m => m.category.toLowerCase() === String(category).toLowerCase());
    }

    if (sort === 'volume') {
        markets.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));
    }

    res.json({ markets, total: markets.length });
});

// GET /api/markets/:id
router.get('/:id', (req, res) => {
    const market = MARKETS.find(m => m.id === req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });
    res.json({ market });
});

export default router;
