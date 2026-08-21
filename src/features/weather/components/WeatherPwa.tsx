import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import InstallHelpModal from '../../../components/pwa-install/InstallHelpModal'
import { isInstallPlatformDevice } from '../../../components/pwa-install/installPlatforms'
import { assetUrl } from '../utils/assetUrl'
import styles from '../weather.module.css'

const COLLAPSED_KEY = 'nyc-weather-install-hint-collapsed'

interface StandaloneNavigator extends Navigator {
  standalone?: boolean
}

export function shouldShowInstallHint(
  userAgent: string,
  standalone: boolean,
  platform = '',
  maxTouchPoints = 0,
): boolean {
  return (
    isInstallPlatformDevice(userAgent, platform, maxTouchPoints) && !standalone
  )
}

function hasCollapsedHint(): boolean {
  try {
    const stored = window.localStorage.getItem(COLLAPSED_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
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
    navigator.platform,
    navigator.maxTouchPoints,
  )
  const [collapsed, setCollapsed] = useState(hasCollapsedHint)
  const [installHelpOpen, setInstallHelpOpen] = useState(false)
  const helpButtonRef = useRef<HTMLButtonElement>(null)

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
      <>
        <aside
          className={styles.installHintCollapsed}
          aria-label="Install NYC Weather"
        >
          <button
            type="button"
            className={styles.installHintPreview}
            onClick={() => setHintCollapsed(false)}
            aria-label="Expand install instructions"
          >
            <span className={styles.installHintCollapsedIcon} aria-hidden="true">
              <img src={assetUrl('weather/icon.svg')} alt="" width={28} height={28} />
              <span>+</span>
            </span>
            <span className={styles.installHintPreviewCopy}>
              <strong>Install app</strong>
              <small>Add NYC Weather to your home screen</small>
            </span>
          </button>
          <button
            ref={helpButtonRef}
            type="button"
            className={styles.installHintHelp}
            onClick={() => setInstallHelpOpen(true)}
          >
            Help
          </button>
        </aside>
        {installHelpOpen ? (
          <InstallHelpModal
            appName="NYC Weather"
            guidePath="/weather/install"
            iconSrc={assetUrl('weather/icon.svg')}
            onClose={() => setInstallHelpOpen(false)}
            returnFocusTo={helpButtonRef.current}
          />
        ) : null}
      </>
    )
  }

  return (
    <>
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
          <span>Get a full-screen forecast from your home screen, no app store.</span>
          <span className={styles.installHintLinks}>
            <button
              ref={helpButtonRef}
              type="button"
              onClick={() => setInstallHelpOpen(true)}
            >
              Help
            </button>
            <Link to="/weather/install">More details</Link>
          </span>
        </div>
        <button
          type="button"
          className={styles.installHintDismiss}
          onClick={() => setHintCollapsed(true)}
          aria-label="Collapse install instructions"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m6 12 4-4 4 4" />
          </svg>
        </button>
      </aside>
      {installHelpOpen ? (
        <InstallHelpModal
          appName="NYC Weather"
          guidePath="/weather/install"
          iconSrc={assetUrl('weather/icon.svg')}
          onClose={() => setInstallHelpOpen(false)}
          returnFocusTo={helpButtonRef.current}
        />
      ) : null}
    </>
  )
}
