import { useApiStatus } from '../../hooks/useApiStatus'
import styles from './Nav.module.css'

export default function Nav() {
  const online = useApiStatus()

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          Portfolio<span className={styles.bracket}>[</span>
          <span className={styles.ai}>AI</span>
          <span className={styles.bracket}>]</span>
        </div>

        <div className={styles.right}>
          <div className={styles.status}>
            <span
              className={`${styles.dot} ${online ? styles.online : styles.offline}`}
            />
            <span className={styles.statusText}>
              {online ? 'API Live' : 'API Offline'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
