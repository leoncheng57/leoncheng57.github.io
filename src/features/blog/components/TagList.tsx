import type { ReactElement } from 'react'
import styles from '../blog.module.css'

interface TagListProps {
  tags: string[]
  selectedTags?: string[]
  onTagClick?: (_tag: string) => void
}

export default function TagList({ tags, selectedTags = [], onTagClick }: TagListProps): ReactElement | null {
  if (tags.length === 0) {
    return null
  }

  return (
    <ul className={styles.tagList} aria-label="Post tags">
      {tags.map((tag) => (
        <li key={tag}>
          {onTagClick ? (
            <button
              type="button"
              className={`${styles.tag} ${styles.tagButton} ${selectedTags.includes(tag) ? styles.selectedTag : ''}`}
              onClick={() => onTagClick(tag)}
            >
              {tag}
            </button>
          ) : (
            <span className={styles.tag}>{tag}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
