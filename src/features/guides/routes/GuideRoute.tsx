import { useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
// Guides reuse the blog article renderer and styling so long-form pages stay
// visually consistent across the site.
import FontSizeControls from '../../blog/components/FontSizeControls'
import MarkdownArticle from '../../blog/components/MarkdownArticle'
import styles from '../../blog/blog.module.css'
import GuideMeta from '../components/GuideMeta'
import { getGuideBySlug } from '../content'

export default function GuideRoute(): ReactElement {
  const { slug = '' } = useParams()
  const guide = getGuideBySlug(slug)
  const [fontScale, setFontScale] = useState(1)

  if (!guide) {
    return (
      <div className={styles.page}>
        <TopNav />
        <main className={styles.article}>
          <p className={styles.backLink}>
            <Link to="/guides">Back to guides</Link>
          </p>
          <h1>Guide not found</h1>
          <p>The requested guide does not exist.</p>
        </main>
      </div>
    )
  }

  const articleStyle = {
    '--blog-font-size': `${1.05 * fontScale}rem`,
  } as CSSProperties

  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.article} style={articleStyle}>
        <p className={styles.backLink}>
          <Link to="/guides">Back to guides</Link>
        </p>
        <article>
          <header className={styles.pageHeader}>
            <h1>{guide.title}</h1>
            <p>{guide.description}</p>
            <GuideMeta guide={guide} />
            <FontSizeControls
              onDecrease={() => setFontScale((current) => Math.max(0.9, current - 0.1))}
              onReset={() => setFontScale(1)}
              onIncrease={() => setFontScale((current) => Math.min(1.4, current + 0.1))}
            />
          </header>
          <MarkdownArticle content={guide.content} />
        </article>
      </main>
    </div>
  )
}
