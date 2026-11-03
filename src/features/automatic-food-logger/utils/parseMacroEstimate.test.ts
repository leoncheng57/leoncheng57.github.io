import { describe, expect, it } from 'vitest'
import { parseMacroEstimate } from './parseMacroEstimate'

describe('parseMacroEstimate', () => {
  it('reads the Shortcut key names and rounds the values', () => {
    expect(parseMacroEstimate('{"kcal":649.6,"protein_g":40.04,"carbs_g":70,"fat_g":22.25}')).toEqual({
      kcal: 650,
      proteinGrams: 40,
      carbsGrams: 70,
      fatGrams: 22.3,
    })
  })

  it('finds the JSON inside surrounding prose or code fences', () => {
    const replyWithProse = 'Sure! Here is my estimate:\n```json\n{"kcal": 500, "protein_g": 30, "carbs_g": 50, "fat_g": 15}\n```'
    expect(parseMacroEstimate(replyWithProse)).toEqual({ kcal: 500, proteinGrams: 30, carbsGrams: 50, fatGrams: 15 })
  })

  it('accepts alternate key spellings and numeric strings', () => {
    expect(parseMacroEstimate('{"calories":"320","protein":"12","carbs":40,"fat":"9.5"}')).toEqual({
      kcal: 320,
      proteinGrams: 12,
      carbsGrams: 40,
      fatGrams: 9.5,
    })
  })

  it.each([
    ['plain text', 'not an estimate'],
    ['broken JSON', '{"kcal": 500, "protein_g": }'],
    ['a missing value', '{"kcal":500,"protein_g":30,"carbs_g":50}'],
    ['a negative value', '{"kcal":500,"protein_g":-1,"carbs_g":50,"fat_g":10}'],
    ['a null value', '{"kcal":null,"protein_g":1,"carbs_g":50,"fat_g":10}'],
    ['an array', '[{"kcal":500}]'],
  ])('rejects %s', (_caseName, clipboardText) => {
    expect(parseMacroEstimate(clipboardText)).toBeNull()
  })
})
