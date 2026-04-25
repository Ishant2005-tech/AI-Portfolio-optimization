import { ASSETS } from '../../constants/assets'
import styles from './AssetPicker.module.css'

interface Props {
  selected: Set<string>
  onChange: (selected: Set<string>) => void
}

export default function AssetPicker({ selected, onChange }: Props) {
  function toggle(ticker: string) {
    const next = new Set(selected)
    if (next.has(ticker)) {
      if (next.size <= 2) return // minimum 2 assets
      next.delete(ticker)
    } else {
      next.add(ticker)
    }
    onChange(next)
  }

  return (
    <div className={`${styles.wrapper} panel`}>
      <h3 className={styles.title}>Select Assets</h3>
      <p className={styles.subtitle}>
        Choose at least 2 assets for optimization
      </p>
      <div className={styles.grid}>
        {ASSETS.map((a) => (
          <button
            key={a.ticker}
            id={`asset-chip-${a.ticker}`}
            className={`${styles.chip} ${selected.has(a.ticker) ? styles.selected : ''}`}
            onClick={() => toggle(a.ticker)}
          >
            <span className={styles.ticker}>{a.ticker}</span>
            <span className={styles.name}>{a.name}</span>
          </button>
        ))}
      </div>
      <div className={styles.count}>
        {selected.size} asset{selected.size !== 1 ? 's' : ''} selected
      </div>
    </div>
  )
}
