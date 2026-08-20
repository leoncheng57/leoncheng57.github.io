import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export const PALETTES = [
  { id: 'classic', label: 'Classic Navy' },
  { id: 'sky', label: 'Electric Sky' },
  { id: 'sunset', label: 'Sunset Coral' },
  { id: 'forest', label: 'Forest Green' },
  { id: 'plum', label: 'Plum Punch' },
] as const

export type Palette = (typeof PALETTES)[number]['id']

const STORAGE_KEY = 'nyc-weather-theme'
const PALETTE_KEY = 'nyc-weather-palette'

function systemTheme(): Theme {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

function storedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function storedPalette(): Palette {
  try {
    const value = window.localStorage.getItem(PALETTE_KEY)
    return PALETTES.some((palette) => palette.id === value)
      ? (value as Palette)
      : 'classic'
  } catch {
    return 'classic'
  }
}

/**
 * NYC Weather theme: defaults to the system color scheme, and a manual toggle
 * persists the override in localStorage. The palette is a temporary beta
 * picker for evaluating candidate color themes; it persists the same way.
 */
export default function useTheme(): {
  theme: Theme
  toggleTheme: () => void
  palette: Palette
  setPalette: (_palette: Palette) => void
} {
  const [theme, setTheme] = useState<Theme>(() => storedTheme() ?? systemTheme())
  const [palette, setPaletteState] = useState<Palette>(storedPalette)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      // Follow the system unless the user has chosen explicitly.
      if (storedTheme() === null) {
        setTheme(event.matches ? 'dark' : 'light')
      }
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // localStorage unavailable (private browsing); theme still toggles.
      }
      return next
    })
  }, [])

  const setPalette = useCallback((next: Palette) => {
    setPaletteState(next)
    try {
      window.localStorage.setItem(PALETTE_KEY, next)
    } catch {
      // localStorage unavailable (private browsing); palette still switches.
    }
  }, [])

  return { theme, toggleTheme, palette, setPalette }
}
