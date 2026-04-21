# Leon's Website

A personal site built with [Vite](https://vitejs.dev/) and [React](https://react.dev/), deployed via GitHub Pages from the `docs/` directory.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

The site is served at http://localhost:5173.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — create the production build in `docs/`
- `npm run lint` — run ESLint over `src/`
- `npm test` — run the Vitest test suite in watch mode
- `npm run test:run` — run the Vitest suite once
- `npm run publish` — alias for `npm run build`

## Project Structure

- `src/App.tsx` — top-level app composition
- `src/components/headline/` — intro copy and profile section
- `src/components/social/` — social links section
- `src/styles/` — shared global and color styles
- `content/` — markdown content rendered by the site
- `public/` — static assets copied through Vite
- `docs/` — generated build output used for deployment

## Editing

- Make content and component changes in `src/`, not in `docs/`.
- Rebuild with `npm run build` when you need updated deployment artifacts in `docs/`.

## Deployment

Vite is configured to build into `docs/` (see `vite.config.ts`). GitHub Pages serves the site from that directory on the `main` branch.

See [`AGENTS.md`](./AGENTS.md) for more detailed contributor notes, including the Playwright screenshot workflow for PRs.
