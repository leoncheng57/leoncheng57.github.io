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
      {tags.map((tag) => (
        <li key={tag} className={styles.tag}>
          {tag}
        </li>
      ))}
    </ul>
  )
}
