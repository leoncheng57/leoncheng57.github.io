import { describe, expect, it } from 'vitest'
import type { LoggedMeal } from '../types'
import { findRecentMealsWithMacros, sumMealTotalsForDay } from './mealTotals'

const referenceDate = new Date(2026, 9, 4, 18, 0)

function buildMeal(overrides: Partial<LoggedMeal>): LoggedMeal {
  return {
    id: overrides.id ?? Math.random().toString(36),
    description: 'meal',
    loggedAt: new Date(2026, 9, 4, 12, 0).toISOString(),
    status: 'logged',
    ...overrides,
  }
}

describe('sumMealTotalsForDay', () => {
  it('adds only the reference day and counts meals still awaiting an estimate', () => {
    const meals = [
      buildMeal({ macros: { kcal: 500, proteinGrams: 30.1, carbsGrams: 50, fatGrams: 15 } }),
      buildMeal({ macros: { kcal: 250, proteinGrams: 10.2, carbsGrams: 20, fatGrams: 5.5 } }),
      buildMeal({ status: 'awaiting-estimate' }),
      buildMeal({
        loggedAt: new Date(2026, 9, 3, 12, 0).toISOString(),
        macros: { kcal: 900, proteinGrams: 1, carbsGrams: 1, fatGrams: 1 },
      }),
    ]

    expect(sumMealTotalsForDay(meals, referenceDate)).toEqual({
      kcal: 750,
      proteinGrams: 40.3,
      carbsGrams: 70,
      fatGrams: 20.5,
      loggedMealCount: 2,
      awaitingEstimateCount: 1,
    })
  })
})

describe('findRecentMealsWithMacros', () => {
  it('keeps the newest copy of each description and skips meals without macros', () => {
    const macros = { kcal: 100, proteinGrams: 1, carbsGrams: 1, fatGrams: 1 }
    const meals = [
      buildMeal({ id: 'newest-oats', description: 'Oats', macros }),
      buildMeal({ id: 'pending', description: 'Ramen', status: 'awaiting-estimate' }),
      buildMeal({ id: 'older-oats', description: 'oats ', macros }),
      buildMeal({ id: 'salad', description: 'Salad', macros }),
    ]

    expect(findRecentMealsWithMacros(meals).map((meal) => meal.id)).toEqual(['newest-oats', 'salad'])
    expect(findRecentMealsWithMacros(meals, 1).map((meal) => meal.id)).toEqual(['newest-oats'])
  })
})
