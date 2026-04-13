# Blog Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the phase-2 article experience to the Vite blog: font size controls, visible deeplinkable headings, clickable image zoom, and more polished article styling.

**Architecture:** Keep the current article route and content model, and extend the article rendering layer rather than introducing new routes or a separate content system. Put reader controls and zoom state in focused blog components, and use `react-markdown` component overrides to control heading and image rendering without changing the Markdown source format.

**Tech Stack:** Vite, React 19, TypeScript, react-markdown, remark-gfm, rehype-slug, Vitest, Testing Library, Playwright CLI

---

## File Map

- Modify: `src/content/blog/hello-blog.md`
- Modify: `src/features/blog/components/MarkdownArticle.tsx`
- Create: `src/features/blog/components/ArticleImage.tsx`
- Create: `src/features/blog/components/FontSizeControls.tsx`
- Create: `src/features/blog/components/HeadingLink.tsx`
- Modify: `src/features/blog/routes/BlogPostRoute.tsx`
- Modify: `src/features/blog/blog.module.css`
- Modify: `src/features/blog/routes/blog-routes.test.tsx`
- Modify: `src/styles/colors.css`

### Task 1: Add A Failing Test For Reader Controls And Zoom

**Files:**
- Modify: `src/features/blog/routes/blog-routes.test.tsx`
- Modify: `src/content/blog/hello-blog.md`

- [ ] **Step 1: Extend the sample post with an image**

Add a markdown image to `src/content/blog/hello-blog.md` so the article route has something real to zoom.

- [ ] **Step 2: Write failing route tests for phase-2 behavior**

Add tests for:

- font size controls render on the article page
- clicking a heading anchor/deeplink affordance is possible
- clicking the sample image opens a zoom dialog
- closing the zoom dialog removes it from the DOM

- [ ] **Step 3: Run the route tests to verify they fail**

Run: `npm test -- --run src/features/blog/routes/blog-routes.test.tsx`
Expected: FAIL because phase-2 UI does not exist yet

### Task 2: Implement Reader Controls With TDD

**Files:**
- Create: `src/features/blog/components/FontSizeControls.tsx`
- Modify: `src/features/blog/routes/BlogPostRoute.tsx`
- Modify: `src/features/blog/blog.module.css`

- [ ] **Step 1: Add minimal font control implementation**

Create controls for:

- decrease
- reset
- increase

Use React state on the article route and feed a CSS custom property such as `--blog-font-size` into the article shell.

- [ ] **Step 2: Re-run the route tests**

Run: `npm test -- --run src/features/blog/routes/blog-routes.test.tsx`
Expected: the font-control assertions pass, while heading/image assertions may still fail

### Task 3: Implement Deeplinkable Heading UI With TDD

**Files:**
- Create: `src/features/blog/components/HeadingLink.tsx`
- Modify: `src/features/blog/components/MarkdownArticle.tsx`
- Modify: `src/features/blog/blog.module.css`

- [ ] **Step 1: Add a heading renderer with visible anchor affordance**

Render markdown headings through a custom component that:

- preserves the `rehype-slug` ID
- adds a small `#` or link icon anchor
- keeps the heading text readable

- [ ] **Step 2: Re-run the route tests**

Run: `npm test -- --run src/features/blog/routes/blog-routes.test.tsx`
Expected: heading/deeplink assertions pass, while image zoom assertions may still fail

### Task 4: Implement Click-To-Zoom Images With TDD

**Files:**
- Create: `src/features/blog/components/ArticleImage.tsx`
- Modify: `src/features/blog/components/MarkdownArticle.tsx`
- Modify: `src/features/blog/blog.module.css`

- [ ] **Step 1: Add a custom image renderer**

Render article images as clickable figures with:

- button-like interaction
- optional caption from alt text
- a lightweight dialog/overlay for zoomed viewing

- [ ] **Step 2: Add close behavior**

Support:

- close button
- escape key
- backdrop click

- [ ] **Step 3: Re-run the route tests**

Run: `npm test -- --run src/features/blog/routes/blog-routes.test.tsx`
Expected: PASS

### Task 5: Refine Article Styling And Verify In Browser

**Files:**
- Modify: `src/features/blog/blog.module.css`
- Modify: `src/styles/colors.css`

- [ ] **Step 1: Polish the article layout**

Improve:

- centered reading width
- metadata spacing
- heading spacing
- figure styling
- control bar styling

- [ ] **Step 2: Verify in automated tests**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 3: Run lint and production build**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass

- [ ] **Step 4: Verify manually in a real browser**

Use Playwright CLI against:

- `http://localhost:5173/blog`
- `http://localhost:5173/blog/hello-blog`

Confirm:

- article controls render
- image zoom opens
- article headings show deeplink affordances

- [ ] **Step 5: Commit the phase-2 work**

```bash
git add src docs package.json package-lock.json
git commit -m "feat: add blog article reader interactions"
```
