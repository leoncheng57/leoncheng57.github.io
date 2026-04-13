import type { ReactElement } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import styles from '../blog.module.css'

interface MarkdownArticleProps {
  content: string
}

export default function MarkdownArticle({ content }: MarkdownArticleProps): ReactElement {
  return (
    <div className={styles.articleBody}>
      <ReactMarkdown rehypePlugins={[rehypeSlug]} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
