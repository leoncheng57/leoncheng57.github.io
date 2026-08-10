import { useEffect, useRef, type ReactElement } from 'react'
import type { ExerciseDetail } from '../data/exercise-details'
import type { Exercise } from '../types'
import ExerciseIllustration from './ExerciseIllustration'
import styles from '../workout-lab.module.css'

interface ExerciseModalProps {
  exercise: Exercise
  detail: ExerciseDetail | null | undefined
  onClose: () => void
  returnFocusTo: HTMLElement | null
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function ExerciseModal({
  exercise,
  detail,
  onClose,
  returnFocusTo,
}: ExerciseModalProps): ReactElement {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const titleId = `exercise-title-${exercise.id}`
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `how to do ${exercise.name}`
  )}`

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
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

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      returnFocusTo?.focus()
    }
  }, [returnFocusTo])

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.modalHeader}>
          <p className={styles.modalKicker}>{exercise.movementPattern} movement</p>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label={`Close ${exercise.name} details`}
          >
            Close
          </button>
          <h2 id={titleId} className={styles.modalTitle}>
            {exercise.name}
          </h2>
        </header>

        <div className={styles.modalBody}>
          <figure className={styles.illustrationPanel}>
            <ExerciseIllustration
              pattern={exercise.movementPattern}
              className={styles.exerciseIllustration}
            />
            <figcaption>{exercise.movementPattern} pattern</figcaption>
          </figure>

          <div className={styles.modalContent}>
            <section className={styles.modalSection} aria-labelledby={`${titleId}-cue`}>
              <h3 id={`${titleId}-cue`}>Key form cue</h3>
              <p>{exercise.formCue}</p>
            </section>

            {detail === undefined ? (
              <p className={styles.detailStatus} role="status">
                Loading exercise details…
              </p>
            ) : detail ? (
              <>
                <p className={styles.exerciseDescription}>{detail.description}</p>
                <section
                  className={styles.modalSection}
                  aria-labelledby={`${titleId}-steps`}
                >
                  <h3 id={`${titleId}-steps`}>How to do it</h3>
                  <ol className={styles.stepList}>
                    {detail.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </section>
                <section
                  className={styles.warningPanel}
                  aria-labelledby={`${titleId}-warnings`}
                >
                  <h3 id={`${titleId}-warnings`}>Warnings</h3>
                  <ul>
                    {detail.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <p className={styles.detailStatus}>
                Detailed steps for this movement are coming soon. Use the form cue
                above and the external guide below in the meantime.
              </p>
            )}

            <a
              className={styles.googleLink}
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Search Google for a demonstration
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
