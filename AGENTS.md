# AGENTS.md

## Overview

This repository contains a small personal site built with Vite and React.
Source code lives in `src/`.
Production build output is generated into `docs/`.

## Local Development

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Create the production build:

```bash
npm run build
```

## Project Structure

- `src/App.tsx`: top-level app composition
- `src/components/headline/`: intro copy and profile section
- `src/components/social/`: social links section
- `src/styles/`: shared global and color styles
- `public/`: static assets copied through Vite
- `docs/`: generated build output for deployment

## Editing Notes

- Make content and component changes in `src/`, not in `docs/`.
- Rebuild with `npm run build` when you need updated deployment artifacts in `docs/`.
- Keep changes small and consistent with the existing simple site structure.

## Deployment Note

Vite is configured to build into `docs/` in `vite.config.ts`.
If this repository is deployed via GitHub Pages, the published site content comes from that generated directory.
