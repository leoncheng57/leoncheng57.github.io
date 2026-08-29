import { useState } from 'react'
import type { ReactElement } from 'react'
import { groupChaptersByPart } from '../chapterGroups'
import type { GuideChapter } from '../types'
import styles from '../guides.module.css'

interface ChaptersNavProps {
  chapters: GuideChapter[]
  /** The chapter currently scrolled into view (see useScrollSpy). */
  activeSlug?: string | null
  /** Unique id for the collapsible list container (aria-controls target). */
  listId?: string
}

/**
 * The guide one-pager's chapter TOC: a sticky bar that collapses to a single
 * row on narrow viewports (showing the chapter currently in view) and expands
 * to the grouped chapter list. Links are in-page anchors to chapter sections.
 */
export default function ChaptersNav({
  chapters,
  activeSlug = null,
  listId = 'guide-chapter-list',
}: ChaptersNavProps): ReactElement {
  const [navOpen, setNavOpen] = useState(false)
  const activeIndex = chapters.findIndex((chapter) => chapter.slug === activeSlug)
  const activeChapter = activeIndex >= 0 ? chapters[activeIndex] : null

  return (
    <nav className={styles.sidebar} aria-label="Guide chapters">
      <h2 className={styles.sidebarHeading}>Chapters</h2>
      <button
        type="button"
        className={styles.sidebarToggle}
        aria-expanded={navOpen}
        aria-controls={listId}
        onClick={() => setNavOpen((open) => !open)}
      >
        <span className={styles.sidebarToggleLabel}>Chapters</span>
        {activeChapter ? (
          <span className={styles.sidebarToggleCurrent}>
            {String(activeIndex + 1).padStart(2, '0')} · {activeChapter.title}
          </span>
        ) : null}
        <span className={styles.sidebarToggleIcon} aria-hidden="true">
          {navOpen ? '\u2212' : '+'}
        </span>
      </button>
      <div
        id={listId}
        className={`${styles.sidebarBody} ${navOpen ? styles.sidebarBodyOpen : ''}`}
      >
        {groupChaptersByPart(chapters).map((group) => (
          <div key={group.part || 'ungrouped'} className={styles.sidebarPart}>
            {group.part ? <p className={styles.sidebarPartLabel}>{group.part}</p> : null}
            <ol className={styles.sidebarList}>
              {group.items.map(({ chapter: item, index: itemIndex }) => (
                <li key={item.slug}>
                  <a
                    href={`#${item.slug}`}
                    className={`${styles.sidebarLink} ${
                      item.slug === activeSlug ? styles.sidebarLinkActive : ''
                    }`}
                    aria-current={item.slug === activeSlug ? 'true' : undefined}
                    onClick={() => setNavOpen(false)}
                  >
                    <span className={styles.sidebarNumber}>
                      {String(itemIndex + 1).padStart(2, '0')}
                    </span>
                    <span>
                      {item.title}
                      {item.beta ? <span className={styles.sidebarBeta}>beta</span> : null}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </nav>
  )
}
