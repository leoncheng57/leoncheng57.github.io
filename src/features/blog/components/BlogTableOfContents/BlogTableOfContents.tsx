import { useEffect, useId, useLayoutEffect, useState } from 'react'
import type { ReactElement, RefObject } from 'react'
import styles from './BlogTableOfContents.module.css'

interface BlogTableOfContentsProps {
  rootRef: RefObject<HTMLElement | null>
  contentKey: string | number
  label?: string
}

interface TocHeading {
  id: string
  level: 2 | 3
  text: string
  element: HTMLHeadingElement
}

interface TocSection {
  heading: TocHeading
  children: TocHeading[]
}

function groupHeadings(headings: TocHeading[]): TocSection[] {
  const sections: TocSection[] = []

  for (const heading of headings) {
    if (
      heading.level === 2 ||
      sections.length === 0 ||
      sections[sections.length - 1].heading.level === 3
    ) {
      sections.push({ heading, children: [] })
    } else {
      sections[sections.length - 1].children.push(heading)
    }
  }

  return sections
}

export default function BlogTableOfContents({
  rootRef,
  contentKey,
  label = 'Table of contents',
}: BlogTableOfContentsProps): ReactElement | null {
  const [headings, setHeadings] = useState<TocHeading[]>([])
  const [activeId, setActiveId] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const listId = useId()

  useLayoutEffect(() => {
    const nextHeadings = Array.from(
      rootRef.current?.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]') ?? []
    ).map((element) => ({
      id: element.id,
      level: element.tagName === 'H2' ? 2 : 3,
      text: element.textContent?.trim() ?? '',
      element,
    }) satisfies TocHeading)

    setHeadings(nextHeadings)
    setActiveId(nextHeadings[0]?.id ?? '')
    setIsOpen(false)
  }, [contentKey, rootRef])

  useEffect(() => {
    if (headings.length === 0) {
      return undefined
    }

    const visibleIds = new Set<string>()
    const headingOrder = headings.map(({ id }) => id)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id
          if (entry.isIntersecting) {
            visibleIds.add(id)
          } else {
            visibleIds.delete(id)
          }
        }

        const nextActiveId = headingOrder.find((id) => visibleIds.has(id))
        if (nextActiveId) {
          setActiveId(nextActiveId)
        }
      },
      { rootMargin: '0px 0px -70% 0px' }
    )

    headings.forEach(({ element }) => observer.observe(element))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  const sections = groupHeadings(headings)
  const renderLink = (heading: TocHeading) => (
    <a
      href={`#${heading.id}`}
      className={heading.level === 3 ? styles.subsectionLink : styles.sectionLink}
      aria-current={activeId === heading.id ? 'location' : undefined}
      onClick={() => setIsOpen(false)}
    >
      {heading.text}
    </a>
  )

  return (
    <nav className={styles.tableOfContents} aria-label={label}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{label}</span>
        <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>
      <div className={styles.railLabel}>{label}</div>
      <ol id={listId} className={styles.list} data-open={isOpen || undefined}>
        {sections.map(({ heading, children }) => (
          <li key={heading.id} className={heading.level === 3 ? styles.orphanSubsection : undefined}>
            {renderLink(heading)}
            {children.length > 0 ? (
              <ol className={styles.subsectionList}>
                {children.map((child) => (
                  <li key={child.id}>{renderLink(child)}</li>
                ))}
              </ol>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
