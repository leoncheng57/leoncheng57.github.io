import { useEffect, useId, useRef, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import {
  createInstallPlatformGuides,
  detectInstallPlatforms,
} from './installPlatforms'
import styles from './pwa-install.module.css'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

type InstallHelpModalProps = {
  appName: string
  guidePath: string
  iconSrc: string
  onClose: () => void
  returnFocusTo: HTMLElement | null
}

export default function InstallHelpModal({
  appName,
  guidePath,
  iconSrc,
  onClose,
  returnFocusTo,
}: InstallHelpModalProps): ReactElement {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()
  const sectionId = useId()
  const guides = createInstallPlatformGuides(appName)
  const platforms = detectInstallPlatforms(
    navigator.userAgent,
    navigator.platform,
    navigator.maxTouchPoints,
  )
  onCloseRef.current = onClose

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      returnFocusTo?.focus()
    }
  }, [returnFocusTo])

  return (
    <div
      className={styles.backdrop}
      data-testid="install-help-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.header}>
          <img src={iconSrc} alt="" width={42} height={42} />
          <h2 id={titleId}>Install {appName}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close installation help"
          >
            Close
          </button>
        </header>
        <div className={styles.body}>
          {platforms.map((platform) => {
            const guide = guides[platform]
            const headingId = `${sectionId}-${platform}`
            return (
              <section key={platform} className={styles.platform} aria-labelledby={headingId}>
                <h3 id={headingId}>{guide.title}</h3>
                <ol>
                  {guide.steps.map((step) => (
                    <li key={step.title}>
                      <strong>{step.title}</strong>
                      <span>{step.body}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )
          })}
        </div>
        <Link className={styles.guideLink} to={guidePath} onClick={onClose}>
          See the full illustrated guide <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </div>
  )
}
