# Dark Mode Design

**Date:** 2026-03-16
**Topic:** Convert site to always-dark theme using CSS custom properties
**Status:** Approved

## Context

Single-page personal portfolio site. Currently has a white background with black text and hardcoded color values in two places. The goal is an always-dark theme — no toggle, no system preference detection.

## Approach

Define all theme values as CSS custom properties in `colors.css`. Reference them in `globals.css` and `App.module.css`. No component files need changes beyond what already uses custom properties.

## Color Palette

Defined on `:root` in `src/styles/colors.css`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--blue-emphasis` | `#4fa3e0` | Accent color (lightened from `#0575c7` for dark bg contrast) |
| `--bg` | `#121212` | Page background |
| `--surface` | `#1e1e1e` | Slightly lighter surface (available for future use) |
| `--text-primary` | `#e0e0e0` | Body text |
| `--text-muted` | `#9e9e9e` | Secondary text (available for future use) |
| `--hr-color` | `#3a3a3a` | Divider lines |
| `--link-color` | `#e0e0e0` | Link text color |

## File Changes

**`src/styles/colors.css`** — replace entire file with the palette above.

**`src/styles/globals.css`** — add to `body`:
```css
background-color: var(--bg);
color: var(--text-primary);
```

**`src/App.module.css`** — replace two hardcoded values:
- `.container a { color: black }` → `color: var(--link-color)`
- `.container hr` border `rgb(190, 190, 190)` → `var(--hr-color)`

## Out of Scope

- Dark/light toggle
- `prefers-color-scheme` media query
- Changes to `headline.module.css` (`color: orange` on `.summaryHighlight` is intentional)
- Changes to `social.module.css` (no hardcoded colors)
