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

        <section
          className={styles.placeholderBanner}
          aria-labelledby="alpha-placeholder-heading"
        >
          <div className={styles.placeholderStatus}>
            <span className={styles.statusDot} aria-hidden="true" />
            In progress
          </div>
          <h2 id="alpha-placeholder-heading">Still taking shape</h2>
          <p>
            Early projects and experiments are being assembled here. This space
            will become a home for things still in alpha.
          </p>
          <div className={styles.placeholderFooter}>
            <span className={styles.comingSoon}>Coming soon</span>
            <div className={styles.buildTrack} aria-hidden="true">
              <span />
              <strong>Building the next thing</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
