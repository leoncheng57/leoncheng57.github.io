import type { ReactElement } from 'react'
import FeedbackTrigger from '../../../components/feedback/FeedbackTrigger'
import styles from '../sub-wait.module.css'

/**
 * Sub-Wait's masthead feedback icon — a compact trigger for the shared
 * feedback dialog (see #152, #198). The page footer carries the standard
 * SiteFooter trigger; this stays as the "extra button" a page can add.
 */
export default function FeedbackButton(): ReactElement {
  return (
    <FeedbackTrigger variant="unstyled" className={styles.feedbackToggle}>
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      </svg>
    </FeedbackTrigger>
  )
}
