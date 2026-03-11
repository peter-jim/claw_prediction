import { Router } from 'express';
import { db } from '../db.js';
import { generateToken, authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  if (db.findUserByEmail(email)) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const user = db.createUser(email, password);
  const token = generateToken(user.id);
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, balance: user.balance },
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.findUserByEmail(email);
  if (!user || !db.verifyPassword(user, password)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, balance: user.balance },
  });
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  const user = db.findUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ id: user.id, email: user.email, balance: user.balance });
});

export default router;
