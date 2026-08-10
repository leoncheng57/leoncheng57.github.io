import { useCallback, useState } from 'react'

const STORAGE_KEY = 'sub-wait-favorites'

function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : []
  } catch {
    return []
  }
}

/** Favorite station IDs, persisted in localStorage. */
export default function useFavorites(): {
  favorites: string[]
  isFavorite: (_stationId: string) => boolean
  toggleFavorite: (_stationId: string) => void
} {
  const [favorites, setFavorites] = useState<string[]>(readFavorites)

  const toggleFavorite = useCallback((stationId: string) => {
    setFavorites((current) => {
      const next = current.includes(stationId)
        ? current.filter((id) => id !== stationId)
        : [...current, stationId]
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // localStorage unavailable; favorites stay in-memory for the session.
      }
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (stationId: string) => favorites.includes(stationId),
    [favorites],
  )

  return { favorites, isFavorite, toggleFavorite }
}
