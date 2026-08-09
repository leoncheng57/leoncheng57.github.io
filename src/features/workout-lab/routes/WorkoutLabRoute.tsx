import { useEffect, useRef, useState, type ReactElement } from 'react'
import ExerciseModal from '../components/ExerciseModal'
import type { ExerciseDetail } from '../data/exercise-details'
import { generateWorkout } from '../generator/generateWorkout'
import type {
  DurationMinutes,
  EquipmentChoice,
  Exercise,
  Focus,
  GeneratedWorkout,
  Goal,
  Level,
  PrescribedExercise,
  WorkoutBlock,
  WorkoutPreferences,
  WorkoutSegment,
} from '../types'
import { getExerciseMeta } from '../utils/exerciseMeta'
import styles from '../workout-lab.module.css'

const GOAL_OPTIONS: Array<{ value: Goal; label: string }> = [
  { value: 'strength', label: 'Build strength' },
  { value: 'muscle', label: 'Build muscle' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'general-fitness', label: 'General fitness' },
]

const LEVEL_OPTIONS: Array<{ value: Level; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const DURATION_OPTIONS: Array<{ value: DurationMinutes; label: string }> = [
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
]

const EQUIPMENT_OPTIONS: Array<{ value: EquipmentChoice; label: string }> = [
  { value: 'bodyweight', label: 'No equipment' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'bands', label: 'Resistance bands' },
  { value: 'kettlebell', label: 'Kettlebell' },
]

const FOCUS_OPTIONS: Array<{ value: Focus; label: string }> = [
  { value: 'full-body', label: 'Full body' },
  { value: 'upper', label: 'Upper body' },
  { value: 'lower', label: 'Lower body' },
  { value: 'core', label: 'Core' },
]

const DEFAULT_PREFERENCES: WorkoutPreferences = {
  goal: 'general-fitness',
  level: 'beginner',
  duration: 30,
  equipment: 'bodyweight',
  focus: 'full-body',
}

function optionLabel<T>(options: Array<{ value: T; label: string }>, value: T): string {
  return options.find((option) => option.value === value)?.label ?? String(value)
}

interface ChoiceGroupProps<T extends string | number> {
  legend: string
  name: string
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (_value: T) => void
}

function ChoiceGroup<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
}: ChoiceGroupProps<T>): ReactElement {
  return (
    <fieldset className={styles.choiceGroup}>
      <legend className={styles.choiceLegend}>{legend}</legend>
      <div className={styles.choiceOptions} role="presentation">
        {options.map((option) => (
          <label
            key={String(option.value)}
            className={
              option.value === value ? styles.choiceSelected : styles.choice
            }
          >
            <input
              className={styles.choiceInput}
              type="radio"
              name={name}
              value={String(option.value)}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function ExerciseListItem({
  prescribed,
  onOpen,
}: {
  prescribed: PrescribedExercise
  onOpen: (_exercise: Exercise, _trigger: HTMLButtonElement) => void
}): ReactElement {
  const { exercise, prescription } = prescribed
  const meta = getExerciseMeta(exercise, prescription)

  return (
    <li className={styles.exerciseRow}>
      <div className={styles.exerciseMain}>
        <button
          type="button"
          className={styles.exerciseName}
          data-exercise-name={exercise.name}
          onClick={(event) => onOpen(exercise, event.currentTarget)}
        >
          {exercise.name}
        </button>
        <span className={styles.exercisePrescription}>{prescription}</span>
      </div>
      <div
        className={styles.exerciseMetaRow}
        role="group"
        aria-label={`${meta.equipment.label}, ${meta.bodyPart.label}, ${meta.measurement.label}`}
      >
        {[meta.equipment, meta.bodyPart, meta.measurement].map((item) => (
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

function SegmentSection({
  segment,
  kicker,
  onOpenExercise,
}: {
  segment: WorkoutSegment
  kicker: string
  onOpenExercise: (_exercise: Exercise, _trigger: HTMLButtonElement) => void
}): ReactElement {
  return (
    <section className={styles.segment} aria-label={segment.title}>
      <header className={styles.segmentHeader}>
        <span className={styles.segmentKicker}>{kicker}</span>
        <h3 className={styles.segmentTitle}>{segment.title}</h3>
        <span className={styles.segmentMeta}>{segment.minutes} min</span>
      </header>
      <ul className={styles.exerciseList}>
        {segment.exercises.map((prescribed) => (
          <ExerciseListItem
            key={prescribed.exercise.id}
            prescribed={prescribed}
            onOpen={onOpenExercise}
          />
        ))}
      </ul>
    </section>
  )
}

function BlockSection({
  block,
  index,
  onOpenExercise,
}: {
  block: WorkoutBlock
  index: number
  onOpenExercise: (_exercise: Exercise, _trigger: HTMLButtonElement) => void
}): ReactElement {
  return (
    <section className={styles.block} aria-label={block.title}>
      <header className={styles.blockHeader}>
        <span className={styles.blockNumber} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className={styles.blockHeading}>
          <h3 className={styles.blockTitle}>{block.title}</h3>
          <p className={styles.blockMeta}>
            {block.rounds} rounds · rest {block.restSeconds} sec between rounds
          </p>
        </div>
      </header>
      <ul className={styles.exerciseList}>
        {block.exercises.map((prescribed) => (
          <ExerciseListItem
            key={prescribed.exercise.id}
            prescribed={prescribed}
            onOpen={onOpenExercise}
          />
        ))}
      </ul>
    </section>
  )
}

type View = 'landing' | 'builder' | 'workout'

export default function WorkoutLabRoute(): ReactElement {
  const [view, setView] = useState<View>('landing')
  const [preferences, setPreferences] = useState<WorkoutPreferences>(DEFAULT_PREFERENCES)
  const [variant, setVariant] = useState(0)
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [exerciseDetail, setExerciseDetail] = useState<
    ExerciseDetail | null | undefined
  >(undefined)
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!selectedExercise) {
      setExerciseDetail(undefined)
      return undefined
    }

    let cancelled = false
    setExerciseDetail(undefined)
    import('../data/exercise-details').then(({ EXERCISE_DETAILS }) => {
      if (!cancelled) {
        setExerciseDetail(EXERCISE_DETAILS[selectedExercise.id] ?? null)
      }
    })

    return () => {
      cancelled = true
    }
  }, [selectedExercise])

  const updatePreference = <K extends keyof WorkoutPreferences>(
    key: K,
    value: WorkoutPreferences[K]
  ): void => {
    setPreferences((current) => ({ ...current, [key]: value }))
  }

  const buildWorkout = (nextVariant: number): void => {
    setVariant(nextVariant)
    setWorkout(generateWorkout(preferences, nextVariant))
    setView('workout')
  }

  const openExercise = (
    exercise: Exercise,
    trigger: HTMLButtonElement
  ): void => {
    modalTriggerRef.current = trigger
    setSelectedExercise(exercise)
  }

  const summary = [
    optionLabel(DURATION_OPTIONS, preferences.duration),
    optionLabel(LEVEL_OPTIONS, preferences.level),
    optionLabel(FOCUS_OPTIONS, preferences.focus),
    optionLabel(EQUIPMENT_OPTIONS, preferences.equipment),
  ].join(' · ')

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.masthead}>
          <span className={styles.wordmark}>Workout Lab</span>
          <span className={styles.mastheadNote}>Session builder · No.01</span>
        </header>

        {view === 'landing' && (
          <main className={styles.landing}>
            <p className={styles.kicker}>Train anywhere</p>
            <h1 className={styles.displayTitle}>
              Your next workout,
              <br />
              <em className={styles.displayAccent}>built in seconds.</em>
            </h1>
            <p className={styles.lede}>
              Tell Workout Lab your goal, your time, and what gear you have. It
              assembles a balanced session — warm-up, training blocks, and
              cooldown — from a curated exercise library.
            </p>
            <div className={styles.landingActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setView('builder')}
              >
                Build my workout
              </button>
            </div>
            <dl className={styles.statStrip}>
              <div className={styles.stat}>
                <dt className={styles.statLabel}>Exercises</dt>
                <dd className={styles.statValue}>100+</dd>
              </div>
              <div className={styles.stat}>
                <dt className={styles.statLabel}>Equipment needed</dt>
                <dd className={styles.statValue}>None</dd>
              </div>
              <div className={styles.stat}>
                <dt className={styles.statLabel}>Session length</dt>
                <dd className={styles.statValue}>15–45 min</dd>
              </div>
            </dl>
          </main>
        )}

        {view === 'builder' && (
          <main className={styles.builder}>
            <p className={styles.kicker}>Step 01 — Preferences</p>
            <h1 className={styles.sectionTitle}>Shape your session</h1>
            <form
              className={styles.builderForm}
              onSubmit={(event) => {
                event.preventDefault()
                buildWorkout(0)
              }}
            >
              <ChoiceGroup
                legend="Goal"
                name="goal"
                options={GOAL_OPTIONS}
                value={preferences.goal}
                onChange={(value) => updatePreference('goal', value)}
              />
              <ChoiceGroup
                legend="Experience"
                name="level"
                options={LEVEL_OPTIONS}
                value={preferences.level}
                onChange={(value) => updatePreference('level', value)}
              />
              <ChoiceGroup
                legend="Duration"
                name="duration"
                options={DURATION_OPTIONS}
                value={preferences.duration}
                onChange={(value) => updatePreference('duration', value)}
              />
              <ChoiceGroup
                legend="Equipment"
                name="equipment"
                options={EQUIPMENT_OPTIONS}
                value={preferences.equipment}
                onChange={(value) => updatePreference('equipment', value)}
              />
              <ChoiceGroup
                legend="Focus"
                name="focus"
                options={FOCUS_OPTIONS}
                value={preferences.focus}
                onChange={(value) => updatePreference('focus', value)}
              />
              <div className={styles.builderFooter}>
                <p className={styles.summaryLine} data-testid="preference-summary">
                  {summary}
                </p>
                <button type="submit" className={styles.primaryButton}>
                  Generate workout
                </button>
              </div>
            </form>
          </main>
        )}

        {view === 'workout' && workout && (
          <main className={styles.workout}>
            <header className={styles.workoutHeader}>
              <p className={styles.kicker}>Your session</p>
              <h1 className={styles.workoutTitle}>{workout.title}</h1>
              <p className={styles.workoutMeta}>{summary}</p>
            </header>

            <SegmentSection
              segment={workout.warmup}
              kicker="Prepare"
              onOpenExercise={openExercise}
            />
            <div className={styles.blockList}>
              {workout.blocks.map((block, index) => (
                <BlockSection
                  key={block.title}
                  block={block}
                  index={index}
                  onOpenExercise={openExercise}
                />
              ))}
            </div>
            <SegmentSection
              segment={workout.cooldown}
              kicker="Recover"
              onOpenExercise={openExercise}
            />

            <div className={styles.workoutActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => buildWorkout(variant + 1)}
              >
                Give me another
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setView('builder')}
              >
                Edit preferences
              </button>
            </div>
            <p className={styles.disclaimer}>
              Workout Lab offers general fitness suggestions, not medical
              advice. Stop any movement that causes pain.
            </p>
          </main>
        )}

        <footer className={styles.footer}>
          <span>Workout Lab</span>
          <span>Deterministic sessions · Same inputs, same workout</span>
        </footer>
      </div>
      {selectedExercise ? (
        <ExerciseModal
          exercise={selectedExercise}
          detail={exerciseDetail}
          returnFocusTo={modalTriggerRef.current}
          onClose={() => setSelectedExercise(null)}
        />
      ) : null}
    </div>
  )
}
