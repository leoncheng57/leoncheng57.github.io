import type { ReactElement, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EXERCISES } from '../data/exercises'
import styles from '../workout-lab.module.css'

function GuideSection({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: ReactNode
}): ReactElement {
  return (
    <section className={styles.guideSection} aria-label={title}>
      <header className={styles.guideSectionHeader}>
        <span className={styles.guideNumber} aria-hidden="true">
          {number}
        </span>
        <h2 className={styles.guideSectionTitle}>{title}</h2>
      </header>
      <div className={styles.guideBody}>{children}</div>
    </section>
  )
}

/**
 * Full website guide: a plain-language walkthrough of everything Workout Lab
 * does, from building a session to timers, the exercise index, and installing
 * the app.
 */
export default function GuideRoute(): ReactElement {
  return (
    <main className={styles.guide}>
      <header className={styles.libraryHeader}>
        <p className={styles.kicker}>How it works</p>
        <h1 className={styles.sectionTitle}>Website guide</h1>
        <p className={styles.libraryLede}>
          Everything Workout Lab can do, in one place. New here? Read top to
          bottom — it takes about two minutes.
        </p>
      </header>

      <GuideSection number="01" title="Build a session">
        <p>
          The <Link className={styles.guideLink} to="/workout-lab/">builder</Link>{' '}
          is the heart of Workout Lab. Press <strong>Build my workout</strong>,
          then answer five quick questions:
        </p>
        <ul>
          <li>
            <strong>Goal</strong> — build strength, build muscle, conditioning,
            or general fitness.
          </li>
          <li>
            <strong>Experience</strong> — beginner, intermediate, or advanced.
          </li>
          <li>
            <strong>Duration</strong> — 15 to 45 minutes, including warm-up and
            cooldown.
          </li>
          <li>
            <strong>Equipment</strong> — from nothing at all to a full gym.
          </li>
          <li>
            <strong>Focus</strong> — full body, upper, lower, or core.
          </li>
        </ul>
        <p>
          Hit <strong>Generate workout</strong> and Workout Lab assembles a
          balanced session. Sessions are deterministic: the same answers always
          produce the same plan, so you can rebuild yesterday&apos;s workout by
          picking the same options. Want variety? <strong>Give me another</strong>{' '}
          deals a fresh variant from the same preferences.
        </p>
      </GuideSection>

      <GuideSection number="02" title="Read your workout">
        <p>Every generated session has the same three-part shape:</p>
        <ul>
          <li>
            <strong>Warm-up</strong> — mobility and activation work to prepare
            you for training.
          </li>
          <li>
            <strong>Numbered blocks</strong> — the main training work. Each
            block lists its rounds and the rest to take between them.
          </li>
          <li>
            <strong>Cooldown</strong> — stretches to finish the session.
          </li>
        </ul>
        <p>
          Each exercise row shows a prescription (reps or seconds), badges for
          the equipment, body part, and measurement type, and a one-line form
          cue to keep your technique honest.
        </p>
      </GuideSection>

      <GuideSection number="03" title="Open an exercise card">
        <p>
          Any underlined exercise name — in a session or in the index — opens a
          detail card with a hand-drawn movement illustration, the key form
          cue, step-by-step instructions, safety warnings, and a link to a
          short video demonstration. A sample card is showcased on the{' '}
          <Link className={styles.guideLink} to="/workout-lab/">home page</Link>.
        </p>
      </GuideSection>

      <GuideSection number="04" title="Browse the exercise index">
        <p>
          The{' '}
          <Link className={styles.guideLink} to="/workout-lab/exercises">
            exercise index
          </Link>{' '}
          lists all {EXERCISES.length} movements Workout Lab builds from,
          grouped by movement pattern — squat, hinge, lunge, push, pull, core,
          carry, conditioning, mobility, and stretching. Filter by equipment or
          body part to find exactly what you can train today.
        </p>
      </GuideSection>

      <GuideSection number="05" title="Use the timers">
        <p>
          Timed exercises show a <strong>Set timer</strong> button that counts
          down the prescribed work, and every block has a one-tap rest timer.
          The timer docks to the corner of the screen, so you can keep reading
          your session while it runs.
        </p>
      </GuideSection>

      <GuideSection number="06" title="Install it like an app">
        <p>
          Workout Lab works offline once installed. On iOS, open the site in
          Safari, tap <strong>Share</strong>, then <strong>Add to Home
          Screen</strong>. On Android and desktop Chrome, use the install
          option in the browser menu. You get a full-screen app with no address
          bar, ready wherever you train.
        </p>
      </GuideSection>

      <GuideSection number="07" title="The fine print">
        <p>
          Workout Lab offers general fitness suggestions, not medical advice.
          Warm up properly, respect the warnings on each exercise card, and
          stop any movement that causes pain.
        </p>
      </GuideSection>
    </main>
  )
}
