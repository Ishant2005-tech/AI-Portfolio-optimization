export interface AssetMeta {
  ticker: string;
  name: string;
  sector: string;
  asset_class: string;
  risk_level: 'Low' | 'Medium' | 'High';
}

export interface Allocation {
  asset: string;
  name: string;
  weight: number;
  weight_pct: number;
  sector: string;
  risk_level: 'Low' | 'Medium' | 'High';
  asset_class: string;
  annual_return: number;
  annual_vol: number;
  reason: string;
}

export interface FrontierPoint {
  return: number;
  volatility: number;
  sharpe: number;
}

export interface OptimizeResponse {
  portfolio_return: number;
  portfolio_volatility: number;
  sharpe_ratio: number;
  allocations: Allocation[];
  efficient_frontier: FrontierPoint[];
}

export interface OptimizeRequest {
  assets: string[];
  risk_aversion: number;
}
