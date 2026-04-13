# Blog Section Design

**Date:** 2026-04-13
**Project:** leoncheng57.github.io
**Status:** Draft design approved in chat

## Goal

Add a blog section to the existing Vite + React site with:

- a separate blog route inside the app
- a blog index for multiple posts
- repo-authored Markdown files with frontmatter
- article metadata such as last updated time and estimated reading time
- centered long-form reading layout
- adjustable article font size
- polished image rendering with click-to-zoom
- deeplinkable headings

## Recommendation

Use a Vite-native Markdown content pipeline inside the existing React app:

- `react-router-dom` for `/` , `/blog`, and `/blog/:slug`
- raw Markdown imports via `import.meta.glob`
- `gray-matter` for frontmatter parsing
- `react-markdown` for rendering
- `remark-gfm` for tables, task lists, and standard GitHub-flavored Markdown support
- `rehype-slug` for stable heading IDs
- a small custom renderer layer for headings, links, images, and metadata presentation

Do **not** write a custom Markdown converter. The site does not need custom parsing rules, and a hand-rolled converter would create maintenance risk around edge cases, heading IDs, image handling, and future Markdown features.

## Why This Fits The Repo

The current repo is a small Vite app with a single React entry point and no routing layer. Adding a client-side router and a content utility module is a modest step that preserves the current deployment model and keeps the site simple. The blog content remains versioned in git, easy to edit, and friendly to static hosting.

## Requirements

### Functional

- Homepage remains available at `/`
- Blog index exists at `/blog`
- Individual articles exist at `/blog/:slug`
- Posts are stored as Markdown files with frontmatter in the repo
- Blog index lists all posts, sorted by date
- Each post shows metadata at the top
- Headings are linkable with stable anchor IDs
- Images can be clicked to open a larger view
- Reader can increase or decrease body font size
- Unknown slugs render a simple not-found state

### Non-Functional

- Keep implementation lightweight and understandable
- Avoid introducing a CMS or server dependency
- Keep blog rendering accessible on desktop and mobile
- Keep article rendering deterministic for static hosting

## Content Model

Store posts under `src/content/blog/*.md`.

Each file should use frontmatter like:

```md
---
title: "Why I Built This"
description: "Notes on building a small personal site and blog."
publishedAt: "2026-04-13"
updatedAt: "2026-04-13"
tags:
  - personal-site
  - frontend
heroImage: "/blog/why-i-built-this/hero.jpg"
draft: false
---

# Why I Built This
...
```

### Required Frontmatter

- `title`
- `description`
- `publishedAt`

### Optional Frontmatter

- `updatedAt`
- `tags`
- `heroImage`
- `draft`

### Derived Fields

The content layer should derive:

- `slug` from filename
- `readingTimeMinutes` from word count
- `headings` from rendered content when needed for anchors or future table-of-contents support

## Routing Design

Introduce a router at the app root with three initial route classes:

- `/` for the current landing page
- `/blog` for the list of posts
- `/blog/:slug` for article pages

This keeps the blog clearly separate from the homepage while remaining inside the same Vite SPA. It also avoids the complexity of separate HTML entry points or a secondary site generator.

### Route Responsibilities

#### Home Route

- Reuse the current homepage content
- Add a visible link to the blog section

#### Blog Index Route

- Read the parsed post manifest
- Sort posts by `publishedAt` descending
- Render cards or rows with:
  - title
  - description
  - published date
  - updated date if present
  - reading time
  - tags if present

#### Blog Article Route

- Resolve slug from route params
- Load the matching parsed post
- Render article header, metadata, and Markdown body
- Render a simple not-found view if no post matches

## Rendering Pipeline

### Source Loading

Use `import.meta.glob` to eagerly read all Markdown files as raw strings at build time.

Example direction:

```ts
const postModules = import.meta.glob('./content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})
```

This keeps the system static and predictable. No runtime fetch layer is needed.

### Parsing

For each file:

1. Parse frontmatter with `gray-matter`
2. Validate required fields
3. Compute slug from filename
4. Compute reading time from plain-text word count
5. Return a typed `BlogPost` object

### Rendering

Render Markdown through `react-markdown` with:

- `remark-gfm`
- `rehype-slug`
- custom React component overrides

The override layer should own the visual output for:

- headings
- links
- images
- blockquotes
- code blocks
- horizontal rules
- lists

This is where the blog gets a controlled house style without forking Markdown parsing itself.

## Article Page UX

### Layout

The article should sit in a centered reading column with a comfortable line length. A good target is a body max width around `42rem` to `48rem`, with wider allowance for media blocks.

Recommended structure:

- page shell
- centered article container
- article header
- reader controls
- article body
- image zoom overlay portal or sibling overlay

### Metadata Header

At the top of the article:

- title
- short description
- published date
- updated date
- estimated reading time
- tags if present

This metadata should read as editorial context, not dashboard chrome. Use muted styling and compact spacing.

### Font Size Controls

Add simple controls such as:

- `A-` decrease
- `A` reset
- `A+` increase

Implementation should update a CSS custom property on the article container, such as `--blog-font-size`. This keeps the UI responsive without complicated state propagation. Local persistence can be added later, but is not required for the first pass.

### Deeplinkable Headings

Headings should:

- receive stable IDs via `rehype-slug`
- include a small anchor affordance
- support direct linking when the hash changes

Recommended behavior:

- anchor icon or `#` appears on hover/focus
- clicking the anchor copies or navigates to the exact section URL
- heading text remains readable without visual clutter

### Images And Zoom

Images should render as figures with:

- rounded corners or a subtle frame
- spacing that visually separates them from paragraph content
- optional caption when meaningful alt text is present
- pointer affordance for zoomable images

Zoom behavior:

- clicking an image opens a full-screen overlay
- overlay darkens the backdrop
- `Escape` closes
- clicking the backdrop closes
- image remains constrained to viewport dimensions
- focus handling should remain accessible

This gives a polished reading experience without requiring a heavy gallery dependency.

## Styling Direction

The blog should feel distinct from the compact homepage while still using the site’s existing theme tokens.

### Page-Level Styling

- center content vertically within a normal page flow, not a tiny landing card
- use generous whitespace
- preserve existing color variables from `src/styles/colors.css`
- add blog-specific CSS module or scoped stylesheet rather than overloading the homepage styles

### Typography

- keep body text optimized for long-form reading
- set clear type scale for `h1` through `h4`
- increase paragraph line-height
- tune list and code spacing for readability

### Link Styling

- keep links visibly interactive
- ensure anchor links and inline links remain distinct
- avoid inheriting all homepage link decoration rules into article content if they feel too ornamental for body text

## Accessibility

The blog implementation should include:

- semantic article structure using `<article>`, `<header>`, and heading hierarchy
- keyboard-accessible heading anchors
- keyboard-accessible image zoom dismissal
- visible focus states for controls and anchors
- sufficient contrast for metadata and controls
- responsive layout on narrow screens

## Error Handling

### Invalid Frontmatter

If a Markdown file is missing required frontmatter, fail loudly during development with a clear error describing:

- file path
- missing field
- expected format

### Missing Post

If a slug is not found:

- render a blog-aware not-found view
- offer navigation back to `/blog`

### Broken Images

Do not add custom image prevalidation in the first pass. Let missing assets fail visibly during development and fix them in content authoring. This keeps the first version focused.

## Suggested File Map

- Create: `src/content/blog/`
- Create: `src/content/blog/<slug>.md`
- Create: `src/features/blog/types.ts`
- Create: `src/features/blog/content.ts`
- Create: `src/features/blog/utils/readingTime.ts`
- Create: `src/features/blog/components/BlogIndex.tsx`
- Create: `src/features/blog/components/BlogArticle.tsx`
- Create: `src/features/blog/components/BlogMeta.tsx`
- Create: `src/features/blog/components/HeadingLink.tsx`
- Create: `src/features/blog/components/ImageZoom.tsx`
- Create: `src/features/blog/blog.module.css`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Modify: `package.json`

## Dependency Changes

Expected additions:

- `react-router-dom`
- `gray-matter`
- `react-markdown`
- `remark-gfm`
- `rehype-slug`

Potential optional addition:

- `rehype-autolink-headings` if the custom heading renderer does not provide enough control

The first implementation should avoid adding more than this unless a real need emerges.

## Testing Strategy

### Content Utility Tests

Add focused tests for:

- frontmatter parsing
- slug derivation
- reading time calculation
- sort order
- required field validation

### Route-Level Behavior

Verify:

- `/blog` renders the index
- `/blog/:slug` renders a post
- unknown slug shows not-found state

### UI Behavior

Verify:

- font size controls update article text size
- heading anchors point to the correct IDs
- image click opens zoom overlay
- escape and backdrop click close the overlay

If the repo does not currently have a test runner configured, this work can begin with content utility tests plus manual verification and then add route/UI tests as part of the implementation effort.

## Phased Delivery

### Phase 1

- add routing
- add content loading and parsing
- add blog index
- add article route
- add metadata rendering

### Phase 2

- add font size controls
- add heading anchor affordances
- add image zoom behavior
- refine article styling

### Phase 3

- optional persistence of reader font size
- optional table of contents
- optional tag filtering on `/blog`

## Explicit Decisions

- Use Markdown with frontmatter, not MDX
- Keep the blog inside the existing Vite SPA
- Support multiple articles from the start
- Do not build a custom Markdown converter
- Derive reading time from content source
- Make headings deeplinkable in the rendered article
- Make images clickable for zoom

## Open Questions Deferred

These are intentionally left out of the first pass:

- RSS feed generation
- syntax highlighting theme decisions
- drafts excluded from production builds
- tag archive pages
- search
- comments

None of these are needed to satisfy the requested blog section.

## Implementation Recommendation

Proceed with a small content subsystem and a blog feature area, not a broad app rewrite. The site is still simple enough that a focused feature slice will keep complexity low:

- router setup in `src/main.tsx`
- homepage extracted into a route component if needed
- blog feature isolated under `src/features/blog`
- content source isolated under `src/content/blog`

This gives a clean path for future blog growth without forcing the rest of the site into premature architecture.
