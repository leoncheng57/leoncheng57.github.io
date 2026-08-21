import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PALETTE,
  getPalette,
  isPalette,
  PALETTES,
  type Palette,
} from './palettes'
// Raw source, not the CSS-modules export: the palette rules are attribute
// selectors, so they never surface as hashed class names.
import cssSource from './weather.module.css?raw'

/** Every token a palette block is expected to set, in either mode. */
const TOKENS = [
  'bg',
  'surface',
  'surface-raised',
  'ink',
  'ink-soft',
  'muted',
  'accent',
  'accent-strong',
  'accent-contrast',
  'line',
  'focus',
  'high',
  'low',
  'precip',
  'aqi',
  'good',
  'moderate',
  'sensitive',
  'unhealthy',
]

const NYC_PALETTES = [
  'harbor-fog',
  'brownstone-heat',
  'taxi-midnight',
  'park-avenue-patina',
  'coney-island-neon',
  'subway-mosaic',
  'guggenheim-paper',
  'queens-night-market',
]

/** Grab the declaration body of a single `[data-palette=...]` rule. */
function paletteBlock(id: string, mode: 'light' | 'dark'): string | null {
  const selector =
    mode === 'light'
      ? `.page[data-palette='${id}'] {`
      : `.page[data-palette='${id}'][data-theme='dark'] {`
  const start = cssSource.indexOf(selector)
  if (start === -1) return null
  const end = cssSource.indexOf('}', start)
  return cssSource.slice(start + selector.length, end)
}

describe('palette registry', () => {
  it('lists the five original palettes plus the eight NYC colorways', () => {
    expect(PALETTES.map((palette) => palette.id)).toEqual([
      'classic',
      'sky',
      'sunset',
      'forest',
      'plum',
      ...NYC_PALETTES,
    ])
  })

  it('gives every palette a unique id and a non-empty accessible name', () => {
    const ids = PALETTES.map((palette) => palette.id)
    expect(new Set(ids).size).toBe(ids.length)

    const labels = PALETTES.map((palette) => palette.label)
    expect(new Set(labels).size).toBe(labels.length)
    for (const label of labels) expect(label.trim().length).toBeGreaterThan(0)
  })

  it('records four to six representative hex swatches per palette', () => {
    for (const palette of PALETTES) {
      expect(
        palette.swatches.length,
        `${palette.id} swatch count`,
      ).toBeGreaterThanOrEqual(4)
      expect(
        palette.swatches.length,
        `${palette.id} swatch count`,
      ).toBeLessThanOrEqual(6)
      for (const swatch of palette.swatches) {
        expect(swatch, `${palette.id} swatch`).toMatch(/^#[0-9a-f]{6}$/)
      }
    }
  })

  it('exposes metadata without applying a palette', () => {
    // The picker in #233 reads names and swatches for every option while only
    // one palette is active, so lookups must not depend on the DOM.
    const taxi = getPalette('taxi-midnight')
    expect(taxi.label).toBe('Taxi After Midnight')
    expect(taxi.swatches).toContain('#ffd400')
    expect(document.querySelector('[data-palette]')).toBeNull()
  })

  it('validates palette ids and defaults to classic', () => {
    expect(DEFAULT_PALETTE).toBe('classic')
    expect(isPalette('harbor-fog')).toBe(true)
    expect(isPalette('classic')).toBe(true)
    expect(isPalette('midtown-mystery')).toBe(false)
    expect(isPalette('')).toBe(false)
    expect(isPalette(null)).toBe(false)
    expect(isPalette(undefined)).toBe(false)
    expect(isPalette(42)).toBe(false)
  })
})

describe('palette stylesheet', () => {
  it('defines a light and a dark block for every NYC colorway', () => {
    for (const id of NYC_PALETTES) {
      expect(paletteBlock(id, 'light'), `${id} light block`).not.toBeNull()
      expect(paletteBlock(id, 'dark'), `${id} dark block`).not.toBeNull()
    }
  })

  it('sets every semantic token deliberately in both modes', () => {
    // Guards against a new colorway silently inheriting classic's accent,
    // series or AQI status colors.
    for (const id of NYC_PALETTES) {
      for (const mode of ['light', 'dark'] as const) {
        const block = paletteBlock(id, mode) ?? ''
        for (const token of TOKENS) {
          expect(block, `${id} ${mode} --wx-${token}`).toContain(`--wx-${token}:`)
        }
      }
    }
  })

  it('keeps the stylesheet and the registry in step', () => {
    const styled = new Set(
      [...cssSource.matchAll(/\[data-palette='([^']+)'\]/g)].map(
        (match) => match[1],
      ),
    )
    // No orphan rules for palettes the picker cannot offer.
    for (const id of styled) {
      expect(isPalette(id), `${id} is registered`).toBe(true)
    }
    // Every registered palette is styled. `classic` is the exception: it is
    // the base `.page` rule that the others override, so it has no
    // `[data-palette]` block of its own.
    for (const palette of PALETTES) {
      const id: Palette = palette.id
      if (id === DEFAULT_PALETTE) {
        expect(styled.has(id)).toBe(false)
        continue
      }
      expect(styled.has(id), `${id} is styled`).toBe(true)
    }
  })
})
