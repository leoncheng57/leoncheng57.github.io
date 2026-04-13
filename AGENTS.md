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

## PR / MR Notes

- When a change has a visible UI impact, include screenshots in the PR/MR description whenever possible.
- Prefer fresh screenshots captured from the current local app state rather than reusing older assets.
- If the screenshots need to be persisted for the PR/MR description, add only the minimal image assets required and link/embed those hosted GitHub URLs in the PR/MR body.

### Playwright Screenshot Workflow

1. Start the local app with:

```bash
npm run dev
```

2. Use the Playwright wrapper to open the page you want to capture:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
"$PWCLI" open http://localhost:5173/blog --headed
```

3. Capture a screenshot:

```bash
"$PWCLI" screenshot
```

4. Copy the generated `.playwright-cli/*.png` file into a stable tracked location such as:

```bash
docs/pr-assets/
```

5. If multiple screenshots are needed, repeat for each page or state.

### GitHub PR Screenshot Workflow

1. Add only the screenshot assets needed for the PR:

```bash
git add docs/pr-assets/<image>.png
```

2. Commit and push them to the branch or to `main`, depending on whether the PR is still open or already merged.

3. Use GitHub-hosted raw URLs in the PR body, for example:

```md
![Blog index](https://raw.githubusercontent.com/leoncheng57/leoncheng57.github.io/main/docs/pr-assets/blog-index.png)
```

4. Update the PR description with `gh`:

```bash
gh pr edit <number> --body-file <file>
```

or:

```bash
gh pr edit <number> --body "$(cat <<'EOF'
## Screenshots
![Example](https://raw.githubusercontent.com/leoncheng57/leoncheng57.github.io/main/docs/pr-assets/example.png)
EOF
)"
```

### Screenshot Rules

- Do not rely on local-only `.playwright-cli/` image paths in PR descriptions.
- Do not add unnecessary screenshots; include only the views that help reviewers understand the UI change.
- Prefer naming screenshot assets after the page or state they represent, such as `blog-index.png` or `blog-article.png`.

## Deployment Note

Vite is configured to build into `docs/` in `vite.config.ts`.
If this repository is deployed via GitHub Pages, the published site content comes from that generated directory.
