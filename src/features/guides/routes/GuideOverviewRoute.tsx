import { useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import FontSizeControls from '../../../components/markdown/FontSizeControls'
import MarkdownArticle from '../../../components/markdown/MarkdownArticle'
import GuideMeta from '../components/GuideMeta'
import GuideNotFound from '../components/GuideNotFound'
import { getGuideBySlug } from '../content'
import styles from '../guides.module.css'

export default function GuideOverviewRoute(): ReactElement {
  const { slug = '' } = useParams()
  const guide = getGuideBySlug(slug)
  const [fontScale, setFontScale] = useState(1)

  if (!guide) {
    return <GuideNotFound heading="Guide not found" message="The requested guide does not exist." />
  }

  const articleStyle = { '--gd-font-size': `${1.02 * fontScale}rem` } as CSSProperties
  const firstChapter = guide.chapters[0]

  return (
    <main className={styles.main} style={articleStyle}>
      <p className={styles.backLink}>
        <Link to="/guides">&larr; All guides</Link>
      </p>

      <article className={styles.article}>
        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Guide</p>
          <h1>{guide.title}</h1>
          <p>{guide.description}</p>
          {guide.audience ? <p className={styles.audience}>{guide.audience}</p> : null}
          <GuideMeta guide={guide} />
          <FontSizeControls
            onDecrease={() => setFontScale((current) => Math.max(0.9, current - 0.1))}
            onReset={() => setFontScale(1)}
            onIncrease={() => setFontScale((current) => Math.min(1.4, current + 0.1))}
            styles={styles}
          />
        </header>

        <MarkdownArticle content={guide.overview} styles={styles} />
      </article>

      {guide.chapters.length > 0 ? (
        <nav className={styles.contents} aria-label="Guide contents">
          <h2 className={styles.contentsHeading}>Contents</h2>
          <ol className={styles.contentsList}>
            {guide.chapters.map((chapter, index) => (
              <li key={chapter.slug}>
                <Link to={`/guides/${guide.slug}/${chapter.slug}`} className={styles.contentsLink}>
                  <span className={styles.contentsNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.contentsTitle}>
                    {chapter.title}
                    {chapter.description ? (
                      <span className={styles.contentsDescription}>{chapter.description}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {firstChapter ? (
        <div className={styles.pager}>
          <Link
            to={`/guides/${guide.slug}/${firstChapter.slug}`}
            className={`${styles.pagerLink} ${styles.pagerNext}`}
          >
            <span className={styles.pagerLabel}>Start reading</span>
            <span className={styles.pagerTitle}>{firstChapter.title}</span>
          </Link>
        </div>
      ) : null}
    </main>
  )
}
