import { useEffect, useState, type ReactElement } from 'react'
import type { ExerciseDetail } from '../data/exercise-details'
import { EXERCISES } from '../data/exercises'
import ExerciseIllustration from './ExerciseIllustration'
import styles from '../workout-lab.module.css'

export const SHOWCASE_EXERCISE_ID = 'goblet-squat'

/**
 * Inline, always-open replica of the exercise detail modal. Shown on the
 * landing page so visitors can see the coaching content — illustration, form
 * cue, steps, and warnings — before they build a session. The authored detail
 * loads from the same lazy chunk the modal uses.
 */
export default function ExerciseShowcase(): ReactElement | null {
  const exercise = EXERCISES.find((entry) => entry.id === SHOWCASE_EXERCISE_ID)
  const [detail, setDetail] = useState<ExerciseDetail | null>(null)

  useEffect(() => {
    let cancelled = false
    void import('../data/exercise-details').then(({ EXERCISE_DETAILS }) => {
      if (!cancelled) setDetail(EXERCISE_DETAILS[SHOWCASE_EXERCISE_ID] ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!exercise) return null

  return (
    <article
      className={styles.showcaseCard}
      aria-label={`Sample exercise card: ${exercise.name}`}
    >
      <header className={styles.modalHeader}>
        <p className={styles.modalKicker}>
          {exercise.movementPattern} movement · sample card
        </p>
        <h3 className={styles.modalTitle}>{exercise.name}</h3>
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
          <section className={styles.modalSection} aria-label="Key form cue">
            <h4>Key form cue</h4>
            <p>{exercise.formCue}</p>
          </section>

          {detail ? (
            <>
              <p className={styles.exerciseDescription}>{detail.description}</p>
              <section className={styles.modalSection} aria-label="How to do it">
                <h4>How to do it</h4>
                <ol className={styles.stepList}>
                  {detail.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>
              <section className={styles.warningPanel} aria-label="Warnings">
                <h4>Warnings</h4>
                <ul>
                  {detail.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <p className={styles.detailStatus} role="status">
              Loading exercise details…
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
