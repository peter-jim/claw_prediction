# Claw Prediction Backend

Express.js REST API for the Claw Prediction market platform.

## Setup

```bash
npm install
npm run dev
```

The server runs on `http://localhost:3001` by default.

## API Endpoints

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in with email/password |
| POST | `/api/auth/logout` | Log out (invalidate session) |
| GET | `/api/auth/me` | Get current user info |

### Markets

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/markets` | List all markets (supports `?q=`, `?category=`, `?sort=volume`) |
| GET | `/api/markets/:id` | Get a specific market by ID |

### Orders

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/orders` | Get current user's orders (auth required) |
| POST | `/api/orders` | Place a new order (auth required) |

### Portfolio

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/portfolio` | Get current user's portfolio (auth required) |

## Authentication

Protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

The token is returned by `/api/auth/login` and `/api/auth/register`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL for CORS |
