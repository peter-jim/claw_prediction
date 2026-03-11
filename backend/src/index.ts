import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import marketsRouter from './routes/markets.js';
import portfolioRouter from './routes/portfolio.js';
import { CONTRACT_ADDRESS, startIndexer } from './contract.js';
import { getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests' },
});
app.use('/api/', apiLimiter);

// Routes
app.use('/api/markets', marketsRouter);
app.use('/api/portfolio', portfolioRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    contractAddress: CONTRACT_ADDRESS,
    mode: 'web3',
  });
});

app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  
  try {
    await getDb(); // Init SQLite connection and schema
    await startIndexer(); // Start listening to contract
  } catch (err) {
    console.error('Failed to start indexer:', err);
  }
});
