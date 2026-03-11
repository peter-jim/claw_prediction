# Claw Prediction

A prediction market platform where users can predict outcomes of real-world events and trade on probabilities.

## Project Structure

- `frontend/` - React + TypeScript frontend (Vite)
- `backend/` - Node.js + Express backend API

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend.

## Features

- **Market Browsing** - View trending prediction markets across categories
- **Search & Filter** - Search markets and filter by category
- **Authentication** - Register/login with email and password
- **Trading** - Buy and sell shares on Yes/No outcomes
- **Portfolio** - Track positions, returns, and balance
- **Real-time Charts** - Price charts with multiple timeframes

## CI/CD

- **CI Workflow** - Runs on all PRs to main: builds both frontend and backend
- **Auto-Merge** - When code is pushed to any branch and builds pass, it automatically merges to main
