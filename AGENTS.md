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

## Filing GitHub Issues

- Use the single issue template at `.github/ISSUE_TEMPLATE/issue.md`
  (sections: Goal, Context, Scope, Acceptance criteria). Blank issues are
  disabled, so this template is the default.
- When creating issues with `gh issue create`, structure the body with the
  same section headings so issues stay consistent with the template.

## PR / MR Notes

- When a change has a visible UI impact, include screenshots in the PR/MR description whenever possible.
- Prefer fresh screenshots captured from the current local app state rather than reusing older assets.
- If the screenshots need to be persisted for the PR/MR description, add only the minimal image assets required and link/embed those hosted GitHub URLs in the PR/MR body.

### Automated PR Screenshots (preferred)

CI can capture screenshots for you. Add a fenced `screenshots` block to the
pull request description with one `[with-full:]/path[ -- Title]` line per
page. Wrap it in `ci:screenshots` markers under a `## CI: screenshots`
heading so the machine-parsed region is clearly separated from prose:

````md
<!-- ci:screenshots:start -->
## CI: screenshots

```screenshots
/blog -- Blog index with the new card layout
/blog/some-article
with-full:/blog/some-long-article -- Full article, header through footer
```
<!-- ci:screenshots:end -->
````

When both markers are present, the workflow only parses inside that region
(a stray ```screenshots block elsewhere in the description is ignored). A
bare block without markers still works for backward compatibility. Each
marker must sit alone on its own line; prose that merely mentions the
marker strings does not count.

`.github/workflows/pr-screenshots.yml` runs on every PR open, push, and
description edit. It builds the app, captures each listed path with
Playwright (`scripts/ci-screenshots.mjs`), publishes the PNGs to `gh-pages`
under `previews/pr-<number>/screenshots/`, and maintains a single sticky PR
comment embedding the images. The images are removed automatically when the
pull request closes.

Prefer this workflow over manually captured and committed screenshot
assets: it keeps image files out of the repository and cleans up after the
pull request closes. Only commit screenshot assets when CI capture is not
possible (for example, a state that cannot be reached from a plain URL).
List only the routes affected by visible UI changes; skip the block
entirely for pull requests with no UI impact.

Rules for the block:

- Paths must start with `/` and contain no whitespace.
- Every path gets a 1280x800 viewport capture rendered inline in the sticky
  comment. Prefix a path with `with-full:` to additionally capture the
  entire scroll height into a second file with a `--full` suffix; the
  full-page capture renders collapsed in a `<details>` block under the same
  section. Use this sparingly: long pages produce large PNGs.
- Append ` -- Title` (space, two dashes, space) to label a capture. The
  title becomes the heading in the sticky comment, making it clear what
  each screenshot shows; without one, the path is used instead. Add titles
  when the path alone does not explain why the page is listed.
- Lines starting with `#` are treated as comments and ignored.
- A `ci:screenshots:start` marker without a matching
  `<!-- ci:screenshots:end -->` marker fails the workflow.
- Removing the block (or all paths) updates the sticky comment to say no
  screenshots are requested.

To run the capture locally:

```bash
npm run build
node scripts/ci-screenshots.mjs "/blog -- Blog index" with-full:/apps
```

Output lands in `screenshot-output/` (untracked).

### Playwright Screenshot Workflow (manual fallback)

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
GitHub Actions publishes that generated directory to the `gh-pages` branch:

- `.github/workflows/deploy-production.yml` publishes production at the branch root and preserves `previews/`.
- `.github/workflows/pr-preview.yml` publishes each pull request under `previews/pr-<number>/` and removes it when the pull request closes.
- `.github/workflows/pr-screenshots.yml` publishes PR screenshots under `previews/pr-<number>/screenshots/`; the preview deploy excludes that folder from its clean step, and the preview cleanup removes it on close.
- All three workflows must keep the shared `gh-pages-deploy` concurrency group and non-force pushes because they write to the same branch.

GitHub Pages must publish from the `gh-pages` branch root. During the initial cutover, seed and verify the branch with the manual production workflow before changing the Pages source from `main:/docs`.
