import type { Element } from 'hast'
import type { ReactElement } from 'react'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import ArticleImage from './ArticleImage'
import HeadingLink from './HeadingLink'
import type { ArticleStyles } from './types'

const EMBED_PROTOCOL = 'component:'

interface MarkdownArticleProps {
  content: string
  /** Feature stylesheet, so blog and guides can render the same markdown in different themes. */
  styles: ArticleStyles
  /**
   * Interactive components addressable from markdown as `![alt](component:<name>)`.
   * The alt text is forwarded as the embed's accessible label. Unregistered
   * names fall back to a regular ArticleImage (which renders nothing visible),
   * so a typo cannot break the article.
   */
  embeds?: Record<string, (_alt: string) => ReactElement>
}

function isImageParagraph(node?: Element): boolean {
  return Boolean(
    node &&
      node.children.length === 1 &&
      node.children[0].type === 'element' &&
      node.children[0].tagName === 'img'
  )
}

export default function MarkdownArticle({ content, styles, embeds }: MarkdownArticleProps): ReactElement {
  return (
    <div className={styles.articleBody}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        remarkPlugins={[remarkGfm]}
        // The default transform strips unknown protocols, which would erase
        // the `component:` embed markers before the img override sees them.
        urlTransform={(url) => (url.startsWith(EMBED_PROTOCOL) ? url : defaultUrlTransform(url))}
        components={{
          h1: ({ node: _node, ...props }) => (
            <HeadingLink as="h1" id={props.id} styles={styles}>
              {props.children}
            </HeadingLink>
          ),
          h2: ({ node: _node, ...props }) => (
            <HeadingLink as="h2" id={props.id} styles={styles}>
              {props.children}
            </HeadingLink>
          ),
          h3: ({ node: _node, ...props }) => (
            <HeadingLink as="h3" id={props.id} styles={styles}>
              {props.children}
            </HeadingLink>
          ),
          h4: ({ node: _node, ...props }) => (
            <HeadingLink as="h4" id={props.id} styles={styles}>
              {props.children}
            </HeadingLink>
          ),
          img: ({ node: _node, ...props }) => {
            const src = props.src ?? ''
            if (src.startsWith(EMBED_PROTOCOL)) {
              const embed = embeds?.[src.slice(EMBED_PROTOCOL.length)]
              if (embed) {
                return embed(props.alt ?? 'Interactive figure')
              }
            }
            return (
              <ArticleImage
                alt={props.alt ?? 'Article image'}
                src={src}
                title={props.title}
                styles={styles}
              />
            )
          },
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
