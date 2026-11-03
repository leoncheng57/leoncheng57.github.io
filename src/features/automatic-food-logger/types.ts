export type MealMacros = {
  kcal: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
}

export type MealStatus = 'logged' | 'awaiting-estimate'

export type LoggedMeal = {
  id: string
  description: string
  loggedAt: string
  macros?: MealMacros
  status: MealStatus
}
