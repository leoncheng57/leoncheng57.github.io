import { useEffect, useId, useRef, useState, type ReactElement } from 'react'
import styles from '../weather.module.css'

export type ChartScrubberTipProps = {
  period: 'hour' | 'day'
}

export default function ChartScrubberTip({
  period,
}: ChartScrubberTipProps): ReactElement {
  const [open, setOpen] = useState(false)
  const headingId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])'),
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.onboardingButton}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Chart drag
      </button>
      {open ? (
        <div
          className={styles.chartTipBackdrop}
          data-testid="chart-tip-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <div
            ref={dialogRef}
            className={styles.chartTipDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
          >
            <header className={styles.chartTipDialogHeader}>
              <h2 id={headingId}>How to read charts</h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chart instructions"
              >
                Close
              </button>
            </header>
            <p>
              Drag the vertical line across a chart to inspect each {period}. You
              can also focus the chart and use the arrow keys.
            </p>
            <footer>
              <button type="button" onClick={() => setOpen(false)}>
                Got it
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  )
}
