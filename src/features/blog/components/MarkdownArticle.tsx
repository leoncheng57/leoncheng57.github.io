import type { Element } from 'hast'
import type { ReactElement } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import ArticleImage from './ArticleImage'
import HeadingLink from './HeadingLink'
import styles from '../blog.module.css'

interface MarkdownArticleProps {
  content: string
}

function isImageParagraph(node?: Element): boolean {
  return Boolean(
    node &&
      node.children.length === 1 &&
      node.children[0].type === 'element' &&
      node.children[0].tagName === 'img'
  )
}

export default function MarkdownArticle({ content }: MarkdownArticleProps): ReactElement {
  return (
    <div className={styles.articleBody}>
      <ReactMarkdown
        rehypePlugins={[rehypeSlug]}
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node: _node, ...props }) => (
            <HeadingLink as="h1" id={props.id}>
              {props.children}
            </HeadingLink>
          ),
          h2: ({ node: _node, ...props }) => (
            <HeadingLink as="h2" id={props.id}>
              {props.children}
            </HeadingLink>
          ),
          h3: ({ node: _node, ...props }) => (
            <HeadingLink as="h3" id={props.id}>
              {props.children}
            </HeadingLink>
          ),
          h4: ({ node: _node, ...props }) => (
            <HeadingLink as="h4" id={props.id}>
              {props.children}
            </HeadingLink>
          ),
          img: ({ node: _node, ...props }) => (
            <ArticleImage alt={props.alt ?? 'Article image'} src={props.src ?? ''} title={props.title} />
          ),
          p: ({ node, ...props }) =>
            isImageParagraph(node as Element | undefined) ? (
              <div className={styles.figureBlock}>{props.children}</div>
            ) : (
              <p>{props.children}</p>
            ),
          blockquote: ({ node: _node, ...props }) => (
            <aside className={styles.calloutRow}>
              <div className={styles.calloutBox}>{props.children}</div>
            </aside>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
