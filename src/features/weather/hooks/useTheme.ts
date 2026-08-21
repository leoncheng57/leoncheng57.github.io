import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_PALETTE, isPalette, type Palette } from '../palettes'

export type Theme = 'light' | 'dark'

// The palette registry lives in `../palettes` so a picker can read IDs, names
// and swatches without applying a palette. The type is re-exported because it
// is part of this hook's signature; import the registry itself from there.
export type { Palette } from '../palettes'

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
    return isPalette(value) ? value : DEFAULT_PALETTE
  } catch {
    return DEFAULT_PALETTE
  }
}

/** Keeps the selected palette and light/dark mode in one persisted state. */
export default function useTheme(): {
  theme: Theme
  palette: Palette
  setAppearance: (_palette: Palette, _theme: Theme) => void
} {
  const [appearance, setAppearanceState] = useState(() => ({
    theme: storedTheme() ?? systemTheme(),
    palette: storedPalette(),
  }))

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      // Follow the system unless the user has chosen explicitly.
      if (storedTheme() === null) {
        setAppearanceState((current) => ({
          ...current,
          theme: event.matches ? 'dark' : 'light',
        }))
      }
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const setAppearance = useCallback((palette: Palette, theme: Theme) => {
    setAppearanceState({ palette, theme })
    try {
      window.localStorage.setItem(PALETTE_KEY, palette)
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage unavailable; the selected appearance still applies.
    }
  }, [])

  return { ...appearance, setAppearance }
}
