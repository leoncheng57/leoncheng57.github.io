import { useEffect, useRef, useState, type ReactElement } from 'react'
import ExerciseModal from '../components/ExerciseModal'
import type { ExerciseDetail } from '../data/exercise-details'
import type { ExerciseVideo } from '../data/exercise-videos'
import type { Exercise } from '../types'

interface ExerciseModalController {
  openExercise: (_exercise: Exercise, _trigger: HTMLButtonElement) => void
  modal: ReactElement | null
}

/**
 * Shared controller for the exercise detail modal. Lazily loads the authored
 * detail and video chunks on first open and restores focus to the trigger.
 */
export default function useExerciseModal(): ExerciseModalController {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [exerciseDetail, setExerciseDetail] = useState<
    ExerciseDetail | null | undefined
  >(undefined)
  const [exerciseVideo, setExerciseVideo] = useState<ExerciseVideo | undefined>(
    undefined
  )
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!selectedExercise) {
      setExerciseDetail(undefined)
      return undefined
    }

    let cancelled = false
    setExerciseDetail(undefined)
    setExerciseVideo(undefined)
    void Promise.all([
      import('../data/exercise-details'),
      import('../data/exercise-videos'),
    ]).then(([{ EXERCISE_DETAILS }, { getExerciseVideo }]) => {
      if (!cancelled) {
        setExerciseDetail(EXERCISE_DETAILS[selectedExercise.id] ?? null)
        setExerciseVideo(getExerciseVideo(selectedExercise.id))
      }
    })

    return () => {
      cancelled = true
    }
  }, [selectedExercise])

  const openExercise = (
    exercise: Exercise,
    trigger: HTMLButtonElement
  ): void => {
    modalTriggerRef.current = trigger
    setSelectedExercise(exercise)
  }

  const modal = selectedExercise ? (
    <ExerciseModal
      exercise={selectedExercise}
      detail={exerciseDetail}
      video={exerciseVideo}
      returnFocusTo={modalTriggerRef.current}
      onClose={() => setSelectedExercise(null)}
    />
  ) : null

  return { openExercise, modal }
}
