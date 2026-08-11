import { describe, expect, it } from 'vitest'
import { applyComparison, expectedScore, INITIAL_RATING } from './elo'

describe('Elo ratings', () => {
  it('gives equally rated books equal expectations', () => {
    expect(expectedScore(INITIAL_RATING, INITIAL_RATING)).toBe(0.5)
  })

  it('transfers 16 points after an even comparison', () => {
    const ratings = applyComparison({}, 'pachinko', 'other-book')

    expect(ratings.pachinko).toBe(1516)
    expect(ratings['other-book']).toBe(1484)
  })

  it('moves an upset more than an expected win', () => {
    const startingRatings = { favorite: 1700, underdog: 1300 }
    const expectedResult = applyComparison(startingRatings, 'favorite', 'underdog')
    const upsetResult = applyComparison(startingRatings, 'underdog', 'favorite')

    expect(expectedResult.favorite - 1700).toBeLessThan(upsetResult.underdog - 1300)
  })
})
