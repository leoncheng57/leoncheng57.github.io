# Vite Migration Design

**Date:** 2026-03-15
**Topic:** Migrate from Next.js to Vite + React
**Status:** Approved

## Context

This is a single-page personal portfolio site (`leoncheng57.github.io`) deployed as a static export to GitHub Pages with a custom domain (CNAME). It currently uses Next.js 15 with the Pages Router, but uses none of Next.js's SSR, API routes, or file-based routing features. The motivation for migration is that Next.js is overkill for a single static page.

## Approach

Clean-slate migration: remove Next.js entirely and set up a fresh Vite + React TypeScript project, moving existing components and styles into the new structure.

## Project Structure

```
/
├── src/
│   ├── main.tsx            # entry point (replaces pages/_app.tsx)
│   ├── App.tsx             # root component (replaces pages/index.tsx)
│   ├── App.module.css      # moved from pages/Home.module.css
│   ├── components/         # moved as-is from current components/
│   └── styles/             # moved as-is from current styles/
├── public/                 # static assets (unchanged)
├── index.html              # Vite HTML entry point (includes <head> meta + GA scripts)
├── vite.config.ts          # replaces next.config.js
├── tsconfig.json           # updated for Vite
└── package.json            # updated dependencies
```

## Build & Deploy Pipeline

| Script | Command |
|--------|---------|
| `dev` | `vite` |
| `build` | `vite build` |
| `publish` | `cp docs/CNAME CNAME_copy && npm run build && touch docs/.nojekyll && cp CNAME_copy docs/CNAME && rm CNAME_copy` |

The `build-export` script (previously `next build && next export -o docs`) is deleted — its function is now handled directly by `vite build` via the `outDir: 'docs'` config.

Vite is configured with `outDir: 'docs'` and `base: '/'` (custom domain means no subdirectory prefix needed).

## Dependencies

**Removed:**
- `next`
- `eslint-config-next`
- `@types/node`

**Added:**
- `vite`
- `@vitejs/plugin-react`

**Unchanged:**
- `react`, `react-dom`, `classnames`
- `typescript`, `@types/react`, `@types/react-dom`
- `eslint` (kept, but config updated — see ESLint section)

## File Changes

**Deleted:**
- `next.config.js`
- `next-env.d.ts`
- `pages/` directory (contents migrated to `src/`)

**Added:**
- `index.html`
- `vite.config.ts`
- `src/main.tsx`
- `src/App.tsx` (rewritten from `pages/index.tsx` — see App.tsx section)
- `src/App.module.css` (moved from `pages/Home.module.css` — see CSS section)

**Updated:**
- `tsconfig.json` — updated for Vite (see tsconfig section)
- `package.json` — update scripts and dependencies
- `.eslintrc.json` — remove Next.js extends, use standard React rules
- `styles/colors.css` — convert `@value` to CSS custom property

## App.tsx Rewrite

`pages/index.tsx` contains three Next.js-specific constructs that must be replaced:

1. **`import type { NextPage } from "next"`** — removed. The component type becomes a plain `React.FC` (or untyped arrow function).

2. **`import Head from "next/head"`** — removed. The `<title>`, `<meta name="description">`, and `<link rel="icon">` tags move into `index.html`'s `<head>` block.

3. **`import Script from "next/script"`** — removed. The Google Analytics `<script>` tags move into `index.html` (see Google Analytics section).

All other content (component imports, JSX structure) is unchanged.

## Google Analytics

The existing GA setup uses `next/script` with `strategy="afterInteractive"`. In Vite, this moves to `index.html` as standard `<script>` tags placed before `</body>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-5MLNJQ7789"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-5MLNJQ7789');
</script>
```

This is functionally equivalent to `strategy="afterInteractive"`.

## CSS & Styling

**`@value` incompatibility:** Vite does not support the `@value` directive from `postcss-modules-values`. Three files use it:

- `styles/colors.css` — defines `@value blueEmphasis: #0575c7`
- `pages/Home.module.css` (→ `src/App.module.css`) — imports and uses `blueEmphasis`
- `components/headline/headline.module.css` — imports and uses `blueEmphasis` (for `.summaryHighlight`)

**Fix:** Convert to a CSS custom property:
- `styles/colors.css` becomes: `--blue-emphasis: #0575c7;` defined on `:root` (standard CSS variable)
- `src/App.module.css` replaces `blueEmphasis` references with `var(--blue-emphasis)` and removes the `@value` import lines
- `components/headline/headline.module.css` replaces `blueEmphasis` with `var(--blue-emphasis)` and removes the `@value` import lines
- `styles/globals.css` imports `colors.css` (or `colors.css` is merged into `globals.css`) so the variable is globally available

## tsconfig.json Changes

| Setting | Current | New |
|---------|---------|-----|
| `"jsx"` | `"preserve"` | `"react-jsx"` |
| `"target"` | `"es5"` | `"ES2020"` |
| `"moduleResolution"` | `"node"` | `"bundler"` |
| `"noEmit"` | `true` | `true` (kept — Vite uses esbuild; tsc is type-check only) |
| `"incremental"` | `true` | removed |
| `"include"` | `["next-env.d.ts", "**/*.ts", "**/*.tsx"]` | `["src", "index.html", "vite.config.ts"]` |
| `"types"` | (not set) | `["vite/client"]` added |

## ESLint

`eslint-config-next` is removed. `.eslintrc.json` currently extends `"next/core-web-vitals"` — this must be updated. Replace with `"eslint:recommended"` plus React-specific rules. The `@next/next/no-img-element` rule (currently disabled) is gone along with the Next.js config, so the `rules` block can be cleared.

Updated `.eslintrc.json`:
```json
{
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "rules": {}
}
```

This requires adding `eslint-plugin-react` as a devDependency.

## Manual Verification Checklist

After migration, verify the following before deploying:

**Dev server (`npm run dev`)**
- [ ] Dev server starts without errors
- [ ] Page loads at `http://localhost:5173`
- [ ] All sections render: headline (photo + name + summary), social links, experiences, copyright
- [ ] Blue highlight color (`.summaryHighlight`) appears correctly on the headline summary text
- [ ] Links have the correct dotted blue underline style
- [ ] `<hr>` dividers appear as dashed grey lines

**Production build (`npm run build`)**
- [ ] Build completes without errors or warnings
- [ ] `docs/` folder is populated with `index.html`, `assets/`, and static files
- [ ] `docs/CNAME` file is present after build (not deleted by Vite)
- [ ] `docs/.nojekyll` file is present

**Serve the production build locally**
Run `npx serve docs` and open `http://localhost:3000`:
- [ ] Page loads correctly from the static `docs/` output
- [ ] Assets (images, CSS) load without 404s
- [ ] No console errors

**Visual spot-checks**
- [ ] Profile photo loads
- [ ] Blue emphasis color matches the original (`#0575c7`)
- [ ] Page title in browser tab reads "Leon's Website"
- [ ] Favicon loads

**Google Analytics**
- [ ] Browser DevTools Network tab shows a request to `https://www.googletagmanager.com/gtag/js?id=G-5MLNJQ7789` on page load
- [ ] `window.dataLayer` exists and is an array in the browser console
- [ ] `window.dataLayer` contains at least one `config` event for `G-5MLNJQ7789` — verify with `console.log(window.dataLayer)` in DevTools
- [ ] No `gtag is not defined` or `dataLayer is not defined` console errors
- [ ] In Google Analytics dashboard (analytics.google.com), the Realtime report shows an active user when you load the page (requires a live deployed build, not local dev)

## Out of Scope

- Adding a router (not needed for a single-page site)
- Changing component logic or visual design
- Switching CSS tooling beyond the `@value` → CSS custom property conversion
