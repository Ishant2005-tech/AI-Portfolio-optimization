import { useState } from 'react'
import Nav from './components/Nav/Nav'
import AssetPicker from './components/AssetPicker/AssetPicker'
import RiskSlider from './components/RiskSlider/RiskSlider'
import MetricCard from './components/MetricCard/MetricCard'
import AllocationList from './components/AllocationList/AllocationList'
import WeightsChart from './components/Charts/WeightsChart'
import FrontierChart from './components/Charts/FrontierChart'
import ReturnsChart from './components/Charts/ReturnsChart'
import AiExplanation from './components/AiExplanation/AiExplanation'
import { useOptimize } from './hooks/useOptimize'
import styles from './App.module.css'

type ChartTab = 'weights' | 'frontier' | 'returns'

export default function App() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'SPY'])
  )
  const [riskAversion, setRiskAversion] = useState(2.5)
  const [activeTab, setActiveTab] = useState<ChartTab>('weights')
  const { data, loading, error, run } = useOptimize()

  function handleOptimize() {
    run({ assets: Array.from(selected), risk_aversion: riskAversion })
  }

  return (
    <>
      <Nav />

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>AI-Powered Portfolio Optimization</h1>
        <p className={styles.heroSub}>
          Markowitz mean-variance model with real-time efficient frontier analysis
          and Gemini AI explanations.
        </p>
      </section>

      {/* Main Grid */}
      <main className={styles.grid}>
        {/* LEFT — Sidebar */}
        <div className={styles.sidebar}>
          <AssetPicker selected={selected} onChange={setSelected} />
          <RiskSlider value={riskAversion} onChange={setRiskAversion} />

          <button
            id="optimize-btn"
            className={styles.optimizeBtn}
            onClick={handleOptimize}
            disabled={loading}
          >
            <span className={styles.btnContent}>
              {loading && <span className={styles.btnSpinner} />}
              {loading ? 'Optimizing…' : 'Optimize Portfolio'}
            </span>
          </button>

          {error && <div className={styles.error}>⚠ {error}</div>}

          {data && <AllocationList allocations={data.allocations} />}
        </div>

        {/* RIGHT — Results */}
        <div className={styles.main}>
          {data && (
            <div className={`${styles.metrics} panel`}>
              <MetricCard
                label="Expected Return"
                value={`${data.portfolio_return}%`}
                accent="green"
              />
              <MetricCard
                label="Volatility"
                value={`${data.portfolio_volatility}%`}
                accent="amber"
              />
              <MetricCard
                label="Sharpe Ratio"
                value={`${data.sharpe_ratio}`}
                accent="blue"
              />
            </div>
          )}

          {/* Charts */}
          <div className={`${styles.chartContainer} panel`}>
            <div className={styles.tabs}>
              {(['weights', 'frontier', 'returns'] as ChartTab[]).map((tab) => (
                <button
                  key={tab}
                  id={`chart-tab-${tab}`}
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'weights'
                    ? 'Weights'
                    : tab === 'frontier'
                      ? 'Efficient Frontier'
                      : 'Returns vs Risk'}
                </button>
              ))}
            </div>
            <div className={styles.chartWrap}>
              {!data ? (
                <div className={styles.placeholder}>
                  <div className={styles.placeholderIcon}>📊</div>
                  Select assets and click "Optimize Portfolio" to see charts
                </div>
              ) : activeTab === 'weights' ? (
                <WeightsChart allocations={data.allocations} />
              ) : activeTab === 'frontier' ? (
                <FrontierChart
                  frontier={data.efficient_frontier}
                  currentReturn={data.portfolio_return}
                  currentVol={data.portfolio_volatility}
                />
              ) : (
                <ReturnsChart allocations={data.allocations} />
              )}
            </div>
          </div>

          {data && (
            <AiExplanation
              allocations={data.allocations}
              portfolioReturn={data.portfolio_return}
              portfolioVol={data.portfolio_volatility}
              sharpeRatio={data.sharpe_ratio}
            />
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        PortfolioAI — Hackathon Demo · Markowitz Mean-Variance Optimization · Gemini AI
      </footer>
    </>
  )
}
