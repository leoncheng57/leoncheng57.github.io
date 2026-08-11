import { useEffect, useId, useRef, useState, type ReactElement } from 'react'
import { buildFeedbackUrl } from './feedbackConfig'
import styles from './feedback-button.module.css'

export default function FeedbackButton(): ReactElement | null {
  const [isOpen, setIsOpen] = useState(false)
  const dialogId = useId()
  const titleId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const feedbackUrl = buildFeedbackUrl(window.location.pathname)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    closeRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  if (import.meta.env.PROD && !feedbackUrl) {
    return null
  }

  const close = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className={styles.feedback}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        aria-label="Send feedback"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
        onClick={() => setIsOpen(true)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={styles.backdrop}
          data-testid="feedback-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              close()
            }
          }}
        >
          <section
            id={dialogId}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button
              ref={closeRef}
              className={styles.close}
              type="button"
              aria-label="Close feedback"
              onClick={close}
            >
              <span aria-hidden="true">&#215;</span>
            </button>
            <p id={titleId} className={styles.copy}>
              Found a bug or have an idea? Feedback may be reviewed and turned
              into a public GitHub issue.
            </p>
            {feedbackUrl ? (
              <a
                className={styles.link}
                href={feedbackUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open feedback form
              </a>
            ) : (
              <span className={styles.unconfigured}>Form URL not configured</span>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
