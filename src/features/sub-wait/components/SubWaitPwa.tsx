import { useEffect, useState, type ReactElement } from 'react'
import { useLocation } from 'react-router-dom'
import { getStation } from '../data/stations'
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
  const { pathname } = useLocation()
  const stationMatch = pathname.match(/\/sub-wait\/station\/([^/]+)(?:\/[^/]+)?\/?$/)
  const station = stationMatch ? getStation(decodeURIComponent(stationMatch[1])) : undefined
  const manifestPath = station
    ? `sub-wait/manifests/station-${station.id}.webmanifest`
    : 'sub-wait/manifest.webmanifest'
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
    manifest.href = assetUrl(manifestPath)
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
    appleTitle.content = station?.name ?? 'Sub-Wait'
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
  }, [manifestPath, station?.name])

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
          <span className={styles.installHintLogoWrap} aria-hidden="true">
            <img src={assetUrl('sub-wait/icon-v2.svg')} alt="" />
            <span className={styles.installHintPlus}>+</span>
          </span>
        </button>
      </aside>
    )
  }

  return (
    <aside className={styles.installHint} aria-label="Install Sub-Wait">
      <img
        className={styles.installHintLogo}
        src={assetUrl('sub-wait/icon-v2.svg')}
        alt=""
        width={36}
        height={36}
      />
      <div className={styles.installHintCopy}>
        <strong>
          {station ? (
            <>
              Add <em>{station.name}</em> to homescreen
            </>
          ) : (
            'Add Sub-Wait to homescreen'
          )}
        </strong>
        <span>1-click from immediate subway times, no app store required.</span>
        <a href={assetUrl('sub-wait/install')}>More details</a>
      </div>
      <button
        type="button"
        onClick={() => setHintCollapsed(true)}
        aria-label="Collapse install instructions"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="m6 12 4-4 4 4" />
        </svg>
      </button>
    </aside>
  )
}
