import { useEffect, useState, type ReactElement } from 'react'
import { assetUrl } from '../utils/assetUrl'
import styles from '../sub-wait.module.css'

const DISMISS_KEY = 'sub-wait-install-hint-dismissed'

interface StandaloneNavigator extends Navigator {
  standalone?: boolean
}

export function shouldShowIosInstallHint(
  userAgent: string,
  standalone: boolean,
  dismissed: boolean,
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

export default function SubWaitPwa(): ReactElement | null {
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    Boolean((navigator as StandaloneNavigator).standalone)
  const [showInstallHint, setShowInstallHint] = useState(() =>
    shouldShowIosInstallHint(
      navigator.userAgent,
      isStandalone,
      hasDismissedHint(),
    ),
  )

  useEffect(() => {
    const manifest = document.createElement('link')
    manifest.rel = 'manifest'
    manifest.href = assetUrl('sub-wait/manifest.webmanifest')
    manifest.dataset.subWait = 'manifest'

    const themeColor = document.createElement('meta')
    themeColor.name = 'theme-color'
    themeColor.content = '#111111'
    themeColor.dataset.subWait = 'theme-color'

    const appleCapable = document.createElement('meta')
    appleCapable.name = 'apple-mobile-web-app-capable'
    appleCapable.content = 'yes'
    appleCapable.dataset.subWait = 'apple-capable'

    const appleTitle = document.createElement('meta')
    appleTitle.name = 'apple-mobile-web-app-title'
    appleTitle.content = 'Sub-Wait'
    appleTitle.dataset.subWait = 'apple-title'

    const appleIcon = document.createElement('link')
    appleIcon.rel = 'apple-touch-icon'
    appleIcon.href = assetUrl('sub-wait/icon-v2-192.png')
    appleIcon.dataset.subWait = 'apple-icon'

    const elements = [manifest, themeColor, appleCapable, appleTitle, appleIcon]
    elements.forEach((element) => document.head.appendChild(element))

    if (
      import.meta.env.PROD &&
      import.meta.env.BASE_URL === '/' &&
      'serviceWorker' in navigator
    ) {
      void navigator.serviceWorker.register('/sub-wait/sw.js', {
        scope: '/sub-wait/',
      })
    }

    return () => elements.forEach((element) => element.remove())
  }, [])

  if (!showInstallHint) return null

  return (
    <aside className={styles.installHint} aria-label="Install Sub-Wait">
      <div>
        <strong>Put Sub-Wait on your home screen</strong>
        <p>
          Tap the Share button in Safari, then choose Add to Home Screen for a
          fullscreen app that is one tap from your train times.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          try {
            window.localStorage.setItem(DISMISS_KEY, 'true')
          } catch {
            // The hint can still be dismissed for this session.
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
