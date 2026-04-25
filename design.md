# PortfolioAI — Frontend Design Document

> Vite + React migration guide for the hackathon portfolio optimizer frontend.

---

## 1. Project Overview

**App:** PortfolioAI — an AI-powered portfolio optimizer  
**Stack:** Vite · React 18 · TypeScript · CSS Modules  
**Backend:** FastAPI at `http://localhost:8000`  
**AI:** Claude API (`claude-sonnet-4-20250514`) for plain-English allocation explanations

---

## 2. Vite Project Setup

```bash
# Scaffold
npm create vite@latest portfolio-ai -- --template react-ts
cd portfolio-ai
npm install

# Dependencies
npm install chart.js react-chartjs-2
npm install axios

# Dev
npm run dev        # http://localhost:5173
npm run build      # dist/
npm run preview    # preview production build
```

### `vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

> **Why the proxy?** Avoids CORS issues in dev. All fetch calls use `/api/optimize` instead of `http://localhost:8000/optimize`.

---

## 3. File Structure

```
src/
├── main.tsx                   # React root, mounts <App/>
├── App.tsx                    # Root layout: <Nav/> + <Page/>
├── index.css                  # CSS custom properties (design tokens)
│
├── components/
│   ├── Nav/
│   │   ├── Nav.tsx
│   │   └── Nav.module.css
│   ├── AssetPicker/
│   │   ├── AssetPicker.tsx    # Chip grid — select/deselect tickers
│   │   └── AssetPicker.module.css
│   ├── RiskSlider/
│   │   ├── RiskSlider.tsx     # Range input + label
│   │   └── RiskSlider.module.css
│   ├── MetricCard/
│   │   ├── MetricCard.tsx     # Return / Vol / Sharpe stat boxes
│   │   └── MetricCard.module.css
│   ├── AllocationList/
│   │   ├── AllocationList.tsx # Bar + sector badge per asset
│   │   └── AllocationList.module.css
│   ├── Charts/
│   │   ├── WeightsChart.tsx   # Doughnut chart
│   │   ├── FrontierChart.tsx  # Scatter — efficient frontier
│   │   ├── ReturnsChart.tsx   # Grouped bar — return vs vol
│   │   └── Charts.module.css
│   └── AiExplanation/
│       ├── AiExplanation.tsx  # Claude API explanation panel
│       └── AiExplanation.module.css
│
├── hooks/
│   ├── useOptimize.ts         # POST /api/optimize, manages loading/error state
│   └── useApiStatus.ts        # GET /api/ health check on mount
│
├── types/
│   └── portfolio.ts           # All shared TypeScript interfaces
│
└── constants/
    └── assets.ts              # ASSET_META array (tickers, sectors, risk levels)
```

---

## 4. Design Tokens (`src/index.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600;700&display=swap');

:root {
  /* Brand */
  --green:        #1D9E75;
  --green-light:  #E1F5EE;
  --green-dark:   #0F6E56;

  /* Backgrounds — dark theme */
  --bg:           #0e0e0f;
  --bg2:          #161618;
  --bg3:          #1e1e21;

  /* Borders */
  --border:       rgba(255, 255, 255, 0.08);
  --border2:      rgba(255, 255, 255, 0.14);

  /* Text */
  --text:         #f0f0f0;
  --text2:        #9a9a9a;
  --text3:        #555555;

  /* Semantic */
  --red:          #E24B4A;
  --amber:        #EF9F27;
  --blue:         #378ADD;

  /* Typography */
  --font-display: 'Syne', sans-serif;
  --font-mono:    'DM Mono', monospace;

  /* Spacing scale */
  --space-xs:     4px;
  --space-sm:     8px;
  --space-md:     16px;
  --space-lg:     24px;
  --space-xl:     32px;

  /* Radius */
  --radius-sm:    8px;
  --radius-md:    12px;
  --radius-lg:    16px;
  --radius-pill:  100px;

  /* Transitions */
  --transition:   all 0.15s ease;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-display);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
```

---

## 5. TypeScript Interfaces (`src/types/portfolio.ts`)

```ts
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
```

---

## 6. Data & API Hooks

### `src/hooks/useOptimize.ts`
```ts
import { useState } from 'react'
import axios from 'axios'
import type { OptimizeRequest, OptimizeResponse } from '../types/portfolio'

export function useOptimize() {
  const [data, setData]       = useState<OptimizeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function run(req: OptimizeRequest) {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post<OptimizeResponse>('/api/optimize', req)
      setData(res.data)
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Server error')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, run }
}
```

### `src/hooks/useApiStatus.ts`
```ts
import { useState, useEffect } from 'react'
import axios from 'axios'

export function useApiStatus() {
  const [online, setOnline] = useState(false)

  useEffect(() => {
    axios.get('/api/')
      .then(() => setOnline(true))
      .catch(() => setOnline(false))
  }, [])

  return online
}
```

---

## 7. Constants (`src/constants/assets.ts`)

```ts
import type { AssetMeta } from '../types/portfolio'

export const ASSETS: AssetMeta[] = [
  { ticker: 'AAPL',  name: 'Apple Inc.',        sector: 'Technology',   asset_class: 'Equity',    risk_level: 'Medium' },
  { ticker: 'MSFT',  name: 'Microsoft Corp.',    sector: 'Technology',   asset_class: 'Equity',    risk_level: 'Medium' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.',      sector: 'Technology',   asset_class: 'Equity',    risk_level: 'Medium' },
  { ticker: 'AMZN',  name: 'Amazon.com Inc.',    sector: 'Consumer',     asset_class: 'Equity',    risk_level: 'High'   },
  { ticker: 'TSLA',  name: 'Tesla Inc.',         sector: 'Automotive',   asset_class: 'Equity',    risk_level: 'High'   },
  { ticker: 'JPM',   name: 'JPMorgan Chase',     sector: 'Financials',   asset_class: 'Equity',    risk_level: 'Medium' },
  { ticker: 'JNJ',   name: 'Johnson & Johnson',  sector: 'Healthcare',   asset_class: 'Equity',    risk_level: 'Low'    },
  { ticker: 'GLD',   name: 'Gold ETF (SPDR)',    sector: 'Commodities',  asset_class: 'Commodity', risk_level: 'Low'    },
  { ticker: 'BND',   name: 'Vanguard Bond ETF',  sector: 'Fixed Income', asset_class: 'Bond',      risk_level: 'Low'    },
  { ticker: 'VNQ',   name: 'Vanguard REIT ETF',  sector: 'Real Estate',  asset_class: 'REIT',      risk_level: 'Medium' },
]
```

---

## 8. Component Specs

### 8.1 `<Nav />`
```
Props:  none
State:  useApiStatus() → online: boolean

Layout:
  ┌────────────────────────────────────────────────────┐
  │ Portfolio[AI]          ● API Live    [Hackathon]   │
  └────────────────────────────────────────────────────┘

Styles:
  position: sticky; top: 0; z-index: 100
  height: 60px
  background: var(--bg2)
  border-bottom: 1px solid var(--border)
```

---

### 8.2 `<AssetPicker />`
```
Props:
  selected: Set<string>
  onChange: (selected: Set<string>) => void

Behavior:
  - Min 2 assets must remain selected (block deselect if size === 2)
  - Clicking a selected chip removes it (if size > 2)
  - Clicking unselected chip adds it

Chip states:
  default  → border: var(--border2),  color: var(--text2)
  hover    → border: var(--green),    color: var(--green)
  selected → background: var(--green), color: #fff

Typography:  font-family: var(--font-mono); font-size: 12px
```

---

### 8.3 `<RiskSlider />`
```
Props:
  value: number
  onChange: (value: number) => void

Input:
  type="range" min=1 max=5 step=0.5
  accent-color: var(--green)

Labels row:   "Conservative" ←────────→ "Aggressive"
Value display: centered, 22px, var(--font-mono), color: var(--green)
```

---

### 8.4 `<MetricCard />`
```
Props:
  label: string
  value: string
  accent: 'green' | 'amber' | 'blue'

Usage:
  <MetricCard label="Expected Return"  value="15.4%"  accent="green" />
  <MetricCard label="Volatility"       value="18.2%"  accent="amber" />
  <MetricCard label="Sharpe Ratio"     value="0.846"  accent="blue"  />

Layout: grid of 3, gap: 10px
Card:   background: var(--bg3); border-radius: var(--radius-sm); padding: 14px 16px
Label:  10px, uppercase, letter-spacing: 1px, color: var(--text3)
Value:  24px, font-weight: 600, var(--font-mono), color from accent prop
```

---

### 8.5 `<AllocationList />`
```
Props:
  allocations: Allocation[]   // pre-filtered weight > 0.001

Per item:
  Row 1: [TICKER] [Sector badge] [Risk badge]    [XX.X%]
  Row 2: ████████████░░░░░░░░░░░░  ← animated bar fill

Risk badge colors:
  low    → background: rgba(29,158,117,.15); color: var(--green)
  medium → background: rgba(239,159,39,.15);  color: var(--amber)
  high   → background: rgba(226,75,74,.15);   color: var(--red)

Bar animation:
  CSS transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1)
  Start at 0% on mount, animate to weight_pct on next frame
  (use useEffect + requestAnimationFrame or small setTimeout)
```

---

### 8.6 `<Charts />`
```
Props:
  data: OptimizeResponse
  activeTab: 'weights' | 'frontier' | 'returns'
  onTabChange: (tab: string) => void

Tabs: [Weights] [Efficient Frontier] [Returns vs Risk]

Chart implementations (react-chartjs-2):

  weights   → <Doughnut>  data: allocations weight_pct
  frontier  → <Scatter>   two datasets: frontier points + current portfolio star
  returns   → <Bar>       grouped: annual_return + annual_vol per asset

Chart.js registration (src/main.tsx):
  import {
    Chart, ArcElement, LineElement, BarElement,
    PointElement, LinearScale, CategoryScale,
    Tooltip, Legend, Filler
  } from 'chart.js'
  Chart.register(
    ArcElement, LineElement, BarElement, PointElement,
    LinearScale, CategoryScale, Tooltip, Legend, Filler
  )

Chart colors:
  const PALETTE = ['#1D9E75','#378ADD','#EF9F27','#E24B4A',
                   '#9F77DD','#0F6E56','#185FA5','#BA7517',
                   '#A32D2D','#534AB7']
  
  Grid lines:  color: 'rgba(255,255,255,0.05)'
  Tick color:  '#555'
  Font family: 'DM Mono'
  Legend text: '#9a9a9a'
```

---

### 8.7 `<AiExplanation />`
```
Props:
  allocations: Allocation[]
  portfolioReturn: number
  portfolioVol: number
  sharpeRatio: number

Internal state:
  lines: string[]
  loading: boolean

On mount (when allocations change) → call Claude API:
  POST https://api.anthropic.com/v1/messages
  model: claude-sonnet-4-20250514
  max_tokens: 1000

Prompt template:
  "You are an expert portfolio analyst. Explain each asset's
   allocation in ONE sentence. Return ONLY a JSON array of strings.
   [portfolio data summary here]"

Fallback if API fails:
  Render allocation.reason from backend response

Loading state:
  Spinner (rotating ring) next to "AI Explanation" header

Line layout:
  <TICKER>  →  explanation text
  font-mono ticker, text2 explanation, border-bottom between items
```

---

## 9. App State Flow (`App.tsx`)

```
App
 ├─ state: selected (Set<string>)   ← AssetPicker
 ├─ state: riskAversion (number)    ← RiskSlider
 ├─ hook:  useOptimize()            ← { data, loading, error, run }
 │
 ├─ <Nav />
 ├─ Hero section (static)
 └─ <main className={styles.grid}>
     ├─ LEFT COLUMN
     │   ├─ <AssetPicker selected onChange />
     │   ├─ <RiskSlider value onChange />
     │   ├─ <button onClick={run}>  ← calls useOptimize().run(...)
     │   └─ {data && <AllocationList allocations />}
     │
     └─ RIGHT COLUMN
         ├─ {data && <MetricCard × 3 />}
         ├─ <Charts data activeTab onTabChange />   ← always rendered
         └─ {data && <AiExplanation ... />}
```

---

## 10. Layout & Responsive Grid

```css
/* Desktop: sidebar + main */
.grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1.5rem;
  align-items: start;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Tablet / mobile: single column */
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 11. Animation Approach

| Element | Animation | Implementation |
|---|---|---|
| Page load | Staggered fade-up per panel | CSS `@keyframes fadeUp` + `animation-delay` |
| Allocation bars | Width 0 → weight_pct | CSS `transition: width .7s cubic-bezier(.4,0,.2,1)` |
| Metric values | Count-up on appear | `useEffect` + `requestAnimationFrame` |
| AI spinner | Rotating ring | CSS `@keyframes spin` |
| Chip hover | Border + color shift | CSS `transition: all .15s` |
| Button press | Slight darken | CSS `:active { opacity: .85 }` |

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.panel {
  animation: fadeUp 0.4s ease both;
}
.panel:nth-child(2) { animation-delay: 0.08s; }
.panel:nth-child(3) { animation-delay: 0.16s; }
```

---

## 12. Environment Variables

Create `.env.local` in project root:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

Usage in code:
```ts
const API   = import.meta.env.VITE_API_BASE_URL
const AIKEY = import.meta.env.VITE_ANTHROPIC_API_KEY
```

> **Security note:** The Anthropic key is exposed in the browser bundle — fine for a hackathon demo. For production, proxy the Claude API call through your FastAPI backend instead.

---

## 13. Production Build

```bash
npm run build
# Output: dist/

# Preview locally
npm run preview
```

To serve the built frontend alongside FastAPI, add to `backend/main.py`:

```python
from fastapi.staticfiles import StaticFiles

# After all route definitions:
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")
```

Then a single `uvicorn main:app` serves everything on port 8000.

---

## 14. Hackathon Checklist

- [ ] `npm create vite@latest` — scaffold project
- [ ] Copy design tokens from section 4 into `src/index.css`
- [ ] Copy TypeScript interfaces from section 5 into `src/types/portfolio.ts`
- [ ] Copy asset constants from section 7 into `src/constants/assets.ts`
- [ ] Build components in order: Nav → AssetPicker → RiskSlider → MetricCard → AllocationList → Charts → AiExplanation
- [ ] Wire hooks in App.tsx per section 9
- [ ] Add `.env.local` with API keys
- [ ] Test `/api/optimize` round-trip
- [ ] Test AI explanation panel
- [ ] `npm run build` — verify production bundle
- [ ] (Optional) Mount `dist/` in FastAPI for single-port demo
