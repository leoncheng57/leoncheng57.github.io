import type { Element } from 'hast'
import type { ReactElement } from 'react'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import ArticleImage from './ArticleImage'
import HeadingLink from './HeadingLink'
import MermaidDiagram from './MermaidDiagram'
import type { ArticleStyles } from './types'

const EMBED_PROTOCOL = 'component:'
const FILE_LANGUAGE_PREFIX = 'language-file:'
const MERMAID_LANGUAGE = 'language-mermaid'
const MERMAID_TITLE = /^%%\s*title:\s*(.+?)\s*(?:\r?\n|$)/im
const MERMAID_SIZE = /^%%\s*size:\s*(compact|medium|full)\s*(?:\r?\n|$)/im

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

function isMermaidClassName(className?: string): boolean {
  return className?.split(/\s+/).includes(MERMAID_LANGUAGE) ?? false
}

function parseMermaidSource(value: string): { source: string; title: string; size: 'compact' | 'medium' | 'full' } {
  const source = value.replace(/\r?\n$/, '')
  const titleDirective = source.match(MERMAID_TITLE)
  const sizeDirective = source.match(MERMAID_SIZE)

  return {
    source: source.replace(MERMAID_TITLE, '').replace(MERMAID_SIZE, ''),
    title: titleDirective?.[1].trim() || 'Architecture diagram',
    size: (sizeDirective?.[1].toLowerCase() as 'compact' | 'medium' | 'full' | undefined) ?? 'full',
  }
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
          pre: ({ node, children, ...props }) => {
            const codeNode = node?.children[0]
            const isMermaid =
              codeNode?.type === 'element' &&
              isMermaidClassName(
                Array.isArray(codeNode.properties.className)
                  ? codeNode.properties.className.join(' ')
                  : String(codeNode.properties.className ?? '')
              )

            return isMermaid ? <>{children}</> : <pre {...props}>{children}</pre>
          },
          code: ({ node: _node, className, children, ...props }) => {
            if (isMermaidClassName(className)) {
              const diagram = parseMermaidSource(String(children))
              return <MermaidDiagram source={diagram.source} title={diagram.title} size={diagram.size} />
            }

            const filename = className?.startsWith(FILE_LANGUAGE_PREFIX)
              ? className.slice(FILE_LANGUAGE_PREFIX.length)
              : null

            return filename ? (
              <code className={className} data-kind="file" data-filename={filename} {...props}>
                <span data-file-label>{filename}</span>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
