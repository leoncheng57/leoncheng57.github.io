import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../../repo/repo.module.css'

export default function GuidesRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>
        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Living documentation</p>
          <h1>Guides</h1>
        </header>
        <section
          className={styles.placeholderBanner}
          aria-labelledby="guides-placeholder-heading"
        >
          <div className={styles.placeholderStatus}>
            <span className={styles.statusDot} aria-hidden="true" />
            In progress
          </div>
          <h2 id="guides-placeholder-heading">Still taking shape</h2>
          <p>
            Maintained, article-like resources are being assembled here. Each
            guide will get its own page when it is ready to share.
          </p>
          <div className={styles.placeholderFooter}>
            <span className={styles.comingSoon}>Coming soon</span>
            <div className={styles.buildTrack} aria-hidden="true">
              <span />
              <strong>Building the next guide</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
