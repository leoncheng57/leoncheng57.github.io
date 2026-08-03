import type { ReactElement } from 'react'
import styles from '../blog.module.css'

interface TagListProps {
  tags: string[]
}

export default function TagList({ tags }: TagListProps): ReactElement | null {
  if (tags.length === 0) {
    return null
  }

  return (
    <ul className={styles.tagList} aria-label="Post tags">
      {tags.map((tag, index) => (
        <li key={tag} className={index === 0 ? `${styles.tag} ${styles.primaryTag}` : styles.tag}>
          {tag}
        </li>
      ))}
    </ul>
  )
}
