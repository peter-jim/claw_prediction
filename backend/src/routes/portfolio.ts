import { Router, RequestHandler } from 'express';
import { getPortfolio } from '../controllers/portfolioController';
import { authenticateToken } from '../middleware/auth';

export const portfolioRoutes = Router();
portfolioRoutes.get('/', authenticateToken, getPortfolio as RequestHandler);
