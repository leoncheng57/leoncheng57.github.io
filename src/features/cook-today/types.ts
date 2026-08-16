export type RecipeIngredient = {
  name: string
  measure?: string
}

export type Selections = {
  ingredients: string[]
  cuisines: string[]
  diets: string[]
}

export type CuratedPick = {
  id: string
  title: string
  /** Form option ids from form-options.ts that this recipe satisfies. */
  ingredientOptionIds: string[]
  cuisineOptionIds: string[]
  dietOptionIds: string[]
  category: string
  cuisineLabel: string
  dietLabels: string[]
  totalTimeMinutes: number
  ingredients: RecipeIngredient[]
  videoUrl: string
  sourceUrl: string
  sourceName: string
}

export type SuggestionCandidate = {
  id: string
  title: string
  thumbnailUrl?: string
  matchedLabels: string[]
  kind: 'mealdb' | 'curated'
  curated?: CuratedPick
}
