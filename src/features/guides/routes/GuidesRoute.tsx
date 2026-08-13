import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import PlaceholderBanner from '../../../components/placeholder-banner/PlaceholderBanner'
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
        <PlaceholderBanner
          headingId="guides-placeholder-heading"
          description="Maintained, article-like resources are being assembled here. Each guide will get its own page when it is ready to share."
          buildLabel="Building the next guide"
        />
      </main>
    </div>
  )
}
