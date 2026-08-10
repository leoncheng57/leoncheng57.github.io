import { useEffect, useState, type ReactElement } from 'react'
import type { ExerciseDetail } from '../data/exercise-details'
import type { ExerciseVideo } from '../data/exercise-videos'
import { EXERCISES } from '../data/exercises'
import ExerciseIllustration from './ExerciseIllustration'
import styles from '../workout-lab.module.css'

export const SHOWCASE_EXERCISE_ID = 'goblet-squat'

/**
 * Inline, always-open replica of the exercise detail modal. Shown on the
 * landing page so visitors can see the coaching content — illustration, form
 * cue, steps, warnings, and the hand-picked video links — before they build a
 * session. The authored detail and video data load from the same lazy chunks
 * the modal uses.
 */
export default function ExerciseShowcase(): ReactElement | null {
  const exercise = EXERCISES.find((entry) => entry.id === SHOWCASE_EXERCISE_ID)
  const [detail, setDetail] = useState<ExerciseDetail | null>(null)
  const [video, setVideo] = useState<ExerciseVideo | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    void Promise.all([
      import('../data/exercise-details'),
      import('../data/exercise-videos'),
    ]).then(([{ EXERCISE_DETAILS }, { getExerciseVideo }]) => {
      if (!cancelled) {
        setDetail(EXERCISE_DETAILS[SHOWCASE_EXERCISE_ID] ?? null)
        setVideo(getExerciseVideo(SHOWCASE_EXERCISE_ID))
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!exercise) return null

  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `how to do ${exercise.name}`
  )}`

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

          <section
            className={styles.videoPanel}
            aria-label="Watch a demonstration"
          >
            <h4>See it done</h4>
            <p>
              Every exercise links to a hand-picked YouTube Short, so you can
              check the movement in seconds — mid-workout, no searching.
            </p>
            <div className={styles.externalLinks}>
              {video ? (
                <span className={styles.videoAction}>
                  <a
                    className={styles.videoButton}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className={styles.videoButtonIcon}
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M4 2.5v11l9-5.5z" />
                    </svg>
                    {video.type === 'short'
                      ? 'Watch YouTube Short'
                      : 'Find Shorts on YouTube'}
                  </a>
                  {video.type === 'short' ? (
                    <span className={styles.videoChannel}>
                      by {video.channel}
                    </span>
                  ) : null}
                </span>
              ) : null}
              <a
                className={styles.googleLink}
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Search Google for a demonstration
              </a>
            </div>
          </section>
        </div>
      </div>
    </article>
  )
}
