import type { ReactElement, ReactNode } from 'react'
import { createElement } from 'react'
import styles from '../blog.module.css'

interface HeadingLinkProps {
  as: 'h1' | 'h2' | 'h3' | 'h4'
  id?: string
  children: ReactNode
}

function flattenChildren(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(flattenChildren).join('')
  }

  if (children && typeof children === 'object' && 'props' in children) {
    return flattenChildren(children.props.children as ReactNode)
  }

  return ''
}

export default function HeadingLink({ as, id, children }: HeadingLinkProps): ReactElement {
  const headingText = flattenChildren(children).trim()
  const heading = createElement(
    as,
    { id, className: styles.heading },
    <span>{children}</span>
  )

  return (
    <>
      <div className={styles.headingRow}>
        {heading}
        {id ? (
          <a
            href={`#${id}`}
            aria-label={`Link to section ${headingText}`}
            className={styles.headingAnchor}
          >
            <span aria-hidden="true">#</span>
          </a>
        ) : null}
      </div>
    </>
  )
}
