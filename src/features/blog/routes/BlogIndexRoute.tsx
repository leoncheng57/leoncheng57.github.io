import { useState } from 'react'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import TagList from '../components/TagList'
import { getAllBlogPosts } from '../content'
import styles from '../blog.module.css'

export default function BlogIndexRoute(): ReactElement {
  const posts = getAllBlogPosts()
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort((left, right) =>
    left.localeCompare(right)
  )
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
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
        <div className={styles.filterControls}>
          <button
            type="button"
            className={styles.filterButton}
            aria-expanded={isFilterOpen}
            aria-controls="blog-tag-filters"
            onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
          >
            Filter tags{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}
          </button>
          {selectedTags.length > 0 ? (
            <button type="button" className={styles.clearFilterButton} onClick={() => setSelectedTags([])}>
              Clear filters
            </button>
          ) : null}
        </div>
        {isFilterOpen ? (
          <section id="blog-tag-filters" className={styles.filterPanel} aria-label="Filter posts by tag">
            <p>Show posts matching any selected tag.</p>
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
        <p className={styles.filterSummary} aria-live="polite">
          Showing {visiblePosts.length} of {posts.length} posts
        </p>
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
              <TagList tags={post.tags} />
            </article>
          ))}
          {visiblePosts.length === 0 ? <p className={styles.emptyState}>No posts match those tags.</p> : null}
        </div>
      </main>
    </div>
  )
}
