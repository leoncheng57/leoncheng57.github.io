import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PALETTE,
  getPalette,
  isPalette,
  PALETTES,
  SWATCH_ROLES,
  type Palette,
  type PaletteSwatches,
  type SwatchRole,
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

/** Each swatch role maps 1:1 onto a `--wx-*` custom property. */
const ROLE_TOKENS: Record<SwatchRole, string> = {
  bg: 'bg',
  surface: 'surface',
  ink: 'ink',
  accent: 'accent',
  high: 'high',
  low: 'low',
}

/** Grab the declaration body of a single rule, given its full selector. */
function ruleBlock(selector: string): string | null {
  const needle = `${selector} {`
  const start = cssSource.indexOf(needle)
  if (start === -1) return null
  const end = cssSource.indexOf('}', start)
  return cssSource.slice(start + needle.length, end)
}

/** Grab the declaration body of a single `[data-palette=...]` rule. */
function paletteBlock(id: string, mode: 'light' | 'dark'): string | null {
  return ruleBlock(
    mode === 'light'
      ? `.page[data-palette='${id}']`
      : `.page[data-palette='${id}'][data-theme='dark']`,
  )
}

function declaration(block: string | null, token: string): string | null {
  if (block === null) return null
  const match = block.match(new RegExp(`--wx-${token}:\\s*([^;]+);`))
  return match ? match[1].trim() : null
}

/**
 * Resolve `--wx-<token>` the way the browser would, for a palette in a mode.
 *
 * All four rules carry the same or rising specificity, so the cascade falls
 * back in source order: the palette's dark block wins, then its light block
 * (which is authored after `.page[data-theme='dark']` and therefore beats it),
 * then the base dark block, then the base light block.
 */
function resolveToken(
  id: string,
  mode: 'light' | 'dark',
  token: string,
): string | null {
  const chain =
    mode === 'dark'
      ? [
          paletteBlock(id, 'dark'),
          paletteBlock(id, 'light'),
          ruleBlock(`.page[data-theme='dark']`),
          ruleBlock('.page'),
        ]
      : [paletteBlock(id, 'light'), ruleBlock('.page')]

  for (const block of chain) {
    const value = declaration(block, token)
    if (value !== null) return value
  }
  return null
}

/** The six swatch values a palette would have if it quoted `mode`'s tokens. */
function resolveSwatches(
  id: string,
  mode: 'light' | 'dark',
): Record<string, string | null> {
  return Object.fromEntries(
    SWATCH_ROLES.map((role) => [role, resolveToken(id, mode, ROLE_TOKENS[role])]),
  )
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

  it('orders the swatch roles background-first, then accent, then the series', () => {
    // The picker draws one fixed-width column per role and labels them once at
    // the top of the listbox, so this order is part of the UI contract.
    expect([...SWATCH_ROLES]).toEqual([
      'bg',
      'surface',
      'ink',
      'accent',
      'high',
      'low',
    ])
  })

  it('defines all six roles as hex swatches for every palette', () => {
    // Uniform strips are what let the columns line up between rows. `classic`
    // used to omit `accent`, which made every row a different width.
    for (const palette of PALETTES) {
      const swatches: PaletteSwatches = palette.swatches
      expect(Object.keys(swatches).sort(), `${palette.id} swatch roles`).toEqual(
        [...SWATCH_ROLES].sort(),
      )
      for (const role of SWATCH_ROLES) {
        expect(swatches[role], `${palette.id} ${role} swatch`).toMatch(
          /^#[0-9a-f]{6}$/,
        )
      }
    }
  })

  it('exposes metadata without applying a palette', () => {
    // The picker in #233 reads names and swatches for every option while only
    // one palette is active, so lookups must not depend on the DOM.
    const taxi = getPalette('taxi-midnight')
    expect(taxi.label).toBe('Taxi After Midnight')
    expect(taxi.swatches.accent).toBe('#ffd400')
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

  it('quotes real token values, all six from a single mode', () => {
    // The swatches are the palette's identity, so a stale hex here shows the
    // user a colour the app never paints. Requiring one consistent mode also
    // stops a strip being assembled from a light background and dark text.
    for (const palette of PALETTES) {
      const actual = Object.fromEntries(
        SWATCH_ROLES.map((role) => [role, palette.swatches[role]]),
      )
      const light = resolveSwatches(palette.id, 'light')
      const dark = resolveSwatches(palette.id, 'dark')

      const matches =
        JSON.stringify(actual) === JSON.stringify(light) ||
        JSON.stringify(actual) === JSON.stringify(dark)

      expect(
        matches,
        `${palette.id} swatches must equal its light tokens ${JSON.stringify(
          light,
        )} or its dark tokens ${JSON.stringify(dark)}, got ${JSON.stringify(
          actual,
        )}`,
      ).toBe(true)
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
