import type { MealMacros } from '../types'

const KCAL_KEYS = ['kcal', 'calories', 'energy_kcal']
const PROTEIN_KEYS = ['protein_g', 'proteinGrams', 'protein']
const CARBS_KEYS = ['carbs_g', 'carbsGrams', 'carbs', 'carbohydrates_g']
const FAT_KEYS = ['fat_g', 'fatGrams', 'fat']

function readFirstNonNegativeNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    if (!(key in record)) continue
    const value = record[key]
    const parsedNumber = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
    if (typeof parsedNumber === 'number' && Number.isFinite(parsedNumber) && parsedNumber >= 0) {
      return parsedNumber
    }
    return null
  }
  return null
}

function extractFirstJsonObjectText(text: string): string | null {
  const openingBraceIndex = text.indexOf('{')
  const closingBraceIndex = text.lastIndexOf('}')
  if (openingBraceIndex === -1 || closingBraceIndex <= openingBraceIndex) return null
  return text.slice(openingBraceIndex, closingBraceIndex + 1)
}

export function roundGrams(grams: number): number {
  return Math.round(grams * 10) / 10
}

export function parseMacroEstimate(text: string): MealMacros | null {
  const jsonObjectText = extractFirstJsonObjectText(text)
  if (!jsonObjectText) return null

  let parsedValue: unknown
  try {
    parsedValue = JSON.parse(jsonObjectText)
  } catch {
    return null
  }
  if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) return null

  const record = parsedValue as Record<string, unknown>
  const kcal = readFirstNonNegativeNumber(record, KCAL_KEYS)
  const proteinGrams = readFirstNonNegativeNumber(record, PROTEIN_KEYS)
  const carbsGrams = readFirstNonNegativeNumber(record, CARBS_KEYS)
  const fatGrams = readFirstNonNegativeNumber(record, FAT_KEYS)
  if (kcal === null || proteinGrams === null || carbsGrams === null || fatGrams === null) return null

  return {
    kcal: Math.round(kcal),
    proteinGrams: roundGrams(proteinGrams),
    carbsGrams: roundGrams(carbsGrams),
    fatGrams: roundGrams(fatGrams),
  }
}
