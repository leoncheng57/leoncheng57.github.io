import { useEffect, useState, type ReactElement } from 'react'
import { useLocation } from 'react-router-dom'
import ChoiceGroup from '../components/ChoiceGroup'
import ExerciseIllustration from '../components/ExerciseIllustration'
import ExerciseNameButton from '../components/ExerciseNameButton'
import { EXERCISES } from '../data/exercises'
import type { Exercise, ExerciseEquipment, MovementPattern } from '../types'
import {
  BODY_PART_LABELS,
  bodyPartMeta,
  equipmentMeta,
} from '../utils/exerciseMeta'
import styles from '../workout-lab.module.css'

type EquipmentFilter = ExerciseEquipment | 'all'
type BodyPartFilter = (typeof BODY_PART_LABELS)[number] | 'all'

const EQUIPMENT_ORDER: ExerciseEquipment[] = [
  'bodyweight',
  'dumbbell',
  'band',
  'kettlebell',
  'barbell',
  'cable',
  'machine',
  'station',
  'cardio-machine',
]

// Derived from the library so new equipment types appear automatically.
const EQUIPMENT_FILTERS: Array<{ value: EquipmentFilter; label: string }> = [
  { value: 'all', label: 'All equipment' },
  ...EQUIPMENT_ORDER.filter((equipment) =>
    EXERCISES.some((exercise) => exercise.equipment === equipment)
  ).map((equipment) => ({
    value: equipment,
    label: equipmentMeta(equipment).label,
  })),
]

const BODY_PART_FILTERS: Array<{ value: BodyPartFilter; label: string }> = [
  { value: 'all', label: 'All body parts' },
  ...BODY_PART_LABELS.map((label) => ({ value: label, label })),
]

const PATTERN_SECTIONS: Array<{ pattern: MovementPattern; title: string }> = [
  { pattern: 'squat', title: 'Squat' },
  { pattern: 'hinge', title: 'Hinge' },
  { pattern: 'lunge', title: 'Lunge & single-leg' },
  { pattern: 'push', title: 'Push' },
  { pattern: 'pull', title: 'Pull' },
  { pattern: 'core', title: 'Core' },
  { pattern: 'carry', title: 'Carry' },
  { pattern: 'cardio', title: 'Conditioning' },
  { pattern: 'mobility', title: 'Warm-up & mobility' },
  { pattern: 'stretch', title: 'Cooldown & stretch' },
]

function LibraryExerciseRow({
  exercise,
  onOpen,
}: {
  exercise: Exercise
  onOpen: (_exercise: Exercise, _trigger: HTMLButtonElement) => void
}): ReactElement {
  const equipment = equipmentMeta(exercise.equipment)
  const bodyPart = bodyPartMeta(exercise)

  return (
    <li className={styles.exerciseRow}>
      <div className={styles.exerciseMain}>
        <ExerciseNameButton exercise={exercise} onOpen={onOpen} />
      </div>
      <div
        className={styles.exerciseMetaRow}
        role="group"
        aria-label={`${equipment.label}, ${bodyPart.label}`}
      >
        {[equipment, bodyPart].map((item) => (
          <span className={styles.exerciseMetaItem} key={item.label}>
            <span aria-hidden="true" data-testid="exercise-meta-icon">
              {item.emoji}
            </span>
            {item.label}
          </span>
        ))}
      </div>
      <p className={styles.exerciseCue}>{exercise.formCue}</p>
    </li>
  )
}

export default function ExerciseLibraryRoute({
  onOpenExercise,
}: {
  onOpenExercise: (_exercise: Exercise, _trigger: HTMLButtonElement) => void
}): ReactElement {
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>('all')
  const [bodyPartFilter, setBodyPartFilter] = useState<BodyPartFilter>('all')
  const { hash } = useLocation()

  // Landing-page pattern tiles deep-link to /workout-lab/exercises#<pattern>.
  // SPA navigations do not scroll to hashes on their own, so do it manually.
  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  const matches = (exercise: Exercise): boolean =>
    (equipmentFilter === 'all' || exercise.equipment === equipmentFilter) &&
    (bodyPartFilter === 'all' || bodyPartMeta(exercise).label === bodyPartFilter)

  const visibleCount = EXERCISES.filter(matches).length

  return (
    <main className={styles.library}>
      <header className={styles.libraryHeader}>
        <p className={styles.kicker}>The library</p>
        <h1 className={styles.sectionTitle}>Every exercise</h1>
        <p className={styles.libraryLede}>
          All {EXERCISES.length} movements Workout Lab builds from. Select any
          exercise for step-by-step instructions, warnings, and a video
          demonstration.
        </p>
      </header>

      <div className={styles.libraryFilters}>
        <ChoiceGroup
          legend="Equipment"
          name="library-equipment"
          options={EQUIPMENT_FILTERS}
          value={equipmentFilter}
          onChange={setEquipmentFilter}
        />
        <ChoiceGroup
          legend="Body part"
          name="library-body-part"
          options={BODY_PART_FILTERS}
          value={bodyPartFilter}
          onChange={setBodyPartFilter}
        />
      </div>

      <p className={styles.libraryCount} role="status">
        Showing {visibleCount} of {EXERCISES.length} exercises
      </p>

      {visibleCount === 0 ? (
        <p className={styles.libraryEmpty}>
          No exercises match this combination. Try widening a filter.
        </p>
      ) : (
        PATTERN_SECTIONS.map(({ pattern, title }) => {
          const sectionExercises = EXERCISES.filter(
            (exercise) => exercise.movementPattern === pattern
          ).filter(matches)
          if (sectionExercises.length === 0) return null

          return (
            <section
              key={pattern}
              id={pattern}
              className={styles.patternSection}
              aria-label={title}
            >
              <header className={styles.patternHeader}>
                <ExerciseIllustration
                  pattern={pattern}
                  className={styles.patternArt}
                />
                <div>
                  <h2 className={styles.patternTitle}>{title}</h2>
                  <p className={styles.patternCount}>
                    {sectionExercises.length}{' '}
                    {sectionExercises.length === 1 ? 'exercise' : 'exercises'}
                  </p>
                </div>
              </header>
              <ul className={styles.exerciseList}>
                {sectionExercises.map((exercise) => (
                  <LibraryExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    onOpen={onOpenExercise}
                  />
                ))}
              </ul>
            </section>
          )
        })
      )}
    </main>
  )
}
