import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import TagList from '../../../components/markdown/TagList'
import { getAllBlogPosts } from '../content'
import styles from '../blog.module.css'

export default function BlogIndexRoute(): ReactElement {
  const posts = getAllBlogPosts()
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort((left, right) =>
    left.localeCompare(right)
  )
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const filterAreaRef = useRef<HTMLDivElement>(null)
  const visiblePosts =
    selectedTags.length === 0
      ? posts
      : posts.filter((post) => selectedTags.some((tag) => post.tags.includes(tag)))

  function toggleTag(tag: string): void {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag]
    )
  }

  function addTag(tag: string): void {
    setSelectedTags((currentTags) => (currentTags.includes(tag) ? currentTags : [...currentTags, tag]))
    setIsFilterOpen(true)
  }

  useEffect(() => {
    if (!isFilterOpen) {
      return
    }

    function closeOnPointerDown(event: PointerEvent): void {
      if (!filterAreaRef.current?.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }

    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setIsFilterOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnPointerDown)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isFilterOpen])

  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.index}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>
        <header className={styles.pageHeader}>
          <h1>Blog</h1>
          <p>Thoughts, notes, and experiments.</p>
        </header>
        <div ref={filterAreaRef} className={styles.filterArea}>
          <div className={styles.filterControls}>
            <button
              type="button"
              className={styles.filterButton}
              aria-label="Filter tags"
              aria-expanded={isFilterOpen}
              aria-controls="blog-tag-filters"
              onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 5h14M6 10h8M8.5 15h3" />
              </svg>
              <span>Filter</span>
              <span className={styles.filterChevron} aria-hidden="true">⌄</span>
            </button>
            {selectedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={styles.activeFilter}
                aria-label={`Remove ${tag} filter`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <span aria-hidden="true">×</span>
              </button>
            ))}
            {selectedTags.length > 1 ? (
              <button
                type="button"
                className={styles.clearFilterButton}
                aria-label="Clear filters"
                onClick={() => setSelectedTags([])}
              >
                Clear
              </button>
            ) : null}
          </div>
          {isFilterOpen ? (
            <section id="blog-tag-filters" className={styles.filterPanel} aria-label="Filter posts by tag">
              <p>Match any selected tag</p>
              <div className={styles.filterOptions}>
                {allTags.map((tag) => (
                  <label key={tag} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        {selectedTags.length > 0 ? (
          <p className={styles.filterSummary} aria-live="polite">
            Showing {visiblePosts.length} of {posts.length} posts
          </p>
        ) : null}
        <div className={styles.postList}>
          {visiblePosts.map((post) => (
            <article key={post.slug} className={styles.postCard}>
              <h2>
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.description}</p>
              <div className={styles.indexMeta}>
                <p>{post.publishedAt}</p>
                <p>{post.readingTimeMinutes} min read</p>
              </div>
              <TagList
                tags={post.tags}
                selectedTags={selectedTags}
                onTagClick={addTag}
                styles={styles}
              />
            </article>
          ))}
          {visiblePosts.length === 0 ? <p className={styles.emptyState}>No posts match those tags.</p> : null}
        </div>
      </main>
    </div>
  )
}
