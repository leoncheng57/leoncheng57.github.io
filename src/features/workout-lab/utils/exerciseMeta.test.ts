import { describe, expect, it } from 'vitest'
import { EXERCISES } from '../data/exercises'
import { getExerciseMeta } from './exerciseMeta'

describe('getExerciseMeta', () => {
  it('maps every exercise to equipment and body-part metadata', () => {
    EXERCISES.forEach((exercise) => {
      const meta = getExerciseMeta(exercise, '10 reps')
      expect(meta.equipment.emoji).not.toBe('')
      expect(meta.equipment.label).not.toBe('')
      expect(meta.bodyPart.emoji).not.toBe('')
      expect(meta.bodyPart.label).not.toBe('')
    })
  })

  it('distinguishes repetitions from timed prescriptions', () => {
    const exercise = EXERCISES[0]
    expect(getExerciseMeta(exercise, '12 reps').measurement).toEqual({
      emoji: '🔁',
      label: 'Repetitions',
    })
    expect(getExerciseMeta(exercise, '40 sec').measurement).toEqual({
      emoji: '⏱️',
      label: 'Timed exercise',
    })
  })
})
