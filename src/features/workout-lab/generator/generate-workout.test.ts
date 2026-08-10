import { describe, expect, it } from 'vitest'
import { generateWorkout } from './generateWorkout'
import type {
  DurationMinutes,
  EquipmentChoice,
  ExerciseEquipment,
  Focus,
  Goal,
  Level,
  MovementPattern,
  WorkoutPreferences,
} from '../types'

const GOALS: Goal[] = ['strength', 'muscle', 'conditioning', 'general-fitness']
const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']
const DURATIONS: DurationMinutes[] = [15, 20, 30, 45]
const EQUIPMENT: EquipmentChoice[] = [
  'bodyweight',
  'dumbbells',
  'bands',
  'kettlebell',
  'full-gym',
]
const FOCUSES: Focus[] = ['full-body', 'upper', 'lower', 'core']

const GYM_EQUIPMENT: ExerciseEquipment[] = ['barbell', 'cable', 'machine', 'station']

const ALLOWED_EQUIPMENT: Record<EquipmentChoice, ExerciseEquipment[]> = {
  bodyweight: ['bodyweight'],
  dumbbells: ['bodyweight', 'dumbbell'],
  bands: ['bodyweight', 'band'],
  kettlebell: ['bodyweight', 'kettlebell'],
  'full-gym': [
    'bodyweight',
    'dumbbell',
    'band',
    'kettlebell',
    'barbell',
    'cable',
    'machine',
    'station',
    'cardio-machine',
  ],
}

const FOCUS_PATTERNS: Record<Focus, MovementPattern[]> = {
  'full-body': ['squat', 'hinge', 'lunge', 'push', 'pull', 'core'],
  upper: ['push', 'pull'],
  lower: ['squat', 'hinge', 'lunge'],
  core: ['core', 'carry'],
}

const EXPECTED_BLOCKS: Record<DurationMinutes, number> = {
  15: 1,
  20: 2,
  30: 2,
  45: 3,
}

function allPreferenceCombinations(): WorkoutPreferences[] {
  const combos: WorkoutPreferences[] = []
  for (const goal of GOALS) {
    for (const level of LEVELS) {
      for (const duration of DURATIONS) {
        for (const equipment of EQUIPMENT) {
          for (const focus of FOCUSES) {
            combos.push({ goal, level, duration, equipment, focus })
          }
        }
      }
    }
  }
  return combos
}

describe('generateWorkout', () => {
  const combos = allPreferenceCombinations()

  it('covers every input combination', () => {
    expect(combos).toHaveLength(4 * 3 * 4 * 5 * 4)
  })

  it('produces a complete, valid workout for every combination', () => {
    for (const preferences of combos) {
      const workout = generateWorkout(preferences)

      expect(workout.blocks, JSON.stringify(preferences)).toHaveLength(
        EXPECTED_BLOCKS[preferences.duration]
      )
      expect(workout.warmup.exercises.length).toBeGreaterThanOrEqual(3)
      expect(workout.cooldown.exercises.length).toBeGreaterThanOrEqual(2)

      for (const block of workout.blocks) {
        expect(block.exercises).toHaveLength(3)
        expect(block.rounds).toBeGreaterThanOrEqual(2)
        expect(block.restSeconds).toBeGreaterThanOrEqual(30)

        const idsInBlock = block.exercises.map(({ exercise }) => exercise.id)
        expect(new Set(idsInBlock).size, JSON.stringify(preferences)).toBe(
          idsInBlock.length
        )

        for (const { exercise, prescription } of block.exercises) {
          expect(prescription).not.toBe('')
          expect(
            ALLOWED_EQUIPMENT[preferences.equipment],
            `${exercise.id} for ${JSON.stringify(preferences)}`
          ).toContain(exercise.equipment)
          expect(exercise.levels).toContain(preferences.level)
          expect(FOCUS_PATTERNS[preferences.focus]).toContain(
            exercise.movementPattern
          )
        }
      }
    }
  })

  it('is deterministic: identical inputs and variant produce identical workouts', () => {
    for (const preferences of combos) {
      const first = generateWorkout(preferences, 0)
      const second = generateWorkout(preferences, 0)
      expect(second).toEqual(first)

      const variantFirst = generateWorkout(preferences, 3)
      const variantSecond = generateWorkout(preferences, 3)
      expect(variantSecond).toEqual(variantFirst)
    }
  })

  it('produces a different workout for a different variant with the same inputs', () => {
    const preferences: WorkoutPreferences = {
      goal: 'strength',
      level: 'intermediate',
      duration: 30,
      equipment: 'dumbbells',
      focus: 'full-body',
    }

    const exerciseIds = (variant: number): string[] =>
      generateWorkout(preferences, variant).blocks.flatMap((block) =>
        block.exercises.map(({ exercise }) => exercise.id)
      )

    expect(exerciseIds(1)).not.toEqual(exerciseIds(0))
  })

  it('scales rest with the goal', () => {
    const base: Omit<WorkoutPreferences, 'goal'> = {
      level: 'intermediate',
      duration: 30,
      equipment: 'dumbbells',
      focus: 'full-body',
    }

    const restFor = (goal: Goal): number =>
      generateWorkout({ ...base, goal }).blocks[0].restSeconds

    expect(restFor('strength')).toBeGreaterThan(restFor('muscle'))
    expect(restFor('muscle')).toBeGreaterThan(restFor('conditioning'))
  })

  it('keeps warm-up and cooldown exercises within the allowed equipment', () => {
    for (const preferences of combos) {
      const workout = generateWorkout(preferences)
      const segmentExercises = [
        ...workout.warmup.exercises,
        ...workout.cooldown.exercises,
      ]
      for (const { exercise } of segmentExercises) {
        expect(
          ALLOWED_EQUIPMENT[preferences.equipment],
          `${exercise.id} for ${JSON.stringify(preferences)}`
        ).toContain(exercise.equipment)
      }
    }
  })

  it('includes gym-specific equipment in every full-gym workout', () => {
    for (const preferences of combos) {
      if (preferences.equipment !== 'full-gym') continue

      const equipmentUsed = generateWorkout(preferences).blocks.flatMap((block) =>
        block.exercises.map(({ exercise }) => exercise.equipment)
      )
      expect(
        equipmentUsed.some((equipment) => GYM_EQUIPMENT.includes(equipment)),
        JSON.stringify(preferences)
      ).toBe(true)
    }
  })

  it('never uses gym-only equipment for other equipment choices', () => {
    for (const preferences of combos) {
      if (preferences.equipment === 'full-gym') continue

      const workout = generateWorkout(preferences)
      const exercises = [
        ...workout.warmup.exercises,
        ...workout.blocks.flatMap((block) => block.exercises),
        ...workout.cooldown.exercises,
      ]
      for (const { exercise } of exercises) {
        expect([...GYM_EQUIPMENT, 'cardio-machine']).not.toContain(
          exercise.equipment
        )
      }
    }
  })

  it('prescribes per-side work for unilateral exercises', () => {
    for (const preferences of combos) {
      const workout = generateWorkout(preferences)
      for (const block of workout.blocks) {
        for (const { exercise, prescription } of block.exercises) {
          if (exercise.unilateral && !prescription.endsWith('sec')) {
            expect(prescription).toMatch(/\/side$/)
          }
        }
      }
    }
  })
})
