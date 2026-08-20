import { useEffect, useState, type ReactElement } from 'react'
import { assetUrl } from '../utils/assetUrl'
import styles from '../weather.module.css'

const COLLAPSED_KEY = 'nyc-weather-install-hint-collapsed'

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

/**
 * Injects the PWA manifest and platform meta tags while a weather page is
 * mounted, registers the scoped service worker in production, and shows a
 * dismissible install hint on mobile browsers outside standalone mode.
 */
export default function WeatherPwa(): ReactElement | null {
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
    manifest.href = assetUrl('weather/manifest.webmanifest')

    const themeColor = document.createElement('meta')
    themeColor.name = 'theme-color'
    themeColor.content = '#0f2a43'

    const appleCapable = document.createElement('meta')
    appleCapable.name = 'apple-mobile-web-app-capable'
    appleCapable.content = 'yes'

    const appleTitle = document.createElement('meta')
    appleTitle.name = 'apple-mobile-web-app-title'
    appleTitle.content = 'NYC Weather'

    const appleIcon = document.createElement('link')
    appleIcon.rel = 'apple-touch-icon'
    appleIcon.href = assetUrl('weather/icon-192.png')

    const elements = [manifest, themeColor, appleCapable, appleTitle, appleIcon]
    elements.forEach((element) => document.head.appendChild(element))

    if (
      import.meta.env.PROD &&
      import.meta.env.BASE_URL === '/' &&
      'serviceWorker' in navigator
    ) {
      void navigator.serviceWorker.register('/weather/sw.js', {
        scope: '/weather/',
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
      <aside
        className={styles.installHintCollapsed}
        aria-label="Install NYC Weather"
      >
        <button
          type="button"
          onClick={() => setHintCollapsed(false)}
          aria-label="Open install instructions"
        >
          <img src={assetUrl('weather/icon.svg')} alt="" width={28} height={28} />
        </button>
      </aside>
    )
  }

  return (
    <aside className={styles.installHint} aria-label="Install NYC Weather">
      <img
        className={styles.installHintLogo}
        src={assetUrl('weather/icon.svg')}
        alt=""
        width={36}
        height={36}
      />
      <div className={styles.installHintCopy}>
        <strong>Add NYC Weather to your phone</strong>
        <span>
          Open your browser menu and choose “Add to Home Screen” for a
          full-screen forecast, no app store.
        </span>
      </div>
      <button
        type="button"
        className={styles.installHintDismiss}
        onClick={() => setHintCollapsed(true)}
        aria-label="Dismiss install instructions"
      >
        ×
      </button>
    </aside>
  )
}
