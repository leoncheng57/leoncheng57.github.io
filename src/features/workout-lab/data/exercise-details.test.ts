import { describe, expect, it } from 'vitest'
import { EXERCISES } from './exercises'
import { EXERCISE_DETAILS } from './exercise-details'

describe('exercise details', () => {
  it('provides complete pilot content for every squat exercise', () => {
    const squatExercises = EXERCISES.filter(
      (exercise) => exercise.movementPattern === 'squat'
    )

    expect(squatExercises).toHaveLength(9)
    expect(Object.keys(EXERCISE_DETAILS).sort()).toEqual(
      squatExercises.map((exercise) => exercise.id).sort()
    )

    squatExercises.forEach((exercise) => {
      const detail = EXERCISE_DETAILS[exercise.id]
      expect(detail?.description.length).toBeGreaterThan(100)
      expect(detail?.steps.length).toBeGreaterThanOrEqual(4)
      expect(detail?.warnings.length).toBeGreaterThanOrEqual(2)
      expect(detail?.steps.every(Boolean)).toBe(true)
      expect(detail?.warnings.every(Boolean)).toBe(true)
    })
  })
})
