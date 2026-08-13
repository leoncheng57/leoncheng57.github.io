import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../repo.module.css'

export default function AlphaProjsRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Repo / alpha projs</p>
          <h1>Alpha Projs</h1>
        </header>

        <section aria-labelledby="alpha-projects-heading">
          <h2 id="alpha-projects-heading" className={styles.eyebrow}>
            Active experiments
          </h2>
          <article className={styles.projectCard}>
            <img src="/app-icons/tuzi.svg" alt="" width="72" height="72" />
            <div className={styles.projectCardBody}>
              <div className={styles.projectCardHeading}>
                <h3>Tuzi</h3>
                <span className={styles.alphaBadge}>Alpha</span>
                <span className={styles.betaBadge}>Beta</span>
              </div>
              <p>
                A demonstration prototype for comparing books head-to-head and
                building an Elo-ranked shelf. Rankings currently reset on reload.
              </p>
              <Link to="/tuzi/" className={styles.projectLink}>
                Start ranking
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
