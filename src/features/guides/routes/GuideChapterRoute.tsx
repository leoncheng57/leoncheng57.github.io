import { useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import FontSizeControls from '../../../components/markdown/FontSizeControls'
import MarkdownArticle from '../../../components/markdown/MarkdownArticle'
import GuideNotFound from '../components/GuideNotFound'
import { getGuideBySlug, getGuideChapter } from '../content'
import styles from '../guides.module.css'

export default function GuideChapterRoute(): ReactElement {
  const { slug = '', chapterSlug = '' } = useParams()
  const guide = getGuideBySlug(slug)
  const [fontScale, setFontScale] = useState(1)

  if (!guide) {
    return <GuideNotFound heading="Guide not found" message="The requested guide does not exist." />
  }

  const found = getGuideChapter(guide, chapterSlug)

  if (!found) {
    return (
      <GuideNotFound
        heading="Chapter not found"
        message={`"${guide.title}" does not have that chapter.`}
      />
    )
  }

  const { chapter, index } = found
  const previous = index > 0 ? guide.chapters[index - 1] : undefined
  const next = index < guide.chapters.length - 1 ? guide.chapters[index + 1] : undefined
  const articleStyle = { '--gd-font-size': `${1.02 * fontScale}rem` } as CSSProperties

  return (
    <main className={styles.main} style={articleStyle}>
      <p className={styles.backLink}>
        <Link to={`/guides/${guide.slug}`}>&larr; {guide.title}</Link>
      </p>

      <div className={styles.chapterLayout}>
        <nav className={styles.sidebar} aria-label="Guide chapters">
          <h2 className={styles.sidebarHeading}>Chapters</h2>
          <ol className={styles.sidebarList}>
            {guide.chapters.map((item, itemIndex) => {
              const isActive = item.slug === chapter.slug
              return (
                <li key={item.slug}>
                  <Link
                    to={`/guides/${guide.slug}/${item.slug}`}
                    className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={styles.sidebarNumber}>
                      {String(itemIndex + 1).padStart(2, '0')}
                    </span>
                    <span>{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>

        <article className={styles.article}>
          <header className={styles.pageHeader}>
            <p className={styles.eyebrow}>
              Chapter {String(index + 1).padStart(2, '0')} of{' '}
              {String(guide.chapters.length).padStart(2, '0')}
            </p>
            <h1>{chapter.title}</h1>
            {chapter.description ? <p>{chapter.description}</p> : null}
            <div className={styles.metaSection}>
              <div className={styles.meta}>
                <p>Last reviewed: {guide.updatedAt}</p>
                <p>Estimated reading time: {chapter.readingTimeMinutes} min</p>
              </div>
              <FontSizeControls
                onDecrease={() => setFontScale((current) => Math.max(0.9, current - 0.1))}
                onReset={() => setFontScale(1)}
                onIncrease={() => setFontScale((current) => Math.min(1.4, current + 0.1))}
                styles={styles}
              />
            </div>
          </header>

          <MarkdownArticle content={chapter.content} styles={styles} />

          <div className={styles.pager}>
            {previous ? (
              <Link to={`/guides/${guide.slug}/${previous.slug}`} className={styles.pagerLink}>
                <span className={styles.pagerLabel}>Previous</span>
                <span className={styles.pagerTitle}>{previous.title}</span>
              </Link>
            ) : null}
            {next ? (
              <Link
                to={`/guides/${guide.slug}/${next.slug}`}
                className={`${styles.pagerLink} ${styles.pagerNext}`}
              >
                <span className={styles.pagerLabel}>Next</span>
                <span className={styles.pagerTitle}>{next.title}</span>
              </Link>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  )
}
