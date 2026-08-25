import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop(): null {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // Honor the anchor so arriving at /page#section lands on the section
      // instead of the top. The target is in the DOM by the time this runs.
      const target = document.getElementById(hash.slice(1))
      target?.scrollIntoView()
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
