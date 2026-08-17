import { useEffect, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import FontSizeControls from '../../../components/markdown/FontSizeControls'
import MarkdownArticle from '../../../components/markdown/MarkdownArticle'
import { groupChaptersByPart } from '../chapterGroups'
import GuideNotFound from '../components/GuideNotFound'
import { getGuideBySlug, getGuideChapter } from '../content'
import styles from '../guides.module.css'

const CHAPTER_LIST_ID = 'guide-chapter-list'

export default function GuideChapterRoute(): ReactElement {
  const { slug = '', chapterSlug = '' } = useParams()
  const guide = getGuideBySlug(slug)
  const [fontScale, setFontScale] = useState(1)
  const [navOpen, setNavOpen] = useState(false)

  // The mobile chapter list collapses again after navigating to a chapter.
  useEffect(() => {
    setNavOpen(false)
  }, [chapterSlug])

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
          <button
            type="button"
            className={styles.sidebarToggle}
            aria-expanded={navOpen}
            aria-controls={CHAPTER_LIST_ID}
            onClick={() => setNavOpen((open) => !open)}
          >
            Chapters
            <span className={styles.sidebarToggleIcon} aria-hidden="true">
              {navOpen ? '\u2212' : '+'}
            </span>
          </button>
          <div
            id={CHAPTER_LIST_ID}
            className={`${styles.sidebarBody} ${navOpen ? styles.sidebarBodyOpen : ''}`}
          >
            {groupChaptersByPart(guide.chapters).map((group) => (
              <div key={group.part || 'ungrouped'} className={styles.sidebarPart}>
                {group.part ? <p className={styles.sidebarPartLabel}>{group.part}</p> : null}
                <ol className={styles.sidebarList}>
                  {group.items.map(({ chapter: item, index: itemIndex }) => {
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
                          <span>
                            {item.title}
                            {item.beta ? <span className={styles.sidebarBeta}>beta</span> : null}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ))}
          </div>
        </nav>

        <article className={styles.article}>
          <header className={styles.pageHeader}>
            <p className={styles.eyebrow}>
              Chapter {String(index + 1).padStart(2, '0')} of{' '}
              {String(guide.chapters.length).padStart(2, '0')}
            </p>
            <h1>
              {chapter.title}
              {chapter.beta ? <span className={styles.betaPill}>Beta</span> : null}
            </h1>
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
