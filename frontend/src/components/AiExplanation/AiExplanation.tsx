import { useEffect, useState } from 'react'
import type { Allocation } from '../../types/portfolio'
import styles from './AiExplanation.module.css'

interface Props {
  allocations: Allocation[]
  portfolioReturn: number
  portfolioVol: number
  sharpeRatio: number
}

export default function AiExplanation({
  allocations,
  portfolioReturn,
  portfolioVol,
  sharpeRatio,
}: Props) {
  const [lines, setLines] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey || allocations.length === 0) {
      // Fallback: use backend reasons
      setLines(allocations.map((a) => `${a.asset}: ${a.reason}`))
      return
    }

    setLoading(true)

    const summary = allocations
      .filter((a) => a.weight > 0.001)
      .map(
        (a) =>
          `${a.asset} (${a.name}): ${a.weight_pct.toFixed(1)}% — ${a.sector}, ${a.risk_level} risk, return ${a.annual_return}%, vol ${a.annual_vol}%`
      )
      .join('\n')

    const prompt = `You are an expert portfolio analyst. The optimized portfolio has expected return ${portfolioReturn}%, volatility ${portfolioVol}%, and Sharpe ratio ${sharpeRatio}. Here are the allocations:\n${summary}\n\nExplain each asset's allocation in ONE sentence. Return ONLY a JSON array of strings (one per asset, in the same order). No markdown, no code fences.`

    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        // remove markdown code blocks if gemini returns them despite prompt
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
        try {
          const parsed = JSON.parse(cleanText) as string[]
          setLines(
            allocations
              .filter((a) => a.weight > 0.001)
              .map((a, i) => `${a.asset}: ${parsed[i] ?? a.reason}`)
          )
        } catch {
          // Fallback to backend reasons
          setLines(allocations.map((a) => `${a.asset}: ${a.reason}`))
        }
      })
      .catch(() => {
        setLines(allocations.map((a) => `${a.asset}: ${a.reason}`))
      })
      .finally(() => setLoading(false))
  }, [allocations, portfolioReturn, portfolioVol, sharpeRatio])

  return (
    <div className={`${styles.wrapper} panel`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.sparkle}>✦</span>
          <h3 className={styles.title}>AI Explanation</h3>
        </div>
        {loading && <div className={styles.spinner} />}
      </div>
      <div className={styles.list}>
        {lines.map((line, i) => {
          const colonIdx = line.indexOf(':')
          const ticker = colonIdx > 0 ? line.slice(0, colonIdx) : ''
          const explanation = colonIdx > 0 ? line.slice(colonIdx + 1).trim() : line
          return (
            <div key={i} className={styles.item}>
              <span className={styles.ticker}>{ticker}</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.explanation}>{explanation}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
