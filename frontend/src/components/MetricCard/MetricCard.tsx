import { useEffect, useRef, useState } from 'react'
import styles from './MetricCard.module.css'

interface Props {
  label: string
  value: string
  accent: 'green' | 'amber' | 'blue'
}

export default function MetricCard({ label, value, accent }: Props) {
  const [display, setDisplay] = useState('0')
  const animRef = useRef<number>(0)

  useEffect(() => {
    const numericStr = value.replace('%', '').replace(',', '')
    const target = parseFloat(numericStr)
    if (isNaN(target)) {
      setDisplay(value)
      return
    }

    const isPercent = value.includes('%')
    const decimals = numericStr.includes('.') ? numericStr.split('.')[1].length : 0
    const duration = 800
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target * eased
      setDisplay(current.toFixed(decimals) + (isPercent ? '%' : ''))
      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick)
      }
    }

    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [value])

  return (
    <div className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{display}</div>
    </div>
  )
}
