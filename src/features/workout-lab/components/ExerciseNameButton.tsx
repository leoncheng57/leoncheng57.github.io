import type { ReactElement } from 'react'
import type { Exercise } from '../types'
import styles from '../workout-lab.module.css'

interface ExerciseNameButtonProps {
  exercise: Exercise
  onOpen: (_exercise: Exercise, _trigger: HTMLButtonElement) => void
}

/**
 * Exercise name that opens the detail modal. A persistent underline and an
 * info glyph make the interaction visible before hover.
 */
export default function ExerciseNameButton({
  exercise,
  onOpen,
}: ExerciseNameButtonProps): ReactElement {
  return (
    <button
      type="button"
      className={styles.exerciseName}
      data-exercise-name={exercise.name}
      aria-label={`${exercise.name} — view details`}
      onClick={(event) => onOpen(exercise, event.currentTarget)}
    >
      {exercise.name}
      <svg
        className={styles.exerciseInfoGlyph}
        data-testid="exercise-info-glyph"
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <circle cx="8" cy="8" r="6.6" />
        <path d="M8 7.4v3.4" strokeLinecap="round" />
        <circle cx="8" cy="5" r="0.4" fill="currentColor" stroke="none" />
      </svg>
    </button>
  )
}
