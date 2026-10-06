import { useEffect, useRef, useState, type ReactElement } from 'react'
import InstallHelpModal from '../../../components/pwa-install/InstallHelpModal'
import { publicAssetUrl } from '../../../utils/publicAssetUrl'
import styles from '../automatic-food-logger.module.css'

export const FOOD_LOGGER_APP_NAME = 'Food Logger'
const FOOD_LOGGER_THEME_COLOR = '#1f5f4a'

interface StandaloneNavigator extends Navigator {
  standalone?: boolean
}

export function isRunningAsInstalledApp(): boolean {
  return (
    Boolean(window.matchMedia?.('(display-mode: standalone)').matches) ||
    Boolean((navigator as StandaloneNavigator).standalone)
  )
}

export default function AutomaticFoodLoggerPwa(): ReactElement | null {
  const showInstallButton = !isRunningAsInstalledApp()
  const [isInstallHelpOpen, setIsInstallHelpOpen] = useState(false)
  const installButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const manifestLink = document.createElement('link')
    manifestLink.rel = 'manifest'
    manifestLink.href = publicAssetUrl('/automatic-food-logger/manifest.webmanifest')

    const themeColorMeta = document.createElement('meta')
    themeColorMeta.name = 'theme-color'
    themeColorMeta.content = FOOD_LOGGER_THEME_COLOR

    const appleCapableMeta = document.createElement('meta')
    appleCapableMeta.name = 'apple-mobile-web-app-capable'
    appleCapableMeta.content = 'yes'

    const appleTitleMeta = document.createElement('meta')
    appleTitleMeta.name = 'apple-mobile-web-app-title'
    appleTitleMeta.content = FOOD_LOGGER_APP_NAME

    const appleTouchIconLink = document.createElement('link')
    appleTouchIconLink.rel = 'apple-touch-icon'
    appleTouchIconLink.href = publicAssetUrl('/automatic-food-logger/icon-192.png')

    const headElements = [manifestLink, themeColorMeta, appleCapableMeta, appleTitleMeta, appleTouchIconLink]
    headElements.forEach((element) => document.head.appendChild(element))

    if (import.meta.env.PROD && import.meta.env.BASE_URL === '/' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/automatic-food-logger/sw.js', {
        scope: '/automatic-food-logger/',
      })
    }

    return () => headElements.forEach((element) => element.remove())
  }, [])

  if (!showInstallButton) return null

  return (
    <>
      <button ref={installButtonRef} type="button" className={styles.installButton} onClick={() => setIsInstallHelpOpen(true)}>
        Install
      </button>
      {isInstallHelpOpen ? (
        <InstallHelpModal
          appName={FOOD_LOGGER_APP_NAME}
          guidePath="/automatic-food-logger/setup"
          iconSrc={publicAssetUrl('/automatic-food-logger/icon.svg')}
          onClose={() => setIsInstallHelpOpen(false)}
          returnFocusTo={installButtonRef.current}
        />
      ) : null}
    </>
  )
}
