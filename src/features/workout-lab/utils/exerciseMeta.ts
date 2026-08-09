import type { Exercise, ExerciseEquipment } from '../types'

interface ExerciseMeta {
  equipment: { emoji: string; label: string }
  bodyPart: { emoji: string; label: string }
  measurement: { emoji: string; label: string }
}

const EQUIPMENT_META: Record<
  ExerciseEquipment,
  ExerciseMeta['equipment']
> = {
  bodyweight: { emoji: '🧍', label: 'Bodyweight' },
  dumbbell: { emoji: '🏋️', label: 'Dumbbell' },
  band: { emoji: '🎗️', label: 'Resistance band' },
  kettlebell: { emoji: '🔔', label: 'Kettlebell' },
}

const MUSCLE_REGIONS: Record<string, ExerciseMeta['bodyPart']> = {
  abs: { emoji: '🌀', label: 'Core' },
  adductors: { emoji: '🦵', label: 'Legs' },
  back: { emoji: '🦴', label: 'Back' },
  biceps: { emoji: '💪', label: 'Arms' },
  chest: { emoji: '🫁', label: 'Chest' },
  core: { emoji: '🌀', label: 'Core' },
  diaphragm: { emoji: '🫁', label: 'Chest' },
  'full body': { emoji: '🧍', label: 'Full body' },
  glutes: { emoji: '🦵', label: 'Lower body' },
  grip: { emoji: '💪', label: 'Arms' },
  hamstrings: { emoji: '🦵', label: 'Lower body' },
  'hip flexors': { emoji: '🦵', label: 'Lower body' },
  hips: { emoji: '🦵', label: 'Lower body' },
  lats: { emoji: '🦴', label: 'Back' },
  legs: { emoji: '🦵', label: 'Legs' },
  'lower back': { emoji: '🦴', label: 'Back' },
  obliques: { emoji: '🌀', label: 'Core' },
  quads: { emoji: '🦵', label: 'Lower body' },
  'rear delts': { emoji: '🤸', label: 'Shoulders' },
  shoulders: { emoji: '🤸', label: 'Shoulders' },
  spine: { emoji: '🦴', label: 'Back' },
  'thoracic spine': { emoji: '🦴', label: 'Back' },
  traps: { emoji: '🦴', label: 'Back' },
  triceps: { emoji: '💪', label: 'Arms' },
  'upper back': { emoji: '🦴', label: 'Back' },
}

const FALLBACK_BODY_PART = { emoji: '🧍', label: 'Full body' }

export function getExerciseMeta(
  exercise: Exercise,
  prescription: string
): ExerciseMeta {
  return {
    equipment: EQUIPMENT_META[exercise.equipment],
    bodyPart: MUSCLE_REGIONS[exercise.primaryMuscles[0]] ?? FALLBACK_BODY_PART,
    measurement: prescription.includes('sec')
      ? { emoji: '⏱️', label: 'Timed exercise' }
      : { emoji: '🔁', label: 'Repetitions' },
  }
}
