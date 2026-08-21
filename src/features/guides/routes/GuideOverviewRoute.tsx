import { useEffect, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import FontSizeControls from '../../../components/markdown/FontSizeControls'
import MarkdownArticle from '../../../components/markdown/MarkdownArticle'
import TagList from '../../../components/markdown/TagList'
import ChaptersNav from '../components/ChaptersNav'
import CmuxTrialWalkthrough from '../components/CmuxTrialWalkthrough'
import GuideNotFound from '../components/GuideNotFound'
import ManagerWorkerSimulator, {
  SIMULATOR_GUIDE_SLUG,
} from '../components/ManagerWorkerSimulator'
import OpenHandsIdeWalkthrough from '../components/OpenHandsIdeWalkthrough'
import { getGuideBySlug } from '../content'
import useScrollSpy from '../hooks/useScrollSpy'
import { splitMarkdownSections } from '../markdownSections'
import styles from '../guides.module.css'
import trialStyles from '../components/CmuxTrialWalkthrough/CmuxTrialWalkthrough.module.css'

/** The chapter slug whose section embeds the interactive simulator inline. */
const SIMULATOR_CHAPTER_SLUG = 'simulator'

/**
 * Interactive figures a guide can embed inline via
 * `![alt](component:<name>)`, the same mechanism blog posts use. Unlike the
 * simulator below — which the route appends after a specific chapter — these
 * render exactly where the markdown places them, so a walkthrough can stand
 * in for a screenshot mid-paragraph.
 */
const GUIDE_EMBEDS = {
  'openhands-ide-walkthrough': (alt: string) => <OpenHandsIdeWalkthrough ariaLabel={alt} />,
}

/**
 * The whole guide reads as a single page: hero, then every chapter in order
 * (the overview and the interactive simulator are chapters too). Old
 * per-chapter and playground URLs redirect here with the section anchor as
 * the location hash, which this route scrolls to on arrival.
 */
export default function GuideOverviewRoute(): ReactElement {
  const { slug = '' } = useParams()
  const { hash } = useLocation()
  const guide = getGuideBySlug(slug)
  const [fontScale, setFontScale] = useState(1)
  const activeSlug = useScrollSpy(guide ? guide.chapters.map((chapter) => chapter.slug) : [])

  // Scroll to the chapter anchor when arriving via a hash (for example from a
  // redirected legacy chapter URL) or when the hash changes in place.
  useEffect(() => {
    if (!hash) {
      return
    }
    document.getElementById(hash.slice(1))?.scrollIntoView?.({ block: 'start' })
  }, [hash])

  if (!guide) {
    return <GuideNotFound heading="Guide not found" message="The requested guide does not exist." />
  }

  const { intro, sections } = splitMarkdownSections(guide.overview)
  const firstChapter = guide.chapters[0]
  const hasSimulator = guide.slug === SIMULATOR_GUIDE_SLUG
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
          {hasSimulator ? (
            <a href={`#${SIMULATOR_CHAPTER_SLUG}`} className={styles.secondaryCta}>
              <span aria-hidden="true">👋</span>
              {'\u00A0'}Open the simulator
            </a>
          ) : null}
        </div>
      </header>

      {intro || sections.length > 0 ? (
        <div className={styles.overview}>
          {intro ? (
            <div className={styles.intro}>
              <MarkdownArticle content={intro} styles={styles} embeds={GUIDE_EMBEDS} />
            </div>
          ) : null}

          {sections.map((section) => (
            <section key={section.title} className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
              </div>
              <MarkdownArticle content={section.body} styles={styles} embeds={GUIDE_EMBEDS} />
            </section>
          ))}
        </div>
      ) : null}

      {guide.chapters.length > 0 ? (
        <div className={styles.chapterLayout}>
          <ChaptersNav chapters={guide.chapters} activeSlug={activeSlug} />

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
                <div className={styles.chaptersDivider} role="presentation">
                  <span className={styles.chaptersDividerLabel}>
                    Chapter {String(chapterIndex + 1).padStart(2, '0')} ·{' '}
                    {chapter.readingTimeMinutes} min
                  </span>
                </div>
                <header className={styles.chapterSectionHead}>
                  <h2 id={`${chapter.slug}-title`} className={styles.chapterSectionTitle}>
                    {chapter.title}
                    {chapter.beta ? <span className={styles.betaPill}>Beta</span> : null}
                  </h2>
                  {chapter.description ? (
                    <p className={styles.chapterSectionDescription}>{chapter.description}</p>
                  ) : null}
                </header>
                <MarkdownArticle content={chapter.content} styles={styles} embeds={GUIDE_EMBEDS} />
                {hasSimulator && chapter.slug === SIMULATOR_CHAPTER_SLUG ? (
                  <>
                    <h3 className={trialStyles.sectionHeading}>Try a run (guided)</h3>
                    <CmuxTrialWalkthrough />
                    <h3 className={trialStyles.sectionHeading}>Tune the knobs (sandbox)</h3>
                    <ManagerWorkerSimulator />
                  </>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  )
}
