/**
 * Single source of truth for the beta theme-preview palettes.
 *
 * Each entry pairs a stable `id` (also the `data-palette` attribute value and
 * the persisted localStorage value) with an accessible `label` and one swatch
 * per semantic role. Keeping all three together lets a swatch-based picker
 * render every palette without activating it, and stops the ID/label list
 * from drifting away from the colors.
 *
 * `swatches` is keyed by role rather than positional so a palette can never
 * silently omit a role or reorder the strip. Render order is fixed by
 * `SWATCH_ROLES`, which the picker maps over to build both its column headers
 * and every row, so headers and colors cannot fall out of alignment.
 *
 * The full token sets live in `weather.module.css` as `[data-palette='...']`
 * blocks, one for light and one for dark. Every swatch below is the literal
 * value of the matching `--wx-*` token, all six taken from the same mode: the
 * one the palette is designed around (light-leaning palettes quote their light
 * tokens, dark-leaning palettes quote their dark tokens). `palettes.test.ts`
 * enforces both halves of that rule.
 */

/**
 * Swatch roles, in the order the picker paints them.
 *
 * - `bg` — page background (`--wx-bg`)
 * - `surface` — card background (`--wx-surface`)
 * - `ink` — body text (`--wx-ink`)
 * - `accent` — links, controls and selection (`--wx-accent`)
 * - `high` — warm temperature series (`--wx-high`)
 * - `low` — cool temperature / precipitation series (`--wx-low`)
 */
export const SWATCH_ROLES = [
  'bg',
  'surface',
  'ink',
  'accent',
  'high',
  'low',
] as const

export type SwatchRole = (typeof SWATCH_ROLES)[number]

/** One hex color per role. Every role is required — no partial strips. */
export type PaletteSwatches = Readonly<Record<SwatchRole, string>>

export type PaletteDefinition = {
  /** Stable ID: `data-palette` value and localStorage value. */
  readonly id: string
  /** Human-readable name announced by the picker. */
  readonly label: string
  /** One representative color per semantic role. */
  readonly swatches: PaletteSwatches
}

export const PALETTES = [
  {
    id: 'classic',
    label: 'Classic Navy',
    // The base `.page` rule; classic's accent is the same navy as its ink.
    swatches: {
      bg: '#f4f7fb',
      surface: '#ffffff',
      ink: '#0f2a43',
      accent: '#0f2a43',
      high: '#d9534f',
      low: '#2f7bbf',
    },
  },
  {
    id: 'sky',
    label: 'Electric Sky',
    swatches: {
      bg: '#eef6fd',
      surface: '#ffffff',
      ink: '#0f2a43',
      accent: '#0369a1',
      high: '#e11d48',
      low: '#0284c7',
    },
  },
  {
    id: 'sunset',
    label: 'Sunset Coral',
    swatches: {
      bg: '#fdf3ee',
      surface: '#ffffff',
      ink: '#0f2a43',
      accent: '#c2410c',
      high: '#dc2626',
      low: '#0e7490',
    },
  },
  {
    id: 'forest',
    label: 'Forest Green',
    swatches: {
      bg: '#f1f7f2',
      surface: '#ffffff',
      ink: '#0f2a43',
      accent: '#166534',
      high: '#b45309',
      low: '#0d9488',
    },
  },
  {
    id: 'plum',
    label: 'Plum Punch',
    swatches: {
      bg: '#f8f2fb',
      surface: '#ffffff',
      ink: '#0f2a43',
      accent: '#7e22ce',
      high: '#db2777',
      low: '#2563eb',
    },
  },
  {
    id: 'harbor-fog',
    label: 'Harbor Fog',
    swatches: {
      bg: '#f2f7f6',
      surface: '#ffffff',
      ink: '#173b3f',
      accent: '#00545c',
      high: '#983329',
      low: '#14577d',
    },
  },
  {
    id: 'brownstone-heat',
    label: 'Brownstone Heat',
    swatches: {
      bg: '#f8efe5',
      surface: '#fffaf4',
      ink: '#442b26',
      accent: '#8f3f2d',
      high: '#923026',
      low: '#11575d',
    },
  },
  {
    id: 'taxi-midnight',
    label: 'Taxi After Midnight',
    // Designed dark: these are the `[data-theme='dark']` tokens.
    swatches: {
      bg: '#080b0f',
      surface: '#151a20',
      ink: '#f7fafc',
      accent: '#ffd400',
      high: '#ff6b5e',
      low: '#45c7f0',
    },
  },
  {
    id: 'park-avenue-patina',
    label: 'Park Avenue Patina',
    swatches: {
      bg: '#eeede7',
      surface: '#f8f7f2',
      ink: '#283430',
      accent: '#40574f',
      high: '#803f38',
      low: '#315d6a',
    },
  },
  {
    id: 'coney-island-neon',
    label: 'Coney Island Neon',
    // Designed dark: these are the `[data-theme='dark']` tokens.
    swatches: {
      bg: '#111023',
      surface: '#1c1930',
      ink: '#f5f1ff',
      accent: '#c8ff3d',
      high: '#ff5c8a',
      low: '#47d7e8',
    },
  },
  {
    id: 'subway-mosaic',
    label: 'Subway Mosaic',
    swatches: {
      bg: '#f4f1e8',
      surface: '#fffdf7',
      ink: '#192f44',
      accent: '#005a70',
      high: '#96303d',
      low: '#006c67',
    },
  },
  {
    id: 'guggenheim-paper',
    label: 'Guggenheim Paper',
    swatches: {
      bg: '#f5f2e9',
      surface: '#fffefa',
      ink: '#171717',
      accent: '#2448b8',
      high: '#a82e25',
      low: '#006c7a',
    },
  },
  {
    id: 'queens-night-market',
    label: 'Queens Night Market',
    // Designed dark: these are the `[data-theme='dark']` tokens.
    swatches: {
      bg: '#11111a',
      surface: '#1d1a29',
      ink: '#f7f2ff',
      accent: '#f6c453',
      high: '#ff6f91',
      low: '#55d6be',
    },
  },
] as const satisfies readonly PaletteDefinition[]

export type Palette = (typeof PALETTES)[number]['id']

/** Applied when nothing is stored, or when the stored value is not a palette. */
export const DEFAULT_PALETTE: Palette = 'classic'

/** Narrowing guard used to validate persisted and user-supplied values. */
export function isPalette(value: unknown): value is Palette {
  return PALETTES.some((palette) => palette.id === value)
}

/** Look up a palette's metadata (label and swatches) without applying it. */
export function getPalette(id: Palette): PaletteDefinition {
  const found = PALETTES.find((palette) => palette.id === id)
  // `id` is constrained to the registry, so this is unreachable in practice.
  return found ?? PALETTES[0]
}
