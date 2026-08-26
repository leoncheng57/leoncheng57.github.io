import { useId, useState } from 'react'
import type { ReactElement } from 'react'
import styles from './TableOfContents.module.css'

export interface TableOfContentsItem {
  id: string
  text: string
  level: 2 | 3
}

interface TableOfContentsProps {
  items: TableOfContentsItem[]
  activeId: string
  label?: string
}

interface TableOfContentsSection {
  item: TableOfContentsItem
  children: TableOfContentsItem[]
}

function groupItems(items: TableOfContentsItem[]): TableOfContentsSection[] {
  const sections: TableOfContentsSection[] = []

  for (const item of items) {
    const precedingSection = sections[sections.length - 1]
    if (item.level === 3 && precedingSection?.item.level === 2) {
      precedingSection.children.push(item)
    } else {
      sections.push({ item, children: [] })
    }
  }

  return sections
}

export default function TableOfContents({
  items,
  activeId,
  label = 'Table of contents',
}: TableOfContentsProps): ReactElement | null {
  const [isOpen, setIsOpen] = useState(false)
  const listId = useId()

  if (items.length === 0) {
    return null
  }

  const activeItem = items.find((item) => item.id === activeId)
  const sections = groupItems(items)
  const renderLink = (item: TableOfContentsItem) => (
    <a
      href={`#${item.id}`}
      className={item.level === 3 ? styles.subsectionLink : styles.sectionLink}
      aria-current={activeId === item.id ? 'location' : undefined}
      onClick={() => setIsOpen(false)}
    >
      {item.text}
    </a>
  )

  return (
    <nav className={styles.tableOfContents} aria-label={label}>
      <button
        type="button"
        className={styles.toggle}
        aria-label={activeItem ? `${label} ${activeItem.text}` : label}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={styles.toggleText}>
          <span className={styles.toggleLabel}>{label}</span>
          {activeItem ? <span className={styles.activeHeading}>{activeItem.text}</span> : null}
        </span>
        <span className={styles.icon} aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>
      <div className={styles.railLabel}>{label}</div>
      <ol id={listId} className={styles.list} data-open={isOpen || undefined}>
        {sections.map(({ item, children }) => (
          <li key={item.id}>
            {renderLink(item)}
            {children.length > 0 ? (
              <ol className={styles.subsectionList}>
                {children.map((child) => <li key={child.id}>{renderLink(child)}</li>)}
              </ol>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
