import type { LoggedMeal, MealMacros } from '../types'
import { roundGrams } from './parseMacroEstimate'

export type DailyMealTotals = MealMacros & {
  loggedMealCount: number
  awaitingEstimateCount: number
}

export function isSameLocalDay(isoTimestamp: string, referenceDate: Date): boolean {
  const timestampDate = new Date(isoTimestamp)
  return (
    timestampDate.getFullYear() === referenceDate.getFullYear() &&
    timestampDate.getMonth() === referenceDate.getMonth() &&
    timestampDate.getDate() === referenceDate.getDate()
  )
}

export function sumMealTotalsForDay(meals: LoggedMeal[], referenceDate: Date): DailyMealTotals {
  const mealsOnDay = meals.filter((meal) => isSameLocalDay(meal.loggedAt, referenceDate))
  const totals = mealsOnDay.reduce(
    (runningTotals, meal) => {
      if (!meal.macros) return { ...runningTotals, awaitingEstimateCount: runningTotals.awaitingEstimateCount + 1 }
      return {
        kcal: runningTotals.kcal + meal.macros.kcal,
        proteinGrams: runningTotals.proteinGrams + meal.macros.proteinGrams,
        carbsGrams: runningTotals.carbsGrams + meal.macros.carbsGrams,
        fatGrams: runningTotals.fatGrams + meal.macros.fatGrams,
        loggedMealCount: runningTotals.loggedMealCount + 1,
        awaitingEstimateCount: runningTotals.awaitingEstimateCount,
      }
    },
    { kcal: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0, loggedMealCount: 0, awaitingEstimateCount: 0 },
  )
  return {
    ...totals,
    proteinGrams: roundGrams(totals.proteinGrams),
    carbsGrams: roundGrams(totals.carbsGrams),
    fatGrams: roundGrams(totals.fatGrams),
  }
}

export function findRecentMealsWithMacros(meals: LoggedMeal[], maximumCount = 6): LoggedMeal[] {
  const seenDescriptions = new Set<string>()
  const recentMeals: LoggedMeal[] = []
  for (const meal of meals) {
    const normalizedDescription = meal.description.trim().toLowerCase()
    if (!meal.macros || seenDescriptions.has(normalizedDescription)) continue
    seenDescriptions.add(normalizedDescription)
    recentMeals.push(meal)
    if (recentMeals.length === maximumCount) break
  }
  return recentMeals
}

export function formatMacrosSummary(macros: MealMacros): string {
  return `${macros.kcal} kcal · ${macros.proteinGrams}g protein · ${macros.carbsGrams}g carbs · ${macros.fatGrams}g fat`
}
