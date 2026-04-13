import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { getAllBlogPosts } from '../content'
import styles from '../blog.module.css'

export default function BlogIndexRoute(): ReactElement {
  const posts = getAllBlogPosts()

  return (
    <div className={styles.page}>
      <main className={styles.index}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>
        <header className={styles.pageHeader}>
          <h1>Blog</h1>
          <p>Thoughts, notes, and experiments.</p>
        </header>
        <div className={styles.postList}>
          {posts.map((post) => (
            <article key={post.slug} className={styles.postCard}>
              <h2>
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.description}</p>
              <p className={styles.indexMeta}>
                {post.publishedAt} · {post.readingTimeMinutes} min read
              </p>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
