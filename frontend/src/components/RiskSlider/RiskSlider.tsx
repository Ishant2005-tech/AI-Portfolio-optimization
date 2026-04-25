import styles from './RiskSlider.module.css'

interface Props {
  value: number
  onChange: (value: number) => void
}

export default function RiskSlider({ value, onChange }: Props) {
 /* const labels: Record<string, string> = {
    '1': 'Very Conservative',
    '1.5': 'Conservative',
    '2': 'Moderate-Low',
    '2.5': 'Moderate',
    '3': 'Balanced',
    '3.5': 'Moderate-High',
    '4': 'Growth',
    '4.5': 'Aggressive',
    '5': 'Very Aggressive',
  }*/
  const labels: Record<string, string> = {
  '1': 'Very Aggressive',
  '1.5': 'Aggressive',
  '2': 'Growth',
  '2.5': 'Moderate-High',
  '3': 'Balanced',
  '3.5': 'Moderate',
  '4': 'Moderate-Low',
  '4.5': 'Conservative',
  '5': 'Very Conservative',
}

  return (
    <div className={`${styles.wrapper} panel`}>
      <h3 className={styles.title}>Risk Tolerance</h3>
      <div className={styles.valueDisplay}>{value.toFixed(1)}</div>
      <input
        id="risk-slider"
        type="range"
        min={1}
        max={5}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={styles.slider}
      />
      <div className={styles.labels}>
        <span>Aggresive</span>
        <span>Conservatives</span>
      </div>
      <div className={styles.riskLabel}>
        {labels[value.toString()] ?? 'Balanced'}
      </div>
    </div>
  )
}
