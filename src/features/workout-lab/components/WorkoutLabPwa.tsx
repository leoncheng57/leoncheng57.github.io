import { useEffect, useRef, useState, type ReactElement } from 'react'
import InstallHelpModal from '../../../components/pwa-install/InstallHelpModal'
import styles from '../workout-lab.module.css'

const ACKNOWLEDGEMENT_KEY = 'workout-lab:pwa-install-reminder-ack:v1'

interface StandaloneNavigator extends Navigator {
  standalone?: boolean
}

export function shouldShowIosInstallHint(
  userAgent: string,
  standalone: boolean
): boolean {
  return /iphone|ipad|ipod/i.test(userAgent) && !standalone
}

function hasAcknowledgedReminder(): boolean {
  try {
    return window.localStorage.getItem(ACKNOWLEDGEMENT_KEY) === 'true'
  } catch {
    return false
  }
}

export default function WorkoutLabPwa(): ReactElement | null {
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    Boolean((navigator as StandaloneNavigator).standalone)
  const showInstallHint = shouldShowIosInstallHint(navigator.userAgent, isStandalone)
  const [acknowledged, setAcknowledged] = useState(hasAcknowledgedReminder)
  const [installHelpOpen, setInstallHelpOpen] = useState(false)
  const installButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const manifest = document.createElement('link')
    manifest.rel = 'manifest'
    manifest.href = '/workout-lab/manifest.webmanifest'
    manifest.dataset.workoutLab = 'manifest'

    const themeColor = document.createElement('meta')
    themeColor.name = 'theme-color'
    themeColor.content = '#4d7c0f'
    themeColor.dataset.workoutLab = 'theme-color'

    const appleCapable = document.createElement('meta')
    appleCapable.name = 'apple-mobile-web-app-capable'
    appleCapable.content = 'yes'
    appleCapable.dataset.workoutLab = 'apple-capable'

    const appleTitle = document.createElement('meta')
    appleTitle.name = 'apple-mobile-web-app-title'
    appleTitle.content = 'Workout Lab'
    appleTitle.dataset.workoutLab = 'apple-title'

    const appleIcon = document.createElement('link')
    appleIcon.rel = 'apple-touch-icon'
    appleIcon.href = '/workout-lab/icon-192.png'
    appleIcon.dataset.workoutLab = 'apple-icon'

    const elements = [manifest, themeColor, appleCapable, appleTitle, appleIcon]
    elements.forEach((element) => document.head.appendChild(element))

    if (
      import.meta.env.PROD &&
      import.meta.env.BASE_URL === '/' &&
      'serviceWorker' in navigator
    ) {
      void navigator.serviceWorker.register('/workout-lab/sw.js', {
        scope: '/workout-lab/',
      })
    }

    return () => elements.forEach((element) => element.remove())
  }, [])

  if (!showInstallHint) return null

  return (
    <>
      <button
        ref={installButtonRef}
        type="button"
        className={styles.installReminder}
        onClick={() => {
          try {
            window.localStorage.setItem(ACKNOWLEDGEMENT_KEY, 'true')
          } catch {
            // Keep the control usable and acknowledge it for this session.
          }
          setAcknowledged(true)
          setInstallHelpOpen(true)
        }}
        aria-label="Install Workout Lab on your phone"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6.5" y="2.5" width="11" height="19" rx="1.5" />
          <path d="M9.5 5h5M10.5 18.5h3" />
          <path d="M12 8v6m-2.5-2.5L12 14l2.5-2.5" />
        </svg>
        {!acknowledged ? (
          <span
            className={styles.installReminderDot}
            data-testid="install-reminder-dot"
            aria-hidden="true"
          />
        ) : null}
      </button>
      {installHelpOpen ? (
        <InstallHelpModal
          appName="Workout Lab"
          guidePath="/workout-lab/guide"
          iconSrc="/workout-lab/icon.svg"
          onClose={() => setInstallHelpOpen(false)}
          returnFocusTo={installButtonRef.current}
        />
      ) : null}
    </>
  )
}
