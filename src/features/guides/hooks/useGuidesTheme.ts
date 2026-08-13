import { useCallback, useEffect, useState } from 'react'

export type GuidesTheme = 'light' | 'dark'

const STORAGE_KEY = 'guides-theme'

function systemTheme(): GuidesTheme {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

function storedTheme(): GuidesTheme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

/**
 * Guides theme: follows the system color scheme until the reader picks one,
 * then persists that override in localStorage.
 */
export default function useGuidesTheme(): {
  theme: GuidesTheme
  toggleTheme: () => void
} {
  const [theme, setTheme] = useState<GuidesTheme>(() => storedTheme() ?? systemTheme())

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      if (storedTheme() === null) {
        setTheme(event.matches ? 'dark' : 'light')
      }
    }

    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: GuidesTheme = current === 'dark' ? 'light' : 'dark'
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // localStorage unavailable (private browsing); theme still toggles.
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
