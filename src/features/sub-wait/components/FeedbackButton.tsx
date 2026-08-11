import { useEffect, useId, useRef, useState, type ReactElement } from 'react'
import styles from '../sub-wait.module.css'
import { buildEmbeddedFeedbackUrl, buildFeedbackUrl } from './feedbackConfig'

export default function FeedbackButton(): ReactElement | null {
  const [isOpen, setIsOpen] = useState(false)
  const dialogId = useId()
  const titleId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const feedbackUrl = buildFeedbackUrl(window.location.pathname)
  const embeddedFeedbackUrl = buildEmbeddedFeedbackUrl(window.location.pathname)

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
    <>
      <button
        ref={triggerRef}
        className={styles.feedbackToggle}
        type="button"
        aria-label="Send feedback"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
        onClick={() => setIsOpen(true)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={styles.feedbackBackdrop}
          data-testid="feedback-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              close()
            }
          }}
        >
          <section
            id={dialogId}
            className={styles.feedbackDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button
              ref={closeRef}
              className={styles.feedbackClose}
              type="button"
              aria-label="Close feedback"
              onClick={close}
            >
              <span aria-hidden="true">&#215;</span>
            </button>
            <p id={titleId} className={styles.feedbackCopy}>
              Found a bug or have an idea? Feedback may be reviewed and turned
              into a public GitHub issue.
            </p>
            {embeddedFeedbackUrl && feedbackUrl ? (
              <>
                <iframe
                  className={styles.feedbackFrame}
                  src={embeddedFeedbackUrl}
                  title="Feedback form"
                  loading="lazy"
                />
                <footer className={styles.feedbackFooter}>
                  <a
                    className={styles.feedbackNewTabLink}
                    href={feedbackUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open feedback form in a new tab &#8599;
                  </a>
                </footer>
              </>
            ) : (
              <span className={styles.feedbackUnconfigured}>
                Form URL not configured
              </span>
            )}
          </section>
        </div>
      )}
    </>
  )
}
