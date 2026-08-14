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
  setTheme: (_next: GuidesTheme) => void
} {
  const [theme, setThemeState] = useState<GuidesTheme>(() => storedTheme() ?? systemTheme())

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      if (storedTheme() === null) {
        setThemeState(event.matches ? 'dark' : 'light')
      }
    }

    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next: GuidesTheme) => {
    setThemeState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage unavailable (private browsing); theme still updates.
    }
  }, [])

  return { theme, setTheme }
}
