import { Router, RequestHandler } from 'express';
import { getMarkets, getMarket, getOrderBook, createMarket } from '../controllers/marketController';
import { authenticateToken } from '../middleware/auth';

export const marketRoutes = Router();
marketRoutes.get('/', getMarkets);
marketRoutes.get('/:id', getMarket);
marketRoutes.get('/:id/orderbook', getOrderBook);
marketRoutes.post('/', authenticateToken, createMarket as RequestHandler);
