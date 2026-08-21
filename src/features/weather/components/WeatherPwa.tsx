import { useEffect, useRef, useState, type ReactElement } from 'react'
import InstallHelpModal from '../../../components/pwa-install/InstallHelpModal'
import { assetUrl } from '../utils/assetUrl'
import styles from '../weather.module.css'

interface StandaloneNavigator extends Navigator {
  standalone?: boolean
}

export function shouldShowInstallHint(standalone: boolean): boolean {
  return !standalone
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
  const showInstallHint = shouldShowInstallHint(isStandalone)
  const [installHelpOpen, setInstallHelpOpen] = useState(false)
  const installButtonRef = useRef<HTMLButtonElement>(null)

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

  return (
    <>
      <button
        ref={installButtonRef}
        type="button"
        className={styles.onboardingButton}
        onClick={() => setInstallHelpOpen(true)}
      >
        Install
      </button>
      {installHelpOpen ? (
        <InstallHelpModal
          appName="NYC Weather"
          guidePath="/weather/install"
          iconSrc={assetUrl('weather/icon.svg')}
          onClose={() => setInstallHelpOpen(false)}
          returnFocusTo={installButtonRef.current}
        />
      ) : null}
    </>
  )
}
