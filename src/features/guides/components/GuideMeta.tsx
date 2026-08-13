import type { ReactElement } from 'react'
import TagList from '../../../components/markdown/TagList'
import styles from '../guides.module.css'
import type { Guide } from '../types'

interface GuideMetaProps {
  guide: Guide
  readingTimeMinutes?: number
}

export default function GuideMeta({ guide, readingTimeMinutes }: GuideMetaProps): ReactElement {
  return (
    <div className={styles.metaSection}>
      <div className={styles.meta}>
        <p>Last reviewed: {guide.updatedAt}</p>
        <p>Estimated reading time: {readingTimeMinutes ?? guide.readingTimeMinutes} min</p>
      </div>
      <TagList tags={guide.tags} styles={styles} label="Guide tags" />
    </div>
  )
}
