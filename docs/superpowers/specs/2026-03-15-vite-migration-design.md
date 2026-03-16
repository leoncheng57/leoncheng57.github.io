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
│   ├── main.tsx          # entry point (replaces pages/_app.tsx)
│   ├── App.tsx           # root component (replaces pages/index.tsx)
│   ├── components/       # moved as-is from current components/
│   └── styles/           # moved as-is from current styles/
├── public/               # static assets (unchanged)
├── index.html            # Vite HTML entry point
├── vite.config.ts        # replaces next.config.js
├── tsconfig.json         # updated for Vite
└── package.json          # updated dependencies
```

## Build & Deploy Pipeline

| Script | Command |
|--------|---------|
| `dev` | `vite` |
| `build` | `vite build` |
| `publish` | `cp docs/CNAME CNAME_copy && npm run build && touch docs/.nojekyll && cp CNAME_copy docs/CNAME && rm CNAME_copy` |

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

## File Changes

**Deleted:**
- `next.config.js`
- `next-env.d.ts`
- `pages/` directory

**Added:**
- `index.html`
- `vite.config.ts`
- `src/main.tsx`
- `src/App.tsx` (content from `pages/index.tsx`)

**Updated:**
- `tsconfig.json` — swap Next.js lib/module settings for standard Vite/browser settings
- `package.json` — update scripts and dependencies

## CSS & Styling

No changes needed. Vite supports CSS Modules (`.module.css`) and global CSS imports natively with the same API as Next.js.

## Out of Scope

- Adding a router (not needed for a single-page site)
- Changing component logic or visual design
- Switching CSS tooling
