/**
 * Single source of truth for the beta theme-preview palettes.
 *
 * Each entry pairs a stable `id` (also the `data-palette` attribute value and
 * the persisted localStorage value) with an accessible `label` and four to six
 * representative `swatches`. Keeping all three together lets a swatch-based
 * picker render every palette without activating it, and stops the ID/label
 * list from drifting away from the colors.
 *
 * The full token sets live in `weather.module.css` as `[data-palette='...']`
 * blocks, one for light and one for dark. The swatches below are the
 * palette's identity colors pulled from those blocks — background, surface,
 * ink, accent, and the two temperature series — in the mode the palette is
 * designed around (light-leaning palettes quote their light tokens,
 * dark-leaning palettes quote their dark tokens).
 */

export type PaletteDefinition = {
  /** Stable ID: `data-palette` value and localStorage value. */
  readonly id: string
  /** Human-readable name announced by the picker. */
  readonly label: string
  /** Four to six representative colors, ordered light-to-dark surfaces first. */
  readonly swatches: readonly string[]
}

export const PALETTES = [
  {
    id: 'classic',
    label: 'Classic Navy',
    swatches: ['#f4f7fb', '#ffffff', '#0f2a43', '#d9534f', '#2f7bbf'],
  },
  {
    id: 'sky',
    label: 'Electric Sky',
    swatches: ['#eef6fd', '#ffffff', '#0f2a43', '#0369a1', '#e11d48', '#0284c7'],
  },
  {
    id: 'sunset',
    label: 'Sunset Coral',
    swatches: ['#fdf3ee', '#ffffff', '#0f2a43', '#c2410c', '#dc2626', '#0e7490'],
  },
  {
    id: 'forest',
    label: 'Forest Green',
    swatches: ['#f1f7f2', '#ffffff', '#0f2a43', '#166534', '#b45309', '#0d9488'],
  },
  {
    id: 'plum',
    label: 'Plum Punch',
    swatches: ['#f8f2fb', '#ffffff', '#0f2a43', '#7e22ce', '#db2777', '#2563eb'],
  },
  {
    id: 'harbor-fog',
    label: 'Harbor Fog',
    swatches: ['#f2f7f6', '#ffffff', '#173b3f', '#00545c', '#983329', '#14577d'],
  },
  {
    id: 'brownstone-heat',
    label: 'Brownstone Heat',
    swatches: ['#f8efe5', '#fffaf4', '#442b26', '#8f3f2d', '#923026', '#11575d'],
  },
  {
    id: 'taxi-midnight',
    label: 'Taxi After Midnight',
    swatches: ['#080b0f', '#151a20', '#f7fafc', '#ffd400', '#ff6b5e', '#45c7f0'],
  },
  {
    id: 'park-avenue-patina',
    label: 'Park Avenue Patina',
    swatches: ['#eeede7', '#f8f7f2', '#283430', '#40574f', '#803f38', '#315d6a'],
  },
  {
    id: 'coney-island-neon',
    label: 'Coney Island Neon',
    swatches: ['#111023', '#1c1930', '#f5f1ff', '#c8ff3d', '#ff5c8a', '#47d7e8'],
  },
  {
    id: 'subway-mosaic',
    label: 'Subway Mosaic',
    swatches: ['#f4f1e8', '#fffdf7', '#192f44', '#005a70', '#96303d', '#006c67'],
  },
  {
    id: 'guggenheim-paper',
    label: 'Guggenheim Paper',
    swatches: ['#f5f2e9', '#fffefa', '#171717', '#2448b8', '#a82e25', '#006c7a'],
  },
  {
    id: 'queens-night-market',
    label: 'Queens Night Market',
    swatches: ['#11111a', '#1d1a29', '#f7f2ff', '#f6c453', '#ff6f91', '#55d6be'],
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
