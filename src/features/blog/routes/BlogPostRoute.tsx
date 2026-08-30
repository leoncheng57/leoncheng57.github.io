import { useRef, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import TopNav from '../../../components/top-nav/TopNav'
import BlogMeta from '../components/BlogMeta'
import BlogTableOfContents from '../components/BlogTableOfContents'
import HedwigHistoricalTimeline from '../components/HedwigHistoricalTimeline'
import SessionStoryboard from '../components/SessionStoryboard'
import HedwigToolsSimulation from '../components/HedwigToolsSimulation'
import type { HedwigToolId } from '../components/HedwigToolsSimulation'
import WaitingModesSimulator from '../components/WaitingModesSimulator'
import MobileScreenshotPair from '../components/MobileScreenshotPair'
import FontSizeControls from '../../../components/markdown/FontSizeControls'
import MarkdownArticle from '../../../components/markdown/MarkdownArticle'
import { getBlogPostBySlug } from '../content'
import styles from '../blog.module.css'

/** Interactive figures blog posts can embed via ![alt](component:<name>). */
const HEDWIG_COMPACT_EMBEDS: Record<string, HedwigToolId> = {
  'hedwig-tool-on-call': 'on-call',
  'hedwig-tool-remote-code': 'remote-code',
  'hedwig-tool-customer-api': 'customer-api',
  'hedwig-tool-databricks-mcp': 'databricks-mcp',
  'hedwig-tool-mcp-library': 'mcp-library',
  'hedwig-tool-slack-builder': 'slack-builder',
  'hedwig-tool-playgrounds-skills': 'playgrounds-skills',
  'hedwig-tool-cmd-k-discovery': 'cmd-k-discovery',
}

const BLOG_EMBEDS = {
  'session-storyboard': (alt: string) => <SessionStoryboard ariaLabel={alt} />,
  'hedwig-tools-simulation': (alt: string) => <HedwigToolsSimulation ariaLabel={alt} />,
  'hedwig-historical-timeline': () => <HedwigHistoricalTimeline />,
  'waiting-modes-simulator': (alt: string) => <WaitingModesSimulator ariaLabel={alt} />,
  'mobile-screenshot-pair': (alt: string) => <MobileScreenshotPair ariaLabel={alt} />,
  ...Object.fromEntries(
    Object.entries(HEDWIG_COMPACT_EMBEDS).map(([name, toolId]) => [
      name,
      (alt: string) => <HedwigToolsSimulation mode="compact" toolId={toolId} ariaLabel={alt} />,
    ])
  ),
}

export default function BlogPostRoute(): ReactElement {
  const { slug = '' } = useParams()
  const post = getBlogPostBySlug(slug)
  const [fontScale, setFontScale] = useState(1)
  const articleBodyRef = useRef<HTMLElement>(null)

  if (!post) {
    return (
      <div className={styles.page}>
        <TopNav />
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
  const isHedwigPost = post.slug === 'building-hedwig-ai-tooling-hub'

  const pageHeader = (
    <header className={styles.pageHeader}>
      <h1>{post.title}</h1>
      <p>{post.description}</p>
      <BlogMeta post={post} />
      <FontSizeControls
        onDecrease={() => setFontScale((current) => Math.max(0.9, current - 0.1))}
        onReset={() => setFontScale(1)}
        onIncrease={() => setFontScale((current) => Math.min(1.4, current + 0.1))}
        styles={styles}
      />
    </header>
  )

  return (
    <div className={styles.page}>
      <TopNav />
      {isHedwigPost ? (
        <main className={styles.articleWithToc} style={articleStyle}>
          <div className={styles.articleHeaderColumn}>
            <p className={styles.backLink}>
              <Link to="/blog">Back to blog</Link>
            </p>
            {pageHeader}
          </div>
          <div className={styles.articleReadingGrid}>
            <article ref={articleBodyRef} className={styles.articleBodyColumn}>
              <MarkdownArticle content={post.content} styles={styles} embeds={BLOG_EMBEDS} />
            </article>
            <BlogTableOfContents rootRef={articleBodyRef} contentKey={post.slug} />
          </div>
        </main>
      ) : (
        <main className={styles.article} style={articleStyle}>
          <p className={styles.backLink}>
            <Link to="/blog">Back to blog</Link>
          </p>
          <article>
            {pageHeader}
            <MarkdownArticle content={post.content} styles={styles} embeds={BLOG_EMBEDS} />
          </article>
        </main>
      )}
      <SiteFooter />
    </div>
  )
}
