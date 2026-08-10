import { useEffect, useState, type ReactElement } from 'react'
import { assetUrl } from '../utils/assetUrl'
import styles from '../sub-wait.module.css'

const COLLAPSED_KEY = 'sub-wait-install-hint-collapsed'

interface StandaloneNavigator extends Navigator {
  standalone?: boolean
}

export function shouldShowInstallHint(
  userAgent: string,
  standalone: boolean,
): boolean {
  return /iphone|ipad|ipod|android/i.test(userAgent) && !standalone
}

function hasCollapsedHint(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

export default function SubWaitPwa(): ReactElement | null {
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    Boolean((navigator as StandaloneNavigator).standalone)
  const showInstallHint = shouldShowInstallHint(
    navigator.userAgent,
    isStandalone,
  )
  const [collapsed, setCollapsed] = useState(hasCollapsedHint)

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

  const setHintCollapsed = (nextCollapsed: boolean) => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, String(nextCollapsed))
    } catch {
      // Collapse still works for this session when storage is blocked.
    }
    setCollapsed(nextCollapsed)
  }

  if (collapsed) {
    return (
      <aside className={styles.installHintCollapsed} aria-label="Install Sub-Wait">
        <button
          type="button"
          onClick={() => setHintCollapsed(false)}
          aria-label="Open install instructions"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 3.5h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
            <path d="M12 7v7m0 0-3-3m3 3 3-3" />
            <path d="M10 17.5h4" />
          </svg>
        </button>
      </aside>
    )
  }

  return (
    <aside className={styles.installHint} aria-label="Install Sub-Wait">
      <div className={styles.installHintCopy}>
        <strong>Install Sub-Wait</strong>
        <span>Keep train times one tap away.</span>
        <a href={assetUrl('sub-wait/install')}>iPhone &amp; Android steps</a>
      </div>
      <button
        type="button"
        onClick={() => setHintCollapsed(true)}
        aria-label="Collapse install instructions"
      >
        <span aria-hidden="true">−</span>
      </button>
    </aside>
  )
}
