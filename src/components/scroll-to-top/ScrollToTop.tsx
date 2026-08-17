import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop(): null {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // A hash means the destination wants to land on an in-page anchor (for
    // example a redirected legacy guide-chapter URL); leave the scroll to it.
    if (hash) {
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
