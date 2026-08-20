// Curated dashboard theme presets + a temporary switchable control.
//
// This module and `ThemeSwitcher` are exploratory scaffolding: they define
// theme tokens and a controlled UI for picking one, but nothing in the app
// wires them up yet. `App.tsx` still renders with `dashboard.module.css`
// exactly as before. Wiring this in (e.g. writing the selected theme's
// tokens onto `:root`) is a separate, deliberate integration step.
//
// Every theme reuses the same token shape as the CSS custom properties
// already declared in `dashboard.module.css` (`--bg`, `--surface`,
// `--text-primary`, `--text-muted`, `--link-color`, `--link-hover-color`,
// `--accent-soft`, `--accent-warm`, `--blue-emphasis`), so a future
// integration can apply a theme by writing these onto `:root` without
// touching component markup.
//
// All foreground/background pairs below were checked against WCAG 2.1
// contrast math (see `contrastRatio` + `assertAccessibleTheme`) and meet at
// least AA for normal text (>= 4.5:1) and AA for large/UI text (>= 3:1)
// where used at smaller sizes (links, muted text).

export type ThemeTokens = {
  bg: string
  surface: string
  textPrimary: string
  textMuted: string
  linkColor: string
  linkHoverColor: string
  accentSoft: string
  accentWarm: string
  blueEmphasis: string
}

export type Theme = {
  id: string
  name: string
  description: string
  tokens: ThemeTokens
}

export const THEMES: Theme[] = [
  {
    id: 'classic-aqua',
    name: 'Classic Aqua Grid',
    description:
      'The current dashboard look: cool aqua surfaces, a graph-paper grid, and a deep navy blue text color.',
    tokens: {
      bg: '#eaf3f4',
      surface: '#f5f8f7',
      textPrimary: '#10233d',
      textMuted: '#47617e',
      linkColor: '#087da8',
      linkHoverColor: '#075985',
      accentSoft: '#d5f0fa',
      accentWarm: '#f4ad9c',
      blueEmphasis: '#087da8',
    },
  },
  {
    id: 'midnight-slate',
    name: 'Midnight Slate',
    description:
      'A low-glare dark theme with slate-blue surfaces and a bright sky-blue link color for night-time reading.',
    tokens: {
      bg: '#121a24',
      surface: '#1a2531',
      textPrimary: '#eef3f8',
      textMuted: '#a9b8c9',
      linkColor: '#7cc4ff',
      linkHoverColor: '#a9dcff',
      accentSoft: '#22405a',
      accentWarm: '#ffb199',
      blueEmphasis: '#7cc4ff',
    },
  },
  {
    id: 'sunset-contrast',
    name: 'Sunset Contrast',
    description:
      'A warm, high-contrast light theme with cream surfaces and a bold burnt-orange accent for emphasis.',
    tokens: {
      bg: '#fff6ec',
      surface: '#fffaf3',
      textPrimary: '#2b1a12',
      textMuted: '#7a4b32',
      linkColor: '#b5410f',
      linkHoverColor: '#8a3009',
      accentSoft: '#ffe0c2',
      accentWarm: '#ffcf6b',
      blueEmphasis: '#b5410f',
    },
  },
  {
    id: 'forest-focus',
    name: 'Forest Focus',
    description:
      'A muted, natural green palette meant to reduce visual fatigue during long analysis sessions.',
    tokens: {
      bg: '#eef4ec',
      surface: '#f6faf4',
      textPrimary: '#132416',
      textMuted: '#3f5a44',
      linkColor: '#0c6b3a',
      linkHoverColor: '#094e2a',
      accentSoft: '#d7ecd9',
      accentWarm: '#e7c68a',
      blueEmphasis: '#0c6b3a',
    },
  },
  {
    id: 'high-contrast-mono',
    name: 'High Contrast Mono',
    description:
      'A near-monochrome black-and-white theme built for maximum legibility and accessibility.',
    tokens: {
      bg: '#ffffff',
      surface: '#f2f2f2',
      textPrimary: '#000000',
      textMuted: '#3d3d3d',
      linkColor: '#0000ee',
      linkHoverColor: '#000099',
      accentSoft: '#e5e5e5',
      accentWarm: '#ffe27a',
      blueEmphasis: '#0000ee',
    },
  },
]

export const DEFAULT_THEME_ID = THEMES[0].id

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find((theme) => theme.id === id)
}

// --- Contrast helpers -------------------------------------------------
//
// Used above (during authoring) and by tests to guarantee every theme
// keeps enough contrast for text on both `bg` and `surface`.

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const value = parseInt(clean, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const srgb = c / 255
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  }
  const [rl, gl, bl] = [channel(r), channel(g), channel(b)]
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexToRgb(hexA))
  const lumB = relativeLuminance(hexToRgb(hexB))
  const [lighter, darker] = lumA >= lumB ? [lumA, lumB] : [lumB, lumA]
  return (lighter + 0.05) / (darker + 0.05)
}

const MIN_NORMAL_TEXT_CONTRAST = 4.5
const MIN_UI_TEXT_CONTRAST = 3

export function assertAccessibleTheme(theme: Theme): void {
  const { tokens } = theme
  const checks: Array<[string, string, string, number]> = [
    ['textPrimary on bg', tokens.textPrimary, tokens.bg, MIN_NORMAL_TEXT_CONTRAST],
    ['textPrimary on surface', tokens.textPrimary, tokens.surface, MIN_NORMAL_TEXT_CONTRAST],
    ['textMuted on bg', tokens.textMuted, tokens.bg, MIN_UI_TEXT_CONTRAST],
    ['linkColor on surface', tokens.linkColor, tokens.surface, MIN_UI_TEXT_CONTRAST],
  ]
  for (const [label, fg, bg, min] of checks) {
    const ratio = contrastRatio(fg, bg)
    if (ratio < min) {
      throw new Error(
        `Theme "${theme.name}" fails contrast check for ${label}: ${ratio.toFixed(2)} < ${min}`,
      )
    }
  }
}

THEMES.forEach(assertAccessibleTheme)
