import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import GuideCard from '../components/GuideCard'
import { getAllGuides } from '../content'
import styles from '../guides-index.module.css'

export default function GuidesIndexRoute(): ReactElement {
  const guides = getAllGuides()

  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.index}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>
        <header className={styles.pageHeader}>
          <h1>Guides</h1>
          <p>
            Maintained, step-by-step references I keep up to date as the workflows change. Each guide
            opens as its own multi-chapter document.
          </p>
        </header>
        {guides.length === 0 ? (
          <p className={styles.emptyState}>No guides are published yet.</p>
        ) : (
          <div className={styles.guideList}>
            {guides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
