import { useCallback, useState } from 'react'

export type GuidesTheme = 'light' | 'dark'

const STORAGE_KEY = 'guides-theme'

/** Guides defaults to its Supabase-style dark theme, matching Supabase's own default. */
const DEFAULT_THEME: GuidesTheme = 'dark'

function storedTheme(): GuidesTheme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

/**
 * Guides theme: defaults to dark, persists an explicit light/dark choice
 * from the masthead pill in localStorage.
 */
export default function useGuidesTheme(): {
  theme: GuidesTheme
  setTheme: (_next: GuidesTheme) => void
} {
  const [theme, setThemeState] = useState<GuidesTheme>(() => storedTheme() ?? DEFAULT_THEME)

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
