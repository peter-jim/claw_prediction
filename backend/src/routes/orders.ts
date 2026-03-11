import { Router, RequestHandler } from 'express';
import { placeOrder, getOrders } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

export const orderRoutes = Router();
orderRoutes.post('/', authenticateToken, placeOrder as RequestHandler);
orderRoutes.get('/', authenticateToken, getOrders as RequestHandler);
