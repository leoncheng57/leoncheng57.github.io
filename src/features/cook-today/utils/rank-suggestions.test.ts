import { describe, expect, it } from 'vitest'
import { buildCuratedCandidates, rankSuggestions } from './rank-suggestions'
import type { LabeledResult } from './rank-suggestions'

const chicken: LabeledResult = {
  label: 'Chicken',
  meals: [
    { id: '1', title: 'Chicken Rice', thumbnailUrl: '' },
    { id: '2', title: 'Chicken Salad', thumbnailUrl: '' },
  ],
}

const rice: LabeledResult = {
  label: 'Rice',
  meals: [{ id: '1', title: 'Chicken Rice', thumbnailUrl: '' }],
}

describe('rankSuggestions', () => {
  it('ranks meals that satisfy more checked boxes first', () => {
    const ranked = rankSuggestions([chicken, rice], [], 5)

    expect(ranked[0].id).toBe('1')
    expect(ranked[0].matchedLabels).toEqual(['Chicken', 'Rice'])
    expect(ranked[1].matchedLabels).toEqual(['Chicken'])
  })

  it('does not duplicate a meal returned by several filters', () => {
    const ranked = rankSuggestions([chicken, rice], [], 5)

    expect(ranked.filter((candidate) => candidate.id === '1')).toHaveLength(1)
  })

  it('limits the number of suggestions', () => {
    const ranked = rankSuggestions([chicken, rice], [], 1)

    expect(ranked).toHaveLength(1)
  })

  it('reorders equally matched meals when the shuffle seed changes', () => {
    const many: LabeledResult = {
      label: 'Chicken',
      meals: Array.from({ length: 8 }, (_, index) => ({
        id: String(index),
        title: `Meal ${index}`,
        thumbnailUrl: '',
      })),
    }

    const first = rankSuggestions([many], [], 4, 1).map((meal) => meal.id)
    const second = rankSuggestions([many], [], 4, 2).map((meal) => meal.id)

    expect(first).not.toEqual(second)
    expect(rankSuggestions([many], [], 4, 1).map((meal) => meal.id)).toEqual(
      first
    )
  })
})

describe('buildCuratedCandidates', () => {
  it('surfaces the butter mochi when its ingredients are checked', () => {
    const candidates = buildCuratedCandidates({
      ingredients: ['egg', 'rice'],
      cuisines: [],
      diets: [],
    })

    expect(candidates).toHaveLength(1)
    expect(candidates[0].title).toBe('Crispy Shanghai Butter Mochi')
    expect(candidates[0].matchedLabels).toEqual(['Eggs', 'Rice'])
    expect(candidates[0].curated?.ingredients.length).toBeGreaterThan(5)
  })

  it('matches on cuisine and diet too', () => {
    const candidates = buildCuratedCandidates({
      ingredients: [],
      cuisines: ['chinese'],
      diets: ['vegetarian'],
    })

    expect(candidates[0].matchedLabels).toEqual(['Chinese', 'Vegetarian'])
  })

  it('stays out of the results when nothing matches', () => {
    const candidates = buildCuratedCandidates({
      ingredients: ['beef'],
      cuisines: ['mexican'],
      diets: [],
    })

    expect(candidates).toEqual([])
  })
})
