import type { ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import GuideNotFound from '../components/GuideNotFound'
import ManagerWorkerSimulator, {
  SIMULATOR_GUIDE_SLUG,
} from '../components/ManagerWorkerSimulator'
import { getGuideBySlug } from '../content'
import styles from '../guides.module.css'
import simStyles from '../components/ManagerWorkerSimulator/ManagerWorkerSimulator.module.css'

/**
 * Guide-scoped experimental playground. Only the manager/worker guide has a
 * simulator; every other slug falls through to the shared GuideNotFound.
 */
export default function GuidePlaygroundRoute(): ReactElement {
  const { slug = '' } = useParams()
  const guide = getGuideBySlug(slug)

  if (!guide || guide.slug !== SIMULATOR_GUIDE_SLUG) {
    return (
      <GuideNotFound
        heading="Playground not found"
        message="This guide does not have a playground."
      />
    )
  }

  return (
    <main className={styles.main}>
      <p className={styles.backLink}>
        <Link to={`/guides/${guide.slug}`}>&larr; Guide overview</Link>
      </p>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>~/guides/{guide.slug}/playground</p>
        <span className={simStyles.experimentalBadge}>Experimental</span>
        <h1 className={styles.heroTitle}>Manager/worker run simulator</h1>
        <p className={styles.heroDescription}>
          A toy model of one manager agent dispatching parallel workers. Tune the knobs to see
          where time goes, where work stalls waiting on a human, and which moments are yours
          versus the agents&rsquo;.
        </p>
        <p className={simStyles.playgroundNote}>
          This playground is experimental and deliberately simplified: durations are simulated
          minutes, not measurements. The same seed always replays the same run.
        </p>
      </header>

      <ManagerWorkerSimulator />
    </main>
  )
}
