from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
from scipy.optimize import minimize
import os

app = FastAPI(title="Portfolio Optimizer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Asset metadata (replaces asset_metadata.csv)

ASSET_META = {}
_meta_path = os.path.join(os.path.dirname(__file__), '..', 'asset_metadata.csv')
if os.path.exists(_meta_path):
    _meta_df = pd.read_csv(_meta_path)
    for _, row in _meta_df.iterrows():
        ASSET_META[row['Ticker']] = {
            "name": row['Ticker'], 
            "sector": row['Sector'],
            "asset_class": row['Asset_Class'],
            "risk_level": row['Risk_Level']
        }
else:
    print(f"Warning: {_meta_path} not found")


# Simulated price generator (replaces portfolio_prices.csv)
# Deterministic seed so results are reproducible

def generate_prices(tickers: List[str], n_days: int = 756) -> pd.DataFrame:
    try:
        _prices_path = os.path.join(os.path.dirname(__file__), '..', 'portfolio_prices.csv')
        df = pd.read_csv(_prices_path)
        df['Date'] = pd.to_datetime(df['Date'])
        df = df.set_index('Date')
        
        available_tickers = [t for t in tickers if t in df.columns]
        if not available_tickers:
            raise ValueError("No matching tickers in prices data")
        return df[available_tickers].tail(n_days)
    except Exception as e:
        print(f"Warning: Could not load portfolio_prices.csv: {e}")
        raise HTTPException(500, f"Could not load prices data: {e}")


# Core portfolio logic 

def optimize_portfolio(prices_df: pd.DataFrame, selected_assets: List[str], risk_aversion: float = 1):
    price_pivot = prices_df[selected_assets]
    returns = price_pivot.pct_change().dropna()
    mu  = returns.mean() * 252
    cov = returns.cov()  * 252
    n   = len(selected_assets)

    def objective(w):
        return -(w @ mu.values - risk_aversion * w @ cov.values @ w)

    result = minimize(
        objective,
        np.ones(n) / n,
        method="SLSQP",
        bounds=[(0, 1)] * n,
        constraints={"type": "eq", "fun": lambda w: np.sum(w) - 1},
    )
    weights = result.x
    port_return = float(weights @ mu.values)
    port_vol    = float(np.sqrt(weights @ cov.values @ weights))
    sharpe      = port_return / port_vol if port_vol else 0

    allocation = pd.DataFrame({"Asset": selected_assets, "Weight": weights}).sort_values("Weight", ascending=False)
    return allocation, port_return, port_vol, sharpe, mu, cov


def explain_portfolio(allocation: pd.DataFrame, mu: pd.Series, cov: pd.DataFrame) -> List[dict]:
    explanations = []
    for _, row in allocation.iterrows():
        asset   = row["Asset"]
        weight  = float(row["Weight"])
        meta    = ASSET_META.get(asset, {})
        sector     = meta.get("sector", "Unknown")
        risk_level = meta.get("risk_level", "Unknown")
        asset_class= meta.get("asset_class", "Unknown")
        ret     = float(mu[asset])
        variance= float(cov.loc[asset, asset])

        if weight > 0.25:
            reason = f"High allocation — strong {sector} sector returns with {risk_level.lower()} risk profile"
        elif weight > 0.10:
            reason = f"Moderate allocation for diversification within {asset_class}"
        else:
            reason = f"Small position — comparatively weaker risk-adjusted return or higher volatility"

        explanations.append({
            "asset":       asset,
            "name":        meta.get("name", asset),
            "weight":      round(weight, 4),
            "weight_pct":  round(weight * 100, 2),
            "sector":      sector,
            "risk_level":  risk_level,
            "asset_class": asset_class,
            "annual_return": round(ret * 100, 2),
            "annual_vol":    round(np.sqrt(variance) * 100, 2),
            "reason":      reason,
        })
    return explanations




class OptimizeRequest(BaseModel):
    assets: List[str]
    risk_aversion: float = 1.0   


class OptimizeResponse(BaseModel):
    portfolio_return: float
    portfolio_volatility: float
    sharpe_ratio: float
    allocations: List[dict]
    efficient_frontier: List[dict]



# Routes

@app.get("/")
def root():
    return {"message": "Portfolio Optimizer API is running 🚀"}


@app.get("/assets")
def get_assets():
    return [{"ticker": k, **v} for k, v in ASSET_META.items()]


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(req: OptimizeRequest):
    if len(req.assets) < 2:
        raise HTTPException(400, "Select at least 2 assets")
    unknown = [a for a in req.assets if a not in ASSET_META]
    if unknown:
        raise HTTPException(400, f"Unknown tickers: {unknown}")

    prices = generate_prices(req.assets)
    allocation, ret, vol, sharpe, mu, cov = optimize_portfolio(prices, req.assets, req.risk_aversion)
    allocations = explain_portfolio(allocation, mu, cov)

    # Efficient frontier: sweep risk_aversion 0.2 → 8
    frontier = []
    for ra in np.linspace(0.2, 8, 20):
        _, r, v, s, _, _ = optimize_portfolio(prices, req.assets, ra)
        frontier.append({"return": round(r * 100, 2), "volatility": round(v * 100, 2), "sharpe": round(s, 3)})

    return OptimizeResponse(
        portfolio_return=round(ret * 100, 2),
        portfolio_volatility=round(vol * 100, 2),
        sharpe_ratio=round(sharpe, 3),
        allocations=allocations,
        efficient_frontier=frontier,
    )
