import { useLayoutEffect, useState, type ReactElement } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import ChoiceGroup from '../components/ChoiceGroup'
import ExerciseIllustration from '../components/ExerciseIllustration'
import ExerciseNameButton from '../components/ExerciseNameButton'
import ExerciseShowcase from '../components/ExerciseShowcase'
import { EXERCISES } from '../data/exercises'
import WorkoutLabPwa from '../components/WorkoutLabPwa'
import WorkoutTimer, { type TimerSelection } from '../components/WorkoutTimer'
import { generateWorkout } from '../generator/generateWorkout'
import useExerciseModal from '../hooks/useExerciseModal'
import type {
  DurationMinutes,
  EquipmentChoice,
  Exercise,
  Focus,
  GeneratedWorkout,
  Goal,
  Level,
  MovementPattern,
  PrescribedExercise,
  WorkoutBlock,
  WorkoutPreferences,
  WorkoutSegment,
} from '../types'
import { getExerciseMeta } from '../utils/exerciseMeta'
import styles from '../workout-lab.module.css'
import ExerciseLibraryRoute from './ExerciseLibraryRoute'
import GuideRoute from './GuideRoute'

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
  { value: 'full-gym', label: 'Full gym' },
]

const FOCUS_OPTIONS: Array<{ value: Focus; label: string }> = [
  { value: 'full-body', label: 'Full body' },
  { value: 'upper', label: 'Upper body' },
  { value: 'lower', label: 'Lower body' },
  { value: 'core', label: 'Core' },
]

const PATTERN_GALLERY: Array<{ pattern: MovementPattern; label: string }> = [
  { pattern: 'squat', label: 'Squat' },
  { pattern: 'hinge', label: 'Hinge' },
  { pattern: 'lunge', label: 'Lunge' },
  { pattern: 'push', label: 'Push' },
  { pattern: 'pull', label: 'Pull' },
  { pattern: 'core', label: 'Core' },
  { pattern: 'carry', label: 'Carry' },
  { pattern: 'cardio', label: 'Cardio' },
  { pattern: 'mobility', label: 'Mobility' },
  { pattern: 'stretch', label: 'Stretch' },
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

function ExerciseListItem({
  prescribed,
  onOpen,
  onStartTimer,
}: {
  prescribed: PrescribedExercise
  onOpen: (_exercise: Exercise, _trigger: HTMLButtonElement) => void
  onStartTimer: (_selection: TimerSelection) => void
}): ReactElement {
  const { exercise, prescription } = prescribed
  const meta = getExerciseMeta(exercise, prescription)
  const timedSeconds = prescription.match(/^(\d+) sec/)?.[1]

  return (
    <li className={styles.exerciseRow}>
      <div className={styles.exerciseMain}>
        <ExerciseNameButton exercise={exercise} onOpen={onOpen} />
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
        {timedSeconds ? (
          <button
            type="button"
            className={styles.timerLaunch}
            onClick={() =>
              onStartTimer({
                id: `exercise-${exercise.id}-${timedSeconds}`,
                label: exercise.name,
                seconds: Number(timedSeconds),
                kind: 'exercise',
              })
            }
            aria-label={`Start ${timedSeconds} second timer for ${exercise.name}`}
          >
            Set timer
          </button>
        ) : null}
      </div>
      <p className={styles.exerciseCue}>{exercise.formCue}</p>
    </li>
  )
}

function SegmentSection({
  segment,
  kicker,
  onOpenExercise,
  onStartTimer,
}: {
  segment: WorkoutSegment
  kicker: string
  onOpenExercise: (_exercise: Exercise, _trigger: HTMLButtonElement) => void
  onStartTimer: (_selection: TimerSelection) => void
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
            onStartTimer={onStartTimer}
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
  onStartTimer,
}: {
  block: WorkoutBlock
  index: number
  onOpenExercise: (_exercise: Exercise, _trigger: HTMLButtonElement) => void
  onStartTimer: (_selection: TimerSelection) => void
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
          <button
            type="button"
            className={styles.restTimerButton}
            onClick={() =>
              onStartTimer({
                id: `rest-${index}-${block.restSeconds}`,
                label: `${block.title} rest`,
                seconds: block.restSeconds,
                kind: 'rest',
              })
            }
          >
            Set {block.restSeconds}s rest timer
          </button>
        </div>
      </header>
      <ul className={styles.exerciseList}>
        {block.exercises.map((prescribed) => (
          <ExerciseListItem
            key={prescribed.exercise.id}
            prescribed={prescribed}
            onOpen={onOpenExercise}
            onStartTimer={onStartTimer}
          />
        ))}
      </ul>
    </section>
  )
}

type View = 'landing' | 'builder' | 'workout'

function SessionBuilderPage({
  onOpenExercise,
}: {
  onOpenExercise: (_exercise: Exercise, _trigger: HTMLButtonElement) => void
}): ReactElement {
  const [view, setView] = useState<View>('landing')
  const [preferences, setPreferences] = useState<WorkoutPreferences>(DEFAULT_PREFERENCES)
  const [variant, setVariant] = useState(0)
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null)
  const [timerSelection, setTimerSelection] = useState<TimerSelection | null>(null)

  const updatePreference = <K extends keyof WorkoutPreferences>(
    key: K,
    value: WorkoutPreferences[K]
  ): void => {
    setPreferences((current) => ({ ...current, [key]: value }))
  }

  const buildWorkout = (nextVariant: number): void => {
    setTimerSelection(null)
    setVariant(nextVariant)
    setWorkout(generateWorkout(preferences, nextVariant))
    setView('workout')
  }

  const summary = [
    optionLabel(DURATION_OPTIONS, preferences.duration),
    optionLabel(LEVEL_OPTIONS, preferences.level),
    optionLabel(FOCUS_OPTIONS, preferences.focus),
    optionLabel(EQUIPMENT_OPTIONS, preferences.equipment),
  ].join(' · ')

  return (
    <>
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
              <dd className={styles.statValue}>
                <Link
                  className={styles.statLink}
                  to="/workout-lab/exercises"
                  aria-label="Browse all exercises"
                >
                  {Math.floor(EXERCISES.length / 10) * 10}+
                </Link>
              </dd>
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

          <section
            className={styles.landingSection}
            aria-labelledby="pattern-gallery-title"
          >
            <p className={styles.kicker}>The movement library</p>
            <h2 id="pattern-gallery-title" className={styles.landingSectionTitle}>
              Ten patterns, hand-drawn
            </h2>
            <p className={styles.landingSectionLede}>
              Every session blends exercises from these movement patterns, so
              nothing gets overworked and nothing gets skipped. Pick a figure
              to browse its exercises.
            </p>
            <ul className={styles.patternGrid}>
              {PATTERN_GALLERY.map(({ pattern, label }) => (
                <li key={pattern}>
                  <Link
                    className={styles.patternTile}
                    to="/workout-lab/exercises"
                    aria-label={`Browse ${label.toLowerCase()} exercises`}
                  >
                    <ExerciseIllustration
                      pattern={pattern}
                      className={styles.patternTileArt}
                    />
                    <span className={styles.patternTileLabel}>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={styles.landingSection}
            aria-labelledby="exercise-showcase-title"
          >
            <p className={styles.kicker}>Built-in coaching</p>
            <h2
              id="exercise-showcase-title"
              className={styles.landingSectionTitle}
            >
              Every exercise, fully explained
            </h2>
            <p className={styles.landingSectionLede}>
              Tap any underlined exercise name in a session or the exercise
              index and a card like this opens — illustration, key form cue,
              step-by-step instructions, and safety warnings.
            </p>
            <ExerciseShowcase />
          </section>
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
            onOpenExercise={onOpenExercise}
            onStartTimer={setTimerSelection}
          />
          <div className={styles.blockList}>
            {workout.blocks.map((block, index) => (
              <BlockSection
                key={block.title}
                block={block}
                index={index}
                onOpenExercise={onOpenExercise}
                onStartTimer={setTimerSelection}
              />
            ))}
          </div>
          <SegmentSection
            segment={workout.cooldown}
            kicker="Recover"
            onOpenExercise={onOpenExercise}
            onStartTimer={setTimerSelection}
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
              onClick={() => {
                setTimerSelection(null)
                setView('builder')
              }}
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

      {timerSelection ? (
        <WorkoutTimer
          key={timerSelection.id}
          selection={timerSelection}
          onClose={() => setTimerSelection(null)}
        />
      ) : null}
    </>
  )
}

export default function WorkoutLabRoute(): ReactElement {
  const { openExercise, modal } = useExerciseModal()

  useLayoutEffect(() => {
    if (window.location.pathname === '/workout-lab') {
      window.history.replaceState(window.history.state, '', '/workout-lab/')
    }
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.masthead}>
          <div className={styles.brand}>
            <span className={styles.wordmark}>Workout Lab</span>
            <span className={styles.betaBadge}>BETA</span>
          </div>
          <nav className={styles.mastheadNav} aria-label="Workout Lab">
            <NavLink end className={styles.mastheadLink} to="/workout-lab/">
              Builder
            </NavLink>
            <NavLink className={styles.mastheadLink} to="/workout-lab/exercises">
              Exercises
            </NavLink>
            <NavLink className={styles.mastheadLink} to="/workout-lab/guide">
              Guide
            </NavLink>
          </nav>
        </header>
        <WorkoutLabPwa />

        <Routes>
          <Route index element={<SessionBuilderPage onOpenExercise={openExercise} />} />
          <Route
            path="exercises"
            element={<ExerciseLibraryRoute onOpenExercise={openExercise} />}
          />
          <Route path="guide" element={<GuideRoute />} />
        </Routes>

        <footer className={styles.footer}>
          <span>Workout Lab</span>
          <span>Deterministic sessions · Same inputs, same workout</span>
        </footer>
      </div>
      {modal}
    </div>
  )
}
