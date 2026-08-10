export type Goal = 'strength' | 'muscle' | 'conditioning' | 'general-fitness'

export type Level = 'beginner' | 'intermediate' | 'advanced'

export type DurationMinutes = 15 | 20 | 30 | 45

export type EquipmentChoice =
  | 'bodyweight'
  | 'dumbbells'
  | 'bands'
  | 'kettlebell'
  | 'full-gym'

export type Focus = 'full-body' | 'upper' | 'lower' | 'core'

export interface WorkoutPreferences {
  goal: Goal
  level: Level
  duration: DurationMinutes
  equipment: EquipmentChoice
  focus: Focus
}

export type ExerciseEquipment =
  | 'bodyweight'
  | 'dumbbell'
  | 'band'
  | 'kettlebell'
  | 'barbell'
  | 'cable'
  | 'machine'
  | 'station'
  | 'cardio-machine'

export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'push'
  | 'pull'
  | 'core'
  | 'carry'
  | 'cardio'
  | 'mobility'
  | 'stretch'

export type ExerciseCategory = 'strength' | 'conditioning' | 'warmup' | 'cooldown'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  movementPattern: MovementPattern
  primaryMuscles: string[]
  equipment: ExerciseEquipment
  levels: Level[]
  suitableGoals: Goal[]
  /** Inclusive rep range used for rep-based prescriptions. */
  repRange: [number, number]
  /** Inclusive seconds range used for time-based prescriptions. */
  timeRangeSeconds: [number, number]
  unilateral: boolean
  formCue: string
}

export interface PrescribedExercise {
  exercise: Exercise
  /** e.g. "10 reps", "10/side", "40 sec" */
  prescription: string
}

export interface WorkoutBlock {
  title: string
  rounds: number
  restSeconds: number
  exercises: PrescribedExercise[]
}

export interface WorkoutSegment {
  title: string
  minutes: number
  exercises: PrescribedExercise[]
}

export interface GeneratedWorkout {
  title: string
  preferences: WorkoutPreferences
  variant: number
  warmup: WorkoutSegment
  blocks: WorkoutBlock[]
  cooldown: WorkoutSegment
}
