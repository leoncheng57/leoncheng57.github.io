import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import PlaceholderBanner from '../../../components/placeholder-banner/PlaceholderBanner'
import TopNav from '../../../components/top-nav/TopNav'
// Guides reuse the blog layout system so long-form pages stay visually consistent.
import TagList from '../../blog/components/TagList'
import styles from '../../blog/blog.module.css'
import { getAllGuides } from '../content'

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
          <p>Maintained, step-by-step references I keep up to date as the workflows change.</p>
        </header>
        {guides.length === 0 ? (
          <PlaceholderBanner
            headingId="guides-placeholder-heading"
            description="Maintained, article-like resources are being assembled here. Each guide will get its own page when it is ready to share."
            buildLabel="Building the next guide"
          />
        ) : (
          <div className={styles.postList}>
            {guides.map((guide) => (
              <article key={guide.slug} className={styles.postCard}>
                <h2>
                  <Link to={`/guides/${guide.slug}`}>{guide.title}</Link>
                </h2>
                <p>{guide.description}</p>
                {guide.audience ? <p>{guide.audience}</p> : null}
                <div className={styles.indexMeta}>
                  <p>Last reviewed: {guide.updatedAt}</p>
                  <p>{guide.readingTimeMinutes} min read</p>
                </div>
                <TagList tags={guide.tags} />
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
