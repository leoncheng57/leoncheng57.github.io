import { useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import BlogMeta from '../components/BlogMeta'
import FontSizeControls from '../components/FontSizeControls'
import MarkdownArticle from '../components/MarkdownArticle'
import { getBlogPostBySlug } from '../content'
import styles from '../blog.module.css'

export default function BlogPostRoute(): ReactElement {
  const { slug = '' } = useParams()
  const post = getBlogPostBySlug(slug)
  const [fontScale, setFontScale] = useState(1)

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

  const articleStyle = {
    '--blog-font-size': `${1.05 * fontScale}rem`,
  } as CSSProperties

  return (
    <div className={styles.page}>
      <main className={styles.article} style={articleStyle}>
        <p className={styles.backLink}>
          <Link to="/blog">Back to blog</Link>
        </p>
        <article>
          <header className={styles.pageHeader}>
            <h1>{post.title}</h1>
            <p>{post.description}</p>
            <BlogMeta post={post} />
            <FontSizeControls
              onDecrease={() => setFontScale((current) => Math.max(0.9, current - 0.1))}
              onReset={() => setFontScale(1)}
              onIncrease={() => setFontScale((current) => Math.min(1.4, current + 0.1))}
            />
          </header>
          <MarkdownArticle content={post.content} />
        </article>
      </main>
    </div>
  )
}
