import type { ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import BlogMeta from '../components/BlogMeta'
import MarkdownArticle from '../components/MarkdownArticle'
import { getBlogPostBySlug } from '../content'
import styles from '../blog.module.css'

export default function BlogPostRoute(): ReactElement {
  const { slug = '' } = useParams()
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return (
      <div className={styles.page}>
        <main className={styles.article}>
          <p className={styles.backLink}>
            <Link to="/blog">Back to blog</Link>
          </p>
          <h1>Post not found</h1>
          <p>The requested article does not exist.</p>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <main className={styles.article}>
        <p className={styles.backLink}>
          <Link to="/blog">Back to blog</Link>
        </p>
        <article>
          <header className={styles.pageHeader}>
            <h1>{post.title}</h1>
            <p>{post.description}</p>
            <BlogMeta post={post} />
          </header>
          <MarkdownArticle content={post.content} />
        </article>
      </main>
    </div>
  )
}
