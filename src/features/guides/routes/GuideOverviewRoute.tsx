import { useEffect, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import FontSizeControls from '../../../components/markdown/FontSizeControls'
import MarkdownArticle from '../../../components/markdown/MarkdownArticle'
import TagList from '../../../components/markdown/TagList'
import { groupChaptersByPart } from '../chapterGroups'
import GuideNotFound from '../components/GuideNotFound'
import { SIMULATOR_GUIDE_SLUG } from '../components/ManagerWorkerSimulator'
import { getGuideBySlug } from '../content'
import { splitMarkdownSections } from '../markdownSections'
import styles from '../guides.module.css'

const CHAPTER_LIST_ID = 'guide-chapter-list'

/**
 * The whole guide reads as a single page: hero, overview, then every chapter
 * in order. Old per-chapter URLs redirect here with the chapter slug as the
 * location hash, which this route scrolls to on arrival.
 */
export default function GuideOverviewRoute(): ReactElement {
  const { slug = '' } = useParams()
  const { hash } = useLocation()
  const guide = getGuideBySlug(slug)
  const [fontScale, setFontScale] = useState(1)
  const [navOpen, setNavOpen] = useState(false)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  // Scroll to the chapter anchor when arriving via a hash (for example from a
  // redirected legacy chapter URL) or when the hash changes in place.
  useEffect(() => {
    if (!hash) {
      return
    }
    document.getElementById(hash.slice(1))?.scrollIntoView?.({ block: 'start' })
  }, [hash])

  // Scrollspy: the chapter section crossing the middle band of the viewport is
  // the "current" chapter, shown in the collapsed Chapters bar and highlighted
  // in the list. Skipped in environments without IntersectionObserver (jsdom).
  const chapterSlugs = guide ? guide.chapters.map((chapter) => chapter.slug).join(',') : ''
  useEffect(() => {
    if (!chapterSlugs || typeof IntersectionObserver === 'undefined') {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id)
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    for (const chapterSlug of chapterSlugs.split(',')) {
      const element = document.getElementById(chapterSlug)
      if (element) {
        observer.observe(element)
      }
    }
    return () => observer.disconnect()
  }, [chapterSlugs])

  if (!guide) {
    return <GuideNotFound heading="Guide not found" message="The requested guide does not exist." />
  }

  const { intro, sections } = splitMarkdownSections(guide.overview)
  const firstChapter = guide.chapters[0]
  const activeChapterIndex = guide.chapters.findIndex((chapter) => chapter.slug === activeSlug)
  const activeChapter =
    activeChapterIndex >= 0
      ? { chapter: guide.chapters[activeChapterIndex], index: activeChapterIndex }
      : null
  const articleStyle = { '--gd-font-size': `${1.02 * fontScale}rem` } as CSSProperties

  return (
    <main className={styles.main} style={articleStyle}>
      <p className={styles.backLink}>
        <Link to="/guides">&larr; All guides</Link>
      </p>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>~/guides/{guide.slug}</p>
        <h1 className={styles.heroTitle}>{guide.title}</h1>
        <p className={styles.heroDescription}>{guide.description}</p>
        {guide.audience ? <p className={styles.audience}>{guide.audience}</p> : null}
        <p className={styles.heroMeta}>
          <span>Last reviewed {guide.updatedAt}</span>
          <span className={styles.metaSeparator} aria-hidden="true">
            ·
          </span>
          <span>{guide.readingTimeMinutes} min read</span>
        </p>
        <TagList tags={guide.tags} styles={styles} label="Guide tags" />
        <div className={styles.ctaRow}>
          {firstChapter ? (
            <a href={`#${firstChapter.slug}`} className={styles.primaryCta}>
              Start reading &rarr;
            </a>
          ) : null}
          {guide.slug === SIMULATOR_GUIDE_SLUG ? (
            <Link to={`/guides/${guide.slug}/playground`} className={styles.secondaryCta}>
              <span aria-hidden="true">👋</span>
              {'\u00A0'}Open the simulator
            </Link>
          ) : null}
        </div>
      </header>

      <div className={styles.overview}>
        {intro ? (
          <div className={styles.intro}>
            <MarkdownArticle content={intro} styles={styles} />
          </div>
        ) : null}

        {sections.map((section) => (
          <section key={section.title} className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
            </div>
            <MarkdownArticle content={section.body} styles={styles} />
          </section>
        ))}
      </div>

      {guide.chapters.length > 0 ? (
        <>
          <div className={styles.chaptersDivider} role="presentation">
            <span className={styles.chaptersDividerLabel}>Chapters</span>
          </div>

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
              <span className={styles.sidebarToggleLabel}>Chapters</span>
              {activeChapter ? (
                <span className={styles.sidebarToggleCurrent}>
                  {String(activeChapter.index + 1).padStart(2, '0')} ·{' '}
                  {activeChapter.chapter.title}
                </span>
              ) : null}
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
                    {group.items.map(({ chapter: item, index: itemIndex }) => (
                      <li key={item.slug}>
                        <a
                          href={`#${item.slug}`}
                          className={`${styles.sidebarLink} ${
                            item.slug === activeSlug ? styles.sidebarLinkActive : ''
                          }`}
                          aria-current={item.slug === activeSlug ? 'true' : undefined}
                          onClick={() => setNavOpen(false)}
                        >
                          <span className={styles.sidebarNumber}>
                            {String(itemIndex + 1).padStart(2, '0')}
                          </span>
                          <span>
                            {item.title}
                            {item.beta ? <span className={styles.sidebarBeta}>beta</span> : null}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </nav>

          <div className={styles.article}>
            <div className={styles.readerControls}>
              <FontSizeControls
                onDecrease={() => setFontScale((current) => Math.max(0.9, current - 0.1))}
                onReset={() => setFontScale(1)}
                onIncrease={() => setFontScale((current) => Math.min(1.4, current + 0.1))}
                styles={styles}
              />
            </div>

            {guide.chapters.map((chapter, chapterIndex) => (
              <section
                key={chapter.slug}
                id={chapter.slug}
                className={styles.chapterSection}
                aria-labelledby={`${chapter.slug}-title`}
              >
                <header className={styles.chapterSectionHead}>
                  <p className={styles.eyebrow}>
                    Chapter {String(chapterIndex + 1).padStart(2, '0')} ·{' '}
                    {chapter.readingTimeMinutes} min
                  </p>
                  <h2 id={`${chapter.slug}-title`} className={styles.chapterSectionTitle}>
                    {chapter.title}
                    {chapter.beta ? <span className={styles.betaPill}>Beta</span> : null}
                  </h2>
                  {chapter.description ? (
                    <p className={styles.chapterSectionDescription}>{chapter.description}</p>
                  ) : null}
                </header>
                <MarkdownArticle content={chapter.content} styles={styles} />
              </section>
            ))}
            </div>
          </div>
        </>
      ) : null}
    </main>
  )
}
