import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import styles from '../guides-index.module.css'
import type { Guide } from '../types'
import GuideRepoReference from './GuideRepoReference'

interface GuideCardProps {
  guide: Guide
}

const PREVIEW_CHAPTER_COUNT = 3

export default function GuideCard({ guide }: GuideCardProps): ReactElement {
  const guidePath = `/guides/${guide.slug}`
  const previewChapters = guide.chapters.slice(0, PREVIEW_CHAPTER_COUNT)
  const remainingChapters = guide.chapters.length - previewChapters.length

  return (
    <article className={styles.guideCard}>
      <div className={styles.cardChrome}>
        <span className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <p className={styles.cardPath}>~/guides/{guide.slug}</p>
      </div>

      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>
          <span className={styles.prompt} aria-hidden="true">
            $
          </span>
          <Link to={guidePath}>{guide.title}</Link>
          {guide.beta ? <span className={styles.betaBadge}>BETA</span> : null}
        </h2>

        <p className={styles.description}>{guide.description}</p>

        <GuideRepoReference
          repoUrl={guide.repoUrl}
          repoAccess={guide.repoAccess}
          repoScope={guide.repoScope}
        />

        <p className={styles.cardMeta}>
          <span>updated {guide.updatedAt}</span>
          {guide.chapters.length > 0 ? (
            <>
              <span className={styles.separator} aria-hidden="true">
                ·
              </span>
              <span>
                {guide.chapters.length} {guide.chapters.length === 1 ? 'chapter' : 'chapters'}
              </span>
            </>
          ) : null}
          <span className={styles.separator} aria-hidden="true">
            ·
          </span>
          <span>{guide.readingTimeMinutes} min read</span>
        </p>

        {guide.tags.length > 0 ? (
          <ul className={styles.tagRow} aria-label="Guide tags">
            {guide.tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}

        {previewChapters.length > 0 ? (
          <ol className={styles.chapterPreview}>
            {previewChapters.map((chapter, index) => (
              <li key={chapter.slug}>
                <span className={styles.chapterNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{chapter.title}</span>
              </li>
            ))}
            {remainingChapters > 0 ? (
              <li className={styles.more}>
                <span aria-hidden="true">..</span>
                <span>+{remainingChapters} more</span>
              </li>
            ) : null}
          </ol>
        ) : null}

        <p className={styles.cardCta}>
          <Link to={guidePath}>read guide &rarr;</Link>
        </p>
      </div>
    </article>
  )
}
