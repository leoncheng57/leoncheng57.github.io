import type { ReactElement, ReactNode } from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import FeedbackTrigger from '../feedback/FeedbackTrigger'
import styles from './site-footer.module.css'

type SiteFooterProps = {
  /** Optional page-specific row rendered above the standard footer line. */
  children?: ReactNode
  /** Extra class on the footer element, e.g. for per-page theming. */
  className?: string
}

/**
 * Design-system footer (#198): every page ends with a link back home, the
 * shared Google feedback form trigger, and a copyright line. Colors route
 * through `--sf-*` custom properties so themed pages can restyle it.
 */
export default function SiteFooter({
  children,
  className,
}: SiteFooterProps): ReactElement {
  return (
    <footer className={classNames(styles.footer, className)}>
      {children ? <div className={styles.extraRow}>{children}</div> : null}
      <div className={styles.mainRow}>
        <Link className={styles.homeLink} to="/">
          <span aria-hidden="true">&larr;</span> leoncheng.dev
        </Link>
        <FeedbackTrigger className={styles.feedbackTrigger} />
        <span className={styles.copyright}>
          &copy; {new Date().getFullYear()} Leon Cheng
        </span>
      </div>
    </footer>
  )
}
