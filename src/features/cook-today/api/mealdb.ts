import type { RecipeIngredient } from '../types'

/**
 * TheMealDB's free tier accepts the shared developer key "1" and only filters
 * by a single ingredient/category/area per request, so the app fires one
 * request per checked box and intersects the results in the browser.
 */
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

export type MealSummary = {
  id: string
  title: string
  thumbnailUrl: string
}

export type MealDetail = {
  id: string
  title: string
  thumbnailUrl: string
  category?: string
  area?: string
  ingredients: RecipeIngredient[]
  instructions: string[]
  videoUrl?: string
  sourceUrl?: string
}

type RawMealSummary = {
  idMeal?: string
  strMeal?: string
  strMealThumb?: string
}

type RawMealDetail = RawMealSummary & {
  strCategory?: string
  strArea?: string
  strInstructions?: string
  strYoutube?: string
  strSource?: string
  [key: string]: string | undefined
}

type FilterResponse = { meals: RawMealSummary[] | null }
type LookupResponse = { meals: RawMealDetail[] | null }

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`TheMealDB request failed with status ${response.status}`)
  }
  return (await response.json()) as T
}

function toSummary(raw: RawMealSummary): MealSummary | null {
  if (!raw.idMeal || !raw.strMeal) return null
  return {
    id: raw.idMeal,
    title: raw.strMeal,
    thumbnailUrl: raw.strMealThumb ?? '',
  }
}

async function filterBy(
  param: 'i' | 'c' | 'a',
  value: string,
  signal?: AbortSignal
): Promise<MealSummary[]> {
  const url = `${BASE_URL}/filter.php?${param}=${encodeURIComponent(value)}`
  const data = await getJson<FilterResponse>(url, signal)
  if (!data.meals) return []
  return data.meals
    .map(toSummary)
    .filter((meal): meal is MealSummary => meal !== null)
}

export function filterByIngredient(
  ingredient: string,
  signal?: AbortSignal
): Promise<MealSummary[]> {
  return filterBy('i', ingredient, signal)
}

export function filterByArea(
  area: string,
  signal?: AbortSignal
): Promise<MealSummary[]> {
  return filterBy('a', area, signal)
}

export function filterByCategory(
  category: string,
  signal?: AbortSignal
): Promise<MealSummary[]> {
  return filterBy('c', category, signal)
}

/** TheMealDB stores ingredients across 20 numbered field pairs. */
export function parseIngredients(raw: RawMealDetail): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = []

  for (let index = 1; index <= 20; index += 1) {
    const name = raw[`strIngredient${index}`]?.trim()
    if (!name) continue

    const measure = raw[`strMeasure${index}`]?.trim()
    ingredients.push(measure ? { name, measure } : { name })
  }

  return ingredients
}

function parseInstructions(value?: string): string[] {
  if (!value) return []
  return value
    .split(/\r?\n+/)
    .map((step) => step.replace(/^\s*(?:step\s*)?\d+[.)]?\s*/i, '').trim())
    .filter((step) => step.length > 0)
}

export async function lookupMeal(
  id: string,
  signal?: AbortSignal
): Promise<MealDetail | null> {
  const url = `${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`
  const data = await getJson<LookupResponse>(url, signal)
  const raw = data.meals?.[0]
  if (!raw || !raw.idMeal || !raw.strMeal) return null

  return {
    id: raw.idMeal,
    title: raw.strMeal,
    thumbnailUrl: raw.strMealThumb ?? '',
    category: raw.strCategory?.trim() || undefined,
    area: raw.strArea?.trim() || undefined,
    ingredients: parseIngredients(raw),
    instructions: parseInstructions(raw.strInstructions),
    videoUrl: raw.strYoutube?.trim() || undefined,
    sourceUrl: raw.strSource?.trim() || undefined,
  }
}
