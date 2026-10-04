import { useCallback, useRef, useState } from 'react'
import type { LoggedMeal, MealMacros } from '../types'

export const MEAL_LOG_STORAGE_KEY = 'automatic-food-logger:meals'

function isLoggedMeal(value: unknown): value is LoggedMeal {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<LoggedMeal>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.loggedAt === 'string' &&
    (candidate.status === 'logged' || candidate.status === 'awaiting-estimate')
  )
}

export function readStoredMeals(): LoggedMeal[] {
  try {
    const storedText = window.localStorage.getItem(MEAL_LOG_STORAGE_KEY)
    if (!storedText) return []
    const parsedValue: unknown = JSON.parse(storedText)
    return Array.isArray(parsedValue) ? parsedValue.filter(isLoggedMeal) : []
  } catch {
    return []
  }
}

function writeStoredMeals(meals: LoggedMeal[]): void {
  try {
    window.localStorage.setItem(MEAL_LOG_STORAGE_KEY, JSON.stringify(meals))
  } catch {
    // Private browsing or a full quota: the meal still reaches the Shortcut.
  }
}

function createMealId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export type MealLog = {
  meals: LoggedMeal[]
  addMeal: (_description: string, _macros?: MealMacros) => LoggedMeal
  applyEstimate: (_mealId: string, _macros: MealMacros) => void
  removeMeal: (_mealId: string) => void
}

export default function useMealLog(): MealLog {
  const [meals, setMeals] = useState<LoggedMeal[]>(readStoredMeals)
  const latestMealsRef = useRef(meals)

  // Writes happen inside each action rather than in an effect so the meal is
  // already in storage when the page hands off to the Shortcuts app.
  const updateMeals = useCallback((computeNextMeals: (_currentMeals: LoggedMeal[]) => LoggedMeal[]) => {
    const nextMeals = computeNextMeals(latestMealsRef.current)
    latestMealsRef.current = nextMeals
    writeStoredMeals(nextMeals)
    setMeals(nextMeals)
  }, [])

  const addMeal = useCallback(
    (description: string, macros?: MealMacros): LoggedMeal => {
      const newMeal: LoggedMeal = {
        id: createMealId(),
        description: description.trim(),
        loggedAt: new Date().toISOString(),
        ...(macros ? { macros } : {}),
        status: macros ? 'logged' : 'awaiting-estimate',
      }
      updateMeals((currentMeals) => [newMeal, ...currentMeals])
      return newMeal
    },
    [updateMeals],
  )

  const applyEstimate = useCallback(
    (mealId: string, macros: MealMacros) => {
      updateMeals((currentMeals) =>
        currentMeals.map((meal) => (meal.id === mealId ? { ...meal, macros, status: 'logged' } : meal)),
      )
    },
    [updateMeals],
  )

  const removeMeal = useCallback(
    (mealId: string) => {
      updateMeals((currentMeals) => currentMeals.filter((meal) => meal.id !== mealId))
    },
    [updateMeals],
  )

  return { meals, addMeal, applyEstimate, removeMeal }
}
