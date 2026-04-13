import type { ReactElement } from 'react'
import styles from '../blog.module.css'

interface FontSizeControlsProps {
  onDecrease: () => void
  onReset: () => void
  onIncrease: () => void
}

export default function FontSizeControls({
  onDecrease,
  onReset,
  onIncrease,
}: FontSizeControlsProps): ReactElement {
  return (
    <div className={styles.fontControls} aria-label="Article font size controls">
      <button type="button" onClick={onDecrease} aria-label="Decrease font size">
        A-
      </button>
      <button type="button" onClick={onReset} aria-label="Reset font size">
        A
      </button>
      <button type="button" onClick={onIncrease} aria-label="Increase font size">
        A+
      </button>
    </div>
  )
}
