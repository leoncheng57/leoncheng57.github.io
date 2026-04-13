# Blog Tags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible blog post tags to the index cards and article metadata using a shared muted pill UI.

**Architecture:** Keep the existing frontmatter and content loader unchanged, since tags are already parsed. Add a single presentational component for tag rendering, reuse it in both the index and article metadata surfaces, and extend blog CSS with focused tag-list styles.

**Tech Stack:** Vite, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright CLI

---

## File Map

- Create: `src/features/blog/components/TagList.tsx`
- Modify: `src/features/blog/components/BlogMeta.tsx`
- Modify: `src/features/blog/routes/BlogIndexRoute.tsx`
- Modify: `src/features/blog/routes/blog-routes.test.tsx`
- Modify: `src/features/blog/blog.module.css`

### Task 1: Add Failing Tests For Visible Tags

**Files:**
- Modify: `src/features/blog/routes/blog-routes.test.tsx`

- [ ] **Step 1: Add index assertions**

Verify the published post shows its frontmatter tags on `/blog`.

- [ ] **Step 2: Add article assertions**

Verify the article page shows the same tags in its metadata area.

- [ ] **Step 3: Run the targeted route test**

Run: `npm test -- --run src/features/blog/routes/blog-routes.test.tsx`
Expected: FAIL because the current UI does not render tags

### Task 2: Implement Shared Tag Rendering

**Files:**
- Create: `src/features/blog/components/TagList.tsx`
- Modify: `src/features/blog/components/BlogMeta.tsx`
- Modify: `src/features/blog/routes/BlogIndexRoute.tsx`
- Modify: `src/features/blog/blog.module.css`

- [ ] **Step 1: Create a shared tag-list component**

Render a wrapping list of muted pills and return `null` for empty input.

- [ ] **Step 2: Use the component in the index route**

Place the tag row below the existing index meta line.

- [ ] **Step 3: Use the component in the article metadata**

Place the tag row after the current metadata lines.

- [ ] **Step 4: Style the pills**

Add compact, wrapped, subdued styles that fit the current site.

- [ ] **Step 5: Re-run the targeted route test**

Run: `npm test -- --run src/features/blog/routes/blog-routes.test.tsx`
Expected: PASS

### Task 3: Verify, Capture, And Ship

**Files:**
- Modify: `docs/pr-assets/blog-tags-ui.png`

- [ ] **Step 1: Run the full verification suite**

Run:

```bash
npm test -- --run
npm run lint
npm run build
```

Expected: all pass

- [ ] **Step 2: Capture one fresh screenshot**

Use the local app and Playwright CLI to capture the blog UI with visible tags, then copy the minimal screenshot asset into `docs/pr-assets/`.

- [ ] **Step 3: Commit and merge**

```bash
git add src docs
git commit -m "feat: show blog post tags"
git push -u origin cx/blog-tags-ui
gh pr create --fill
gh pr merge --merge --delete-branch
```
