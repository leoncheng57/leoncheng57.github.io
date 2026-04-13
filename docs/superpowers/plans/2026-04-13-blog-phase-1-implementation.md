# Blog Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the phase-1 blog foundation to the existing Vite app: routing, Markdown content loading, a blog index, an article page, and metadata rendering.

**Architecture:** Keep the current Vite SPA and introduce `react-router-dom` for routing. Build a small content subsystem that reads Markdown files with frontmatter via `import.meta.glob`, parses them into typed blog post objects, and powers both the index and article routes. Add minimal test infrastructure first so the content utilities and route behavior can be developed with TDD.

**Tech Stack:** Vite, React 19, TypeScript, React Router, gray-matter, react-markdown, remark-gfm, rehype-slug, Vitest, Testing Library

---

## File Map

- Create: `src/content/blog/`
- Create: `src/content/blog/hello-blog.md`
- Create: `src/features/blog/types.ts`
- Create: `src/features/blog/content.ts`
- Create: `src/features/blog/utils/readingTime.ts`
- Create: `src/features/blog/routes/BlogIndexRoute.tsx`
- Create: `src/features/blog/routes/BlogPostRoute.tsx`
- Create: `src/features/blog/components/BlogMeta.tsx`
- Create: `src/features/blog/components/MarkdownArticle.tsx`
- Create: `src/features/blog/blog.module.css`
- Create: `src/routes/HomeRoute.tsx`
- Create: `src/test/setup.ts`
- Create: `src/features/blog/content.test.ts`
- Create: `src/features/blog/routes/blog-routes.test.tsx`
- Create: `vitest.config.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `.eslintrc.json`
- Modify: `.gitignore`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Modify: `src/App.module.css`
- Modify: `src/styles/globals.css`

### Task 1: Add Test And Routing Dependencies

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `.eslintrc.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Add a failing test command baseline**

Update `package.json` scripts and devDependencies for:

- `test`
- `test:run`
- `vitest`
- `jsdom`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `react-router-dom`
- `gray-matter`
- `react-markdown`
- `remark-gfm`
- `rehype-slug`

- [ ] **Step 2: Add Vitest config and setup file**

Create `vitest.config.ts` and `src/test/setup.ts` so jsdom-based route/component tests can run.

- [ ] **Step 3: Update TypeScript and ESLint for the new toolchain**

Adjust:

- `tsconfig.json` to include Vitest globals and setup as needed
- `.eslintrc.json` to correctly parse TS/TSX modules in this repo

- [ ] **Step 4: Run the empty test command**

Run: `npm test -- --run`
Expected: command executes successfully even if no tests exist yet

### Task 2: Build The Content Utility With TDD

**Files:**
- Create: `src/features/blog/types.ts`
- Create: `src/features/blog/utils/readingTime.ts`
- Create: `src/features/blog/content.ts`
- Create: `src/content/blog/hello-blog.md`
- Create: `src/features/blog/content.test.ts`

- [ ] **Step 1: Write a failing content utility test**

Test behaviors:

- Markdown file is parsed into a post object
- `estimateTimeToRead` overrides derived reading time
- posts are sorted newest-first
- slug is derived from filename

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/features/blog/content.test.ts`
Expected: FAIL because content utilities do not exist yet

- [ ] **Step 3: Implement minimal content utilities**

Create a typed content layer that:

- reads Markdown files via `import.meta.glob`
- parses frontmatter with `gray-matter`
- derives `slug`
- computes fallback reading time when no override is present
- exposes helpers for all posts and for post lookup by slug

- [ ] **Step 4: Run the content test to verify it passes**

Run: `npm test -- --run src/features/blog/content.test.ts`
Expected: PASS

### Task 3: Add Blog Routes With TDD

**Files:**
- Create: `src/routes/HomeRoute.tsx`
- Create: `src/features/blog/routes/BlogIndexRoute.tsx`
- Create: `src/features/blog/routes/BlogPostRoute.tsx`
- Create: `src/features/blog/components/BlogMeta.tsx`
- Create: `src/features/blog/components/MarkdownArticle.tsx`
- Create: `src/features/blog/routes/blog-routes.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Write failing route tests**

Test behaviors:

- `/blog` renders a blog index with the sample post
- `/blog/hello-blog` renders article title and metadata
- unknown blog slug renders a not-found state

- [ ] **Step 2: Run the route tests to verify they fail**

Run: `npm test -- --run src/features/blog/routes/blog-routes.test.tsx`
Expected: FAIL because routes and blog components do not exist yet

- [ ] **Step 3: Implement minimal route structure**

Add:

- homepage route extracted from the current homepage content
- blog index route
- blog post route
- router wiring in `src/main.tsx`

- [ ] **Step 4: Implement minimal article metadata and Markdown rendering**

Render:

- title
- description
- published date
- updated date
- estimated reading time
- Markdown body via `react-markdown`, `remark-gfm`, and `rehype-slug`

- [ ] **Step 5: Run the route tests to verify they pass**

Run: `npm test -- --run src/features/blog/routes/blog-routes.test.tsx`
Expected: PASS

### Task 4: Add Phase-1 Styling And Navigation

**Files:**
- Modify: `src/App.module.css`
- Modify: `src/styles/globals.css`
- Modify: `src/routes/HomeRoute.tsx`
- Modify: `src/features/blog/blog.module.css`

- [ ] **Step 1: Write a small failing assertion if needed for blog navigation text**

If the route tests do not already cover it, add a minimal assertion that the homepage links to `/blog`.

- [ ] **Step 2: Implement phase-1 styling**

Style:

- blog index layout
- centered article container
- metadata presentation
- readable typography for article body
- homepage link into the blog

- [ ] **Step 3: Run the relevant tests**

Run: `npm test -- --run src/features/blog/routes/blog-routes.test.tsx`
Expected: PASS

### Task 5: Full Verification

**Files:**
- Reference: `package.json`
- Reference: `src/features/blog/`
- Reference: `src/routes/`

- [ ] **Step 1: Run the full test suite**

Run: `npm test -- --run`
Expected: all tests pass

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no lint errors

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: successful Vite production build

- [ ] **Step 4: Commit phase-1 implementation**

```bash
git add package.json package-lock.json .eslintrc.json tsconfig.json vitest.config.ts .gitignore src docs/superpowers/plans/2026-04-13-blog-phase-1-implementation.md
git commit -m "feat: add blog phase 1 routes and content pipeline"
```
