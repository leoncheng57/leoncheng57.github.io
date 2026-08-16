import { CURATED_PICKS } from '../data/curated-picks'
import {
  CUISINE_OPTIONS,
  DIET_OPTIONS,
  INGREDIENT_OPTIONS,
  type FormOption,
} from '../data/form-options'
import type { MealSummary } from '../api/mealdb'
import type { Selections, SuggestionCandidate } from '../types'

function labelFor(options: FormOption[], id: string): string {
  return options.find((option) => option.id === id)?.label ?? id
}

export type LabeledResult = {
  /** Human readable checkbox label, e.g. "Chicken" or "Japanese". */
  label: string
  meals: MealSummary[]
}

/**
 * Small deterministic hash so "Shuffle" reorders equally-good matches without
 * pulling in a random number generator that would break snapshot-style tests.
 */
function hash(value: string, seed: number): number {
  let result = seed + 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return (result >>> 0) / 4294967295
}

export function buildCuratedCandidates(
  selections: Selections
): SuggestionCandidate[] {
  return CURATED_PICKS.map((pick) => {
    const matchedLabels: string[] = []

    for (const id of selections.ingredients) {
      if (pick.ingredientOptionIds.includes(id)) {
        matchedLabels.push(labelFor(INGREDIENT_OPTIONS, id))
      }
    }
    for (const id of selections.cuisines) {
      if (pick.cuisineOptionIds.includes(id)) {
        matchedLabels.push(labelFor(CUISINE_OPTIONS, id))
      }
    }
    for (const id of selections.diets) {
      if (pick.dietOptionIds.includes(id)) {
        matchedLabels.push(labelFor(DIET_OPTIONS, id))
      }
    }

    return {
      id: pick.id,
      title: pick.title,
      matchedLabels,
      kind: 'curated' as const,
      curated: pick,
    }
  }).filter((candidate) => candidate.matchedLabels.length > 0)
}

/**
 * Scores every meal by how many checked boxes it satisfies, then returns the
 * best `limit` candidates. Ties are broken deterministically by `seed`, so the
 * Shuffle button produces a new but reproducible set.
 */
export function rankSuggestions(
  results: LabeledResult[],
  curated: SuggestionCandidate[],
  limit: number,
  seed = 0
): SuggestionCandidate[] {
  const byId = new Map<string, SuggestionCandidate>()

  for (const result of results) {
    for (const meal of result.meals) {
      const existing = byId.get(meal.id)
      if (existing) {
        if (!existing.matchedLabels.includes(result.label)) {
          existing.matchedLabels.push(result.label)
        }
        continue
      }

      byId.set(meal.id, {
        id: meal.id,
        title: meal.title,
        thumbnailUrl: meal.thumbnailUrl,
        matchedLabels: [result.label],
        kind: 'mealdb',
      })
    }
  }

  const candidates = [...curated, ...byId.values()]

  candidates.sort((left, right) => {
    const byScore = right.matchedLabels.length - left.matchedLabels.length
    if (byScore !== 0) return byScore
    return hash(left.id, seed) - hash(right.id, seed)
  })

  return candidates.slice(0, limit)
}
