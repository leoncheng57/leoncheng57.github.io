import { createContext, useContext } from 'react'
import type { WeatherState } from './useWeather'

/**
 * Shares one useWeather instance (fetched by the route shell) across the
 * hourly, weekly, and day pages so navigating between them never refetches.
 */
export const WeatherContext = createContext<WeatherState | null>(null)

export function useWeatherContext(): WeatherState {
  const state = useContext(WeatherContext)
  if (!state) {
    throw new Error('useWeatherContext must be used within WeatherRoute')
  }
  return state
}
