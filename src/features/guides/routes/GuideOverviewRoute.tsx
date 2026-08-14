import type { ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import MarkdownArticle from '../../../components/markdown/MarkdownArticle'
import TagList from '../../../components/markdown/TagList'
import { groupChaptersByPart } from '../chapterGroups'
import GuideNotFound from '../components/GuideNotFound'
import { getGuideBySlug } from '../content'
import { splitMarkdownSections } from '../markdownSections'
import styles from '../guides.module.css'

export default function GuideOverviewRoute(): ReactElement {
  const { slug = '' } = useParams()
  const guide = getGuideBySlug(slug)

  if (!guide) {
    return <GuideNotFound heading="Guide not found" message="The requested guide does not exist." />
  }

  const { intro, sections } = splitMarkdownSections(guide.overview)
  const firstChapter = guide.chapters[0]

  return (
    <main className={styles.main}>
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
          <span>
            {guide.chapters.length} {guide.chapters.length === 1 ? 'chapter' : 'chapters'}
          </span>
          <span className={styles.metaSeparator} aria-hidden="true">
            ·
          </span>
          <span>{guide.readingTimeMinutes} min read</span>
        </p>
        <TagList tags={guide.tags} styles={styles} label="Guide tags" />
        <div className={styles.ctaRow}>
          {firstChapter ? (
            <Link to={`/guides/${guide.slug}/${firstChapter.slug}`} className={styles.primaryCta}>
              Start reading &rarr;
            </Link>
          ) : null}
          <a href="#guide-contents" className={styles.secondaryCta}>
            Contents
          </a>
        </div>
      </header>

      <div className={styles.overview}>
        {intro ? (
          <div className={styles.intro}>
            <MarkdownArticle content={intro} styles={styles} />
          </div>
        ) : null}

        {sections.map((section, index) => (
          <section key={section.title} className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionNumber} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
            </div>
            <MarkdownArticle content={section.body} styles={styles} />
          </section>
        ))}
      </div>

      {guide.chapters.length > 0 ? (
        <nav id="guide-contents" className={styles.contentsSection} aria-label="Guide contents">
          <h2 className={styles.contentsTitle}>Contents</h2>
          {groupChaptersByPart(guide.chapters).map((group) => (
            <div key={group.part || 'ungrouped'} className={styles.chapterPart}>
              {group.part ? <p className={styles.chapterPartLabel}>{group.part}</p> : null}
              <ol className={styles.chapterGrid}>
                {group.items.map(({ chapter, index }) => (
                  <li key={chapter.slug}>
                    <Link to={`/guides/${guide.slug}/${chapter.slug}`} className={styles.chapterCard}>
                      <span className={styles.chapterCardNumber} aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.chapterCardBody}>
                        <span className={styles.chapterCardTitle}>{chapter.title}</span>
                        {chapter.description ? (
                          <span className={styles.chapterCardDescription}>{chapter.description}</span>
                        ) : null}
                        <span className={styles.chapterCardMeta}>{chapter.readingTimeMinutes} min</span>
                      </span>
                      <span className={styles.chapterCardArrow} aria-hidden="true">
                        &rarr;
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </nav>
      ) : null}
    </main>
  )
}
