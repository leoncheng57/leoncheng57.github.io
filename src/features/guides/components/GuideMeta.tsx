import type { ReactElement } from 'react'
// Guides intentionally reuse the blog article styling and tag chips so long-form
// pages render identically across both sections of the site.
import TagList from '../../blog/components/TagList'
import styles from '../../blog/blog.module.css'
import type { Guide } from '../types'

interface GuideMetaProps {
  guide: Guide
}

export default function GuideMeta({ guide }: GuideMetaProps): ReactElement {
  return (
    <div className={styles.metaSection}>
      <div className={styles.meta}>
        <p>Last reviewed: {guide.updatedAt}</p>
        <p>Estimated reading time: {guide.readingTimeMinutes} min</p>
      </div>
      <TagList tags={guide.tags} />
    </div>
  )
}
