# PortfolioAI — Hackathon Demo

AI-powered portfolio optimizer using Markowitz mean-variance model + Claude AI explanations.

---

## Project Structure

```
portfolio_app/
├── README.md
│
├── backend/
│   ├── main.py              ← FastAPI server (portfolio optimizer)
│   └── requirements.txt
│
└── frontend/                ← Vite + React + TypeScript app
    ├── vite.config.ts       ← proxies /api → localhost:8000
    ├── .env.local           ← VITE_ANTHROPIC_API_KEY (create manually)
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── index.css        ← design tokens
    │   ├── types/           ← TypeScript interfaces
    │   ├── constants/       ← asset metadata
    │   ├── hooks/           ← useOptimize, useApiStatus
    │   └── components/      ← Nav, AssetPicker, Charts, AiExplanation …
    └── design.md            ← full component & design specification
```

---

## Quick Start (2 terminals)

### Terminal 1 — Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
API docs: http://localhost:8000/docs

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```
App: http://localhost:5173

### First-time Vite setup
If `frontend/src/` doesn't exist yet, use `PROMPT.md` to scaffold it:
```bash
# Paste the contents of PROMPT.md into Claude, Cursor, or your AI coding tool
# It will generate every file in the correct structure
```

---

## API Endpoints

| Method | Endpoint   | Description                     |
|--------|------------|---------------------------------|
| GET    | /          | Health check                    |
| GET    | /assets    | List all available assets       |
| POST   | /optimize  | Run portfolio optimization      |

### POST /optimize — Example Request
```json
{
  "assets": ["AAPL", "MSFT", "GOOGL"],
  "risk_aversion": 2.0
}
```

### POST /optimize — Example Response
```json
{
  "portfolio_return": 15.4,
  "portfolio_volatility": 18.2,
  "sharpe_ratio": 0.846,
  "allocations": [
    {
      "asset": "MSFT",
      "weight": 0.62,
      "weight_pct": 62.0,
      "sector": "Technology",
      "risk_level": "Medium",
      "annual_return": 20.1,
      "annual_vol": 22.4,
      "reason": "High allocation — strong Technology sector returns..."
    }
  ],
  "efficient_frontier": [...]
}
```

---

## How It Works

1. **Data**: Simulated 3-year price history using geometric Brownian motion (calibrated to real-world parameters)
2. **Optimization**: Scipy `minimize` with SLSQP solver — maximizes `w·μ - λ·w·Σ·w` (mean-variance objective)
3. **Efficient Frontier**: Sweeps risk_aversion 0.2→8 to trace the full frontier
4. **AI Explanations**: Claude API explains each allocation in plain English

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Python · FastAPI · Scipy · Pandas |
| Frontend  | Vanilla JS · Chart.js             |
| AI        | Claude API (claude-sonnet-4)      |
| Math      | Markowitz Mean-Variance Model     |