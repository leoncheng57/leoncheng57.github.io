import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TagList from '../../../components/markdown/TagList'
import { getAllGuides } from '../content'
import styles from '../guides.module.css'

export default function GuidesIndexRoute(): ReactElement {
  const guides = getAllGuides()

  return (
    <main className={styles.main}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Living documentation</p>
        <h1>Guides</h1>
        <p>
          Maintained, step-by-step references I keep up to date as the workflows change. Each guide is
          split into chapters you can read in order or jump between.
        </p>
      </header>

      {guides.length === 0 ? (
        <p className={styles.emptyState}>No guides are published yet.</p>
      ) : (
        <div className={styles.guideList}>
          {guides.map((guide) => (
            <article key={guide.slug} className={styles.guideCard}>
              <h2>
                <Link to={`/guides/${guide.slug}`}>{guide.title}</Link>
              </h2>
              <p>{guide.description}</p>
              {guide.audience ? <p className={styles.audience}>{guide.audience}</p> : null}
              <div className={styles.cardMeta}>
                <p>Last reviewed: {guide.updatedAt}</p>
                <p>
                  {guide.chapters.length} {guide.chapters.length === 1 ? 'chapter' : 'chapters'}
                </p>
                <p>{guide.readingTimeMinutes} min read</p>
              </div>
              <TagList tags={guide.tags} styles={styles} label="Guide tags" />
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
