import { Router, RequestHandler } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

export const authRoutes = Router();
authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/profile', authenticateToken, getProfile as RequestHandler);
