# Claw Prediction Backend

Node.js + Express + TypeScript backend for a Polymarket-like prediction market.

## Tech Stack
- **Runtime:** Node.js + Express.js
- **Language:** TypeScript
- **ORM:** Prisma with SQLite
- **Auth:** JWT + bcrypt
- **Smart Contracts:** Hardhat + ethers.js (Solidity on Polygon)
- **Validation:** Zod

## Quick Start

### Prerequisites
- Node.js 18+

### Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — Get current user profile (auth required)

### Markets
- `GET /api/markets` — List markets (query: category, status, search, limit, offset)
- `GET /api/markets/:id` — Get market detail with chart data
- `GET /api/markets/:id/orderbook` — Get order book
- `POST /api/markets` — Create market (auth required)

### Orders
- `POST /api/orders` — Place order (auth required)
- `GET /api/orders` — Get user orders (auth required)

### Portfolio
- `GET /api/portfolio` — Get user portfolio with positions and P&L (auth required)

### Health
- `GET /api/health` — Health check

## Smart Contracts

Contracts are in `contracts/`. Uses Hardhat for compilation and testing.

```bash
# Compile contracts
npm run contract:compile

# Run tests
npm run contract:test

# Start local node
npm run contract:node

# Deploy to local network
npm run contract:deploy:local

# Deploy to Polygon Amoy testnet
npm run contract:deploy:amoy
```

## Environment Variables

See `.env.example` for all required variables.
