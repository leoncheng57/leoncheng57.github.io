import type { ReactElement } from 'react'
import type { ArticleStyles } from './types'

interface FontSizeControlsProps {
  onDecrease: () => void
  onReset: () => void
  onIncrease: () => void
  styles: ArticleStyles
}

export default function FontSizeControls({
  onDecrease,
  onReset,
  onIncrease,
  styles,
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
