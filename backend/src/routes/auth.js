import { Router } from 'express';
import { createHash } from 'crypto';

const router = Router();

// In-memory user store (replace with a real DB in production)
const users = new Map();
const sessions = new Map();

// NOTE: In production, use a proper password hashing library (e.g., bcrypt or argon2).
// This demo uses SHA-256 with a salt to illustrate the pattern; it is not suitable for production.
function hashPassword(password, salt) {
    return createHash('sha256').update(salt + password).digest('hex');
}

function generateToken() {
    return createHash('sha256').update(Math.random().toString() + Date.now().toString()).digest('hex');
}

function generateSalt() {
    return createHash('sha256').update(Math.random().toString()).digest('hex').slice(0, 16);
}

// POST /api/auth/register
router.post('/register', (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (users.has(email)) {
        return res.status(409).json({ error: 'Email already registered' });
    }

    const salt = generateSalt();
    const user = {
        id: `u_${Date.now()}`,
        email,
        name: name || email.split('@')[0],
        balance: 100.00,
        createdAt: new Date().toISOString(),
    };

    users.set(email, { ...user, passwordHash: hashPassword(password, salt), salt });
    const token = generateToken();
    sessions.set(token, user);

    res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const storedUser = users.get(email);
    if (!storedUser || hashPassword(password, storedUser.salt) !== storedUser.passwordHash) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken();
    const { passwordHash: _hash, salt: _salt, ...user } = storedUser;
    sessions.set(token, user);

    res.json({ token, user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) sessions.delete(token);
    res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const user = sessions.get(token);
    if (!user) return res.status(401).json({ error: 'Invalid or expired session' });
    res.json({ user });
});

export { sessions };
export default router;
