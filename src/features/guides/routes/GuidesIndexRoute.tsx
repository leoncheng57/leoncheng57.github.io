import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import TopNav from '../../../components/top-nav/TopNav'
import GuideCard from '../components/GuideCard'
import { getAllGuides } from '../content'
import { getSetupGuides } from '../setupGuides'
import styles from '../guides-index.module.css'

export default function GuidesIndexRoute(): ReactElement {
  const guides = [...getAllGuides(), ...getSetupGuides()]

  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.index}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>
        <header className={styles.pageHeader}>
          <div className={styles.titleRow}>
            <h1>Guides</h1>
            <span className={styles.betaBadge}>BETA</span>
          </div>
          <p>
            Maintained, step-by-step references I keep up to date as the workflows change. Each guide
            opens as its own multi-chapter document. This section is still taking shape.
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
      <SiteFooter />
    </div>
  )
}
