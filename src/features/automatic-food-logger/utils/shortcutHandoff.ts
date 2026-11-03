import type { LoggedMeal } from '../types'

export const LOG_FOOD_SHORTCUT_NAME = 'Log Food'

export type LogFoodShortcutPayload = {
  description: string
  loggedAt: string
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
}

export function buildLogFoodShortcutPayload(meal: LoggedMeal): LogFoodShortcutPayload {
  return {
    description: meal.description,
    loggedAt: meal.loggedAt,
    kcal: meal.macros?.kcal ?? null,
    protein_g: meal.macros?.proteinGrams ?? null,
    carbs_g: meal.macros?.carbsGrams ?? null,
    fat_g: meal.macros?.fatGrams ?? null,
  }
}

// encodeURIComponent rather than URLSearchParams: the latter turns spaces into
// "+", which Shortcuts passes through literally instead of decoding.
export function buildLogFoodShortcutUrl(meal: LoggedMeal): string {
  const shortcutName = encodeURIComponent(LOG_FOOD_SHORTCUT_NAME)
  const payloadText = encodeURIComponent(JSON.stringify(buildLogFoodShortcutPayload(meal)))
  return `shortcuts://run-shortcut?name=${shortcutName}&input=text&text=${payloadText}`
}
