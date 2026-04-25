import { useEffect, useState } from 'react'
import type { Allocation } from '../../types/portfolio'
import styles from './AllocationList.module.css'

interface Props {
  allocations: Allocation[]
}

const riskColor: Record<string, string> = {
  Low:    'low',
  Medium: 'medium',
  High:   'high',
}

export default function AllocationList({ allocations }: Props) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimated(true))
    })
  }, [allocations])

  const visible = allocations.filter((a) => a.weight > 0.001)

  return (
    <div className={`${styles.wrapper} panel`}>
      <h3 className={styles.title}>Allocation Breakdown</h3>
      <div className={styles.list}>
        {visible.map((a) => (
          <div key={a.asset} className={styles.item}>
            <div className={styles.row1}>
              <span className={styles.ticker}>{a.asset}</span>
              <span className={styles.sectorBadge}>{a.sector}</span>
              <span className={`${styles.riskBadge} ${styles[riskColor[a.risk_level] ?? 'medium']}`}>
                {a.risk_level}
              </span>
              <span className={styles.pct}>{a.weight_pct.toFixed(1)}%</span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: animated ? `${a.weight_pct}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
