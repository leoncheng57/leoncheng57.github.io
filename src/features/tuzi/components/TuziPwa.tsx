import { useEffect, type ReactElement } from 'react'

function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

export default function TuziPwa(): ReactElement | null {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Tuzi · Rank your favorite books'

    const manifest = document.createElement('link')
    manifest.rel = 'manifest'
    manifest.href = assetUrl('tuzi/manifest.webmanifest')
    manifest.dataset.tuzi = 'manifest'

    const themeColor = document.createElement('meta')
    themeColor.name = 'theme-color'
    themeColor.content = '#1b3328'
    themeColor.dataset.tuzi = 'theme-color'

    const appleCapable = document.createElement('meta')
    appleCapable.name = 'apple-mobile-web-app-capable'
    appleCapable.content = 'yes'
    appleCapable.dataset.tuzi = 'apple-capable'

    const appleTitle = document.createElement('meta')
    appleTitle.name = 'apple-mobile-web-app-title'
    appleTitle.content = 'Tuzi'
    appleTitle.dataset.tuzi = 'apple-title'

    const appleIcon = document.createElement('link')
    appleIcon.rel = 'apple-touch-icon'
    appleIcon.href = assetUrl('tuzi/icon-192.png')
    appleIcon.dataset.tuzi = 'apple-icon'

    const elements = [manifest, themeColor, appleCapable, appleTitle, appleIcon]
    elements.forEach((element) => document.head.appendChild(element))

    if (
      import.meta.env.PROD &&
      import.meta.env.BASE_URL === '/' &&
      'serviceWorker' in navigator
    ) {
      void navigator.serviceWorker.register('/tuzi/sw.js', { scope: '/tuzi/' })
    }

    return () => {
      document.title = previousTitle
      elements.forEach((element) => element.remove())
    }
  }, [])

  return null
}
