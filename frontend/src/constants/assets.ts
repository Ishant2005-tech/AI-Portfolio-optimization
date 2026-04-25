import type { AssetMeta } from '../types/portfolio'

export const ASSETS: AssetMeta[] = [
  { ticker: 'AAPL',    name: 'Apple Inc.',        sector: 'Tech',       asset_class: 'Equity',    risk_level: 'Medium' },
  { ticker: 'MSFT',    name: 'Microsoft Corp.',   sector: 'Tech',       asset_class: 'Equity',    risk_level: 'Medium' },
  { ticker: 'GOOGL',   name: 'Alphabet Inc.',     sector: 'Tech',       asset_class: 'Equity',    risk_level: 'Medium' },
  { ticker: 'AMZN',    name: 'Amazon.com Inc.',   sector: 'Consumer',   asset_class: 'Equity',    risk_level: 'Medium' },
  { ticker: 'TSLA',    name: 'Tesla Inc.',        sector: 'Auto',       asset_class: 'Equity',    risk_level: 'High'   },
  { ticker: 'BTC-USD', name: 'Bitcoin',           sector: 'Currency',   asset_class: 'Crypto',    risk_level: 'Very High' },
  { ticker: 'GLD',     name: 'Gold ETF (SPDR)',   sector: 'Metal',      asset_class: 'Commodity', risk_level: 'Low'    },
  { ticker: 'SPY',     name: 'S&P 500 ETF',       sector: 'Market',     asset_class: 'Index',     risk_level: 'Low'    },
]
