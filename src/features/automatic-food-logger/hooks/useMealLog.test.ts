import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useMealLog, { MEAL_LOG_STORAGE_KEY, readStoredMeals } from './useMealLog'

const estimatedMacros = { kcal: 640, proteinGrams: 38, carbsGrams: 72, fatGrams: 21 }

describe('useMealLog', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  it('stores a new meal synchronously, newest first, before any re-render', () => {
    const { result } = renderHook(() => useMealLog())

    act(() => {
      result.current.addMeal('  oatmeal  ', { kcal: 300, proteinGrams: 10, carbsGrams: 50, fatGrams: 6 })
    })
    let burritoBowlId = ''
    act(() => {
      burritoBowlId = result.current.addMeal('burrito bowl').id
      expect(readStoredMeals()[0].id).toBe(burritoBowlId)
    })

    expect(result.current.meals.map((meal) => meal.description)).toEqual(['burrito bowl', 'oatmeal'])
    expect(result.current.meals[0].status).toBe('awaiting-estimate')
    expect(result.current.meals[1].status).toBe('logged')
  })

  it('applies a pasted estimate and removes meals', () => {
    const { result } = renderHook(() => useMealLog())
    let mealId = ''
    act(() => {
      mealId = result.current.addMeal('ramen').id
    })

    act(() => result.current.applyEstimate(mealId, estimatedMacros))
    expect(result.current.meals[0]).toMatchObject({ status: 'logged', macros: estimatedMacros })
    expect(readStoredMeals()[0].macros).toEqual(estimatedMacros)

    act(() => result.current.removeMeal(mealId))
    expect(result.current.meals).toEqual([])
    expect(readStoredMeals()).toEqual([])
  })

  it('loads stored meals and ignores malformed entries', () => {
    window.localStorage.setItem(
      MEAL_LOG_STORAGE_KEY,
      JSON.stringify([
        { id: 'a', description: 'toast', loggedAt: '2026-10-04T12:00:00.000Z', status: 'logged' },
        { id: 'b', description: 42 },
      ]),
    )

    const { result } = renderHook(() => useMealLog())
    expect(result.current.meals.map((meal) => meal.id)).toEqual(['a'])
  })

  it('keeps working in memory when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    const { result } = renderHook(() => useMealLog())
    act(() => {
      result.current.addMeal('apple')
      result.current.addMeal('banana')
    })

    expect(result.current.meals.map((meal) => meal.description)).toEqual(['banana', 'apple'])
  })
})
