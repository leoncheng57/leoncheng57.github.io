import { describe, expect, it } from 'vitest'
import type { LoggedMeal } from '../types'
import { buildLogFoodShortcutPayload, buildLogFoodShortcutUrl } from './shortcutHandoff'

const mealAwaitingEstimate: LoggedMeal = {
  id: 'meal-1',
  description: 'Mom\'s "famous" chili & cornbread 🌶️ + 50% more',
  loggedAt: '2026-10-04T16:30:00.000Z',
  status: 'awaiting-estimate',
}

const mealWithMacros: LoggedMeal = {
  id: 'meal-2',
  description: 'greek yogurt',
  loggedAt: '2026-10-04T12:00:00.000Z',
  macros: { kcal: 150, proteinGrams: 20, carbsGrams: 8, fatGrams: 4.5 },
  status: 'logged',
}

function decodeShortcutText(shortcutUrl: string): unknown {
  const encodedText = shortcutUrl.split('&text=')[1]
  return JSON.parse(decodeURIComponent(encodedText))
}

describe('buildLogFoodShortcutUrl', () => {
  it('targets the Log Food shortcut with text input and no plus-encoded spaces', () => {
    const shortcutUrl = buildLogFoodShortcutUrl(mealAwaitingEstimate)

    expect(shortcutUrl.startsWith('shortcuts://run-shortcut?name=Log%20Food&input=text&text=')).toBe(true)
    expect(shortcutUrl).not.toContain('+')
    expect(shortcutUrl.split('&')).toHaveLength(3)
  })

  it('round-trips quotes, ampersands, emoji and percent signs', () => {
    expect(decodeShortcutText(buildLogFoodShortcutUrl(mealAwaitingEstimate))).toEqual({
      description: mealAwaitingEstimate.description,
      loggedAt: '2026-10-04T16:30:00.000Z',
      kcal: null,
      protein_g: null,
      carbs_g: null,
      fat_g: null,
    })
  })

  it('sends known macros with the Shortcut key names', () => {
    expect(buildLogFoodShortcutPayload(mealWithMacros)).toMatchObject({
      kcal: 150,
      protein_g: 20,
      carbs_g: 8,
      fat_g: 4.5,
    })
  })
})
