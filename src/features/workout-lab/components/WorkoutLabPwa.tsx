import { useEffect, useState, type ReactElement } from 'react'
import styles from '../workout-lab.module.css'

const DISMISS_KEY = 'workout-lab-install-hint-dismissed'

interface StandaloneNavigator extends Navigator {
  standalone?: boolean
}

export function shouldShowIosInstallHint(
  userAgent: string,
  standalone: boolean,
  dismissed: boolean
): boolean {
  return /iphone|ipad|ipod/i.test(userAgent) && !standalone && !dismissed
}

function hasDismissedHint(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === 'true'
  } catch {
    return false
  }
}

export default function WorkoutLabPwa(): ReactElement | null {
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    Boolean((navigator as StandaloneNavigator).standalone)
  const [showInstallHint, setShowInstallHint] = useState(() =>
    shouldShowIosInstallHint(navigator.userAgent, isStandalone, hasDismissedHint())
  )

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

    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/workout-lab/sw.js', {
        scope: '/workout-lab/',
      })
    }

    return () => elements.forEach((element) => element.remove())
  }, [])

  if (!showInstallHint) return null

  return (
    <aside className={styles.installHint} aria-label="Install Workout Lab">
      <div>
        <strong>Put Workout Lab on your home screen</strong>
        <p>
          Tap the Share button in Safari, then choose Add to Home Screen for a
          fullscreen, offline-ready app.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          try {
            window.localStorage.setItem(DISMISS_KEY, 'true')
          } catch {
            // The hint can still be dismissed for this session when storage is blocked.
          }
          setShowInstallHint(false)
        }}
        aria-label="Dismiss install instructions"
      >
        Dismiss
      </button>
    </aside>
  )
}
