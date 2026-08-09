import { EXERCISES } from '../data/exercises'
import type {
  Exercise,
  ExerciseEquipment,
  Focus,
  GeneratedWorkout,
  Goal,
  Level,
  MovementPattern,
  PrescribedExercise,
  WorkoutBlock,
  WorkoutPreferences,
} from '../types'
import { createRng, shuffle, type Rng } from './seededRandom'

const EQUIPMENT_MAP: Record<WorkoutPreferences['equipment'], ExerciseEquipment[]> = {
  bodyweight: ['bodyweight'],
  dumbbells: ['bodyweight', 'dumbbell'],
  bands: ['bodyweight', 'band'],
  kettlebell: ['bodyweight', 'kettlebell'],
}

const FOCUS_PATTERNS: Record<Focus, MovementPattern[]> = {
  'full-body': ['squat', 'hinge', 'lunge', 'push', 'pull', 'core'],
  upper: ['push', 'pull'],
  lower: ['squat', 'hinge', 'lunge'],
  core: ['core', 'carry'],
}

/** Ordered pattern slots used to balance each block for a given focus. */
const FOCUS_SLOTS: Record<Focus, MovementPattern[][]> = {
  'full-body': [
    ['squat', 'lunge'],
    ['push', 'pull'],
    ['hinge', 'core'],
  ],
  upper: [['push'], ['pull'], ['push', 'pull']],
  lower: [['squat'], ['hinge'], ['lunge']],
  core: [
    ['core'],
    ['core', 'carry'],
    ['core', 'carry'],
  ],
}

interface DurationPlan {
  warmupMinutes: number
  warmupCount: number
  blockCount: number
  cooldownMinutes: number
  cooldownCount: number
}

const DURATION_PLANS: Record<WorkoutPreferences['duration'], DurationPlan> = {
  15: { warmupMinutes: 3, warmupCount: 3, blockCount: 1, cooldownMinutes: 2, cooldownCount: 2 },
  20: { warmupMinutes: 4, warmupCount: 3, blockCount: 2, cooldownMinutes: 3, cooldownCount: 2 },
  30: { warmupMinutes: 5, warmupCount: 4, blockCount: 2, cooldownMinutes: 3, cooldownCount: 3 },
  45: { warmupMinutes: 6, warmupCount: 4, blockCount: 3, cooldownMinutes: 4, cooldownCount: 3 },
}

const REST_SECONDS: Record<Goal, number> = {
  strength: 90,
  muscle: 60,
  conditioning: 30,
  'general-fitness': 45,
}

const ROUNDS: Record<Level, number> = {
  beginner: 2,
  intermediate: 3,
  advanced: 3,
}

/** Where in an exercise's rep range each goal lands (0 = low end, 1 = high end). */
const GOAL_REP_POSITION: Record<Goal, number> = {
  strength: 0.15,
  muscle: 0.8,
  conditioning: 1,
  'general-fitness': 0.5,
}

const LEVEL_TIME_POSITION: Record<Level, number> = {
  beginner: 0.2,
  intermediate: 0.55,
  advanced: 0.9,
}

const GOAL_TITLES: Record<Goal, string> = {
  strength: 'Strength',
  muscle: 'Hypertrophy',
  conditioning: 'Conditioning',
  'general-fitness': 'Fitness',
}

const FOCUS_TITLES: Record<Focus, string> = {
  'full-body': 'Full-Body',
  upper: 'Upper-Body',
  lower: 'Lower-Body',
  core: 'Core',
}

function lerpToStep(range: [number, number], position: number, step: number): number {
  const raw = range[0] + (range[1] - range[0]) * position
  return Math.max(range[0], Math.round(raw / step) * step)
}

function isTimeBased(exercise: Exercise, goal: Goal): boolean {
  if (exercise.repRange[0] === 1 && exercise.repRange[1] === 1) return true
  return goal === 'conditioning' && exercise.category === 'conditioning'
}

function prescribe(exercise: Exercise, preferences: WorkoutPreferences): PrescribedExercise {
  if (isTimeBased(exercise, preferences.goal)) {
    const seconds = lerpToStep(
      exercise.timeRangeSeconds,
      LEVEL_TIME_POSITION[preferences.level],
      5
    )
    return { exercise, prescription: `${seconds} sec` }
  }

  const reps = lerpToStep(exercise.repRange, GOAL_REP_POSITION[preferences.goal], 1)
  return {
    exercise,
    prescription: exercise.unilateral ? `${reps}/side` : `${reps} reps`,
  }
}

function matchesEquipment(exercise: Exercise, preferences: WorkoutPreferences): boolean {
  return EQUIPMENT_MAP[preferences.equipment].includes(exercise.equipment)
}

function matchesLevel(exercise: Exercise, level: Level): boolean {
  return exercise.levels.includes(level)
}

function mainPool(preferences: WorkoutPreferences): Exercise[] {
  const patterns = FOCUS_PATTERNS[preferences.focus]
  const base = EXERCISES.filter(
    (exercise) =>
      (exercise.category === 'strength' || exercise.category === 'conditioning') &&
      patterns.includes(exercise.movementPattern) &&
      matchesEquipment(exercise, preferences) &&
      matchesLevel(exercise, preferences.level)
  )
  const goalMatched = base.filter((exercise) =>
    exercise.suitableGoals.includes(preferences.goal)
  )
  // Prefer goal-matched exercises but never let a valid combination go empty.
  return goalMatched.length >= 6 ? goalMatched : base
}

function pickForSlot(
  slotPatterns: MovementPattern[],
  shuffled: Exercise[],
  usedInWorkout: Set<string>,
  usedInBlock: Set<string>
): Exercise {
  const inSlot = (exercise: Exercise): boolean =>
    slotPatterns.includes(exercise.movementPattern)

  const fresh = shuffled.find(
    (exercise) => inSlot(exercise) && !usedInWorkout.has(exercise.id)
  )
  if (fresh) return fresh

  const reusable = shuffled.find(
    (exercise) => inSlot(exercise) && !usedInBlock.has(exercise.id)
  )
  if (reusable) return reusable

  // Slot pattern unavailable for this combination; fall back to any exercise
  // in the pool that is not already in this block.
  const fallback = shuffled.find((exercise) => !usedInBlock.has(exercise.id))
  if (fallback) return fallback

  return shuffled[0]
}

function buildBlocks(
  preferences: WorkoutPreferences,
  plan: DurationPlan,
  rng: Rng
): WorkoutBlock[] {
  const pool = mainPool(preferences)
  const usedInWorkout = new Set<string>()
  const blocks: WorkoutBlock[] = []

  for (let blockIndex = 0; blockIndex < plan.blockCount; blockIndex += 1) {
    const shuffled = shuffle(pool, rng)
    const usedInBlock = new Set<string>()
    const exercises: PrescribedExercise[] = []
    const slots = FOCUS_SLOTS[preferences.focus]

    slots.forEach((slotPatterns, slotIndex) => {
      // Rotate slots per block so multi-block workouts vary their emphasis.
      const rotated = slots[(slotIndex + blockIndex) % slots.length]
      const exercise = pickForSlot(rotated, shuffled, usedInWorkout, usedInBlock)
      usedInWorkout.add(exercise.id)
      usedInBlock.add(exercise.id)
      exercises.push(prescribe(exercise, preferences))
    })

    blocks.push({
      title: `Block ${String(blockIndex + 1).padStart(2, '0')}`,
      rounds: ROUNDS[preferences.level],
      restSeconds: REST_SECONDS[preferences.goal],
      exercises,
    })
  }

  return blocks
}

function buildSegment(
  category: 'warmup' | 'cooldown',
  count: number,
  minutes: number,
  title: string,
  preferences: WorkoutPreferences,
  rng: Rng
): GeneratedWorkout['warmup'] {
  const pool = EXERCISES.filter(
    (exercise) => exercise.category === category && matchesLevel(exercise, preferences.level)
  )
  const picked = shuffle(pool, rng).slice(0, count)
  return {
    title,
    minutes,
    exercises: picked.map((exercise) => {
      const seconds = lerpToStep(
        exercise.timeRangeSeconds,
        LEVEL_TIME_POSITION[preferences.level],
        5
      )
      return {
        exercise,
        prescription: exercise.unilateral ? `${seconds} sec/side` : `${seconds} sec`,
      }
    }),
  }
}

export function workoutSeed(preferences: WorkoutPreferences, variant: number): string {
  return [
    preferences.goal,
    preferences.level,
    preferences.duration,
    preferences.equipment,
    preferences.focus,
    variant,
  ].join('|')
}

export function generateWorkout(
  preferences: WorkoutPreferences,
  variant = 0
): GeneratedWorkout {
  const rng = createRng(workoutSeed(preferences, variant))
  const plan = DURATION_PLANS[preferences.duration]

  return {
    title: `${FOCUS_TITLES[preferences.focus]} ${GOAL_TITLES[preferences.goal]} ${preferences.duration}`,
    preferences,
    variant,
    warmup: buildSegment('warmup', plan.warmupCount, plan.warmupMinutes, 'Warm-up', preferences, rng),
    blocks: buildBlocks(preferences, plan, rng),
    cooldown: buildSegment(
      'cooldown',
      plan.cooldownCount,
      plan.cooldownMinutes,
      'Cooldown',
      preferences,
      rng
    ),
  }
}
