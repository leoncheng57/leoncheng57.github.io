import { useEffect, useRef, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { assetUrl } from '../utils/assetUrl'
import styles from '../sub-wait.module.css'

interface InstallHelpModalProps {
  onClose: () => void
  returnFocusTo: HTMLElement | null
  stationName?: string
}

type Platform = 'iphone' | 'android'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const IPHONE_STEPS = [
  {
    title: 'Tap Share in Safari',
    body: 'Open Sub-Wait in Safari, then tap the Share button in the bottom toolbar.',
  },
  {
    title: 'Choose Add to Home Screen',
    body: 'Scroll the share sheet if needed, then tap Add to Home Screen.',
  },
  {
    title: 'Confirm with Add',
    body: 'Keep the Sub-Wait name, tap Add, and the S/W icon appears on your home screen.',
  },
]

const ANDROID_STEPS = [
  {
    title: 'Open the Chrome menu',
    body: 'Open Sub-Wait in Chrome, then tap the three-dot menu beside the address bar.',
  },
  {
    title: 'Choose Install app',
    body: 'Tap Install app. Some Android versions call this Add to Home screen.',
  },
  {
    title: 'Confirm installation',
    body: 'Tap Install. Sub-Wait opens like a standalone app from your home screen.',
  },
]

function detectedPlatforms(userAgent: string): Platform[] {
  if (/iphone|ipad|ipod/i.test(userAgent)) return ['iphone']
  if (/android/i.test(userAgent)) return ['android']
  return ['iphone', 'android']
}

function PlatformSteps({ platform }: { platform: Platform }): ReactElement {
  const title = platform === 'iphone' ? 'iPhone or iPad' : 'Android'
  const steps = platform === 'iphone' ? IPHONE_STEPS : ANDROID_STEPS
  const headingId = `install-help-${platform}`

  return (
    <section className={styles.installHelpPlatform} aria-labelledby={headingId}>
      <h3 id={headingId}>{title}</h3>
      <ol>
        {steps.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong>
            <span>{step.body}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function InstallHelpModal({
  onClose,
  returnFocusTo,
  stationName,
}: InstallHelpModalProps): ReactElement {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const titleId = 'install-help-title'
  const platforms = detectedPlatforms(navigator.userAgent)
  const title = stationName
    ? `Add ${stationName} station to your phone homescreen`
    : 'Add Sub-Wait to your phone homescreen'

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
      className={styles.installHelpBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={styles.installHelpModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.installHelpHeader}>
          <img
            src={assetUrl('sub-wait/icon-v2.svg')}
            alt=""
            width={42}
            height={42}
          />
          <h2 id={titleId}>{title}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.installHelpClose}
            onClick={onClose}
            aria-label="Close installation help"
          >
            Close
          </button>
        </header>

        <div className={styles.installHelpBody}>
          {platforms.map((platform) => (
            <PlatformSteps key={platform} platform={platform} />
          ))}
        </div>

        <Link
          className={styles.installHelpGuideLink}
          to="/sub-wait/install"
          onClick={onClose}
        >
          View the full installation guide →
        </Link>
      </div>
    </div>
  )
}
