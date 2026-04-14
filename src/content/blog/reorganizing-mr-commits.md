---
title: "How to Reorganize Merge Request Commits"
description: "A practical guide to cleaning up messy MR commit histories using soft reset and selective re-staging."
publishedAt: "2026-04-14"
tags:
  - git
  - workflow
  - code-review
  - developer-tools
---

# How to Reorganize Merge Request Commits

If you have ever opened a merge request and winced at the commit history, you are not alone. Feature branches accumulate noise: fixup commits, formatting changes, lockfile updates, and interleaved concerns that make review harder than it needs to be.

The good news is that reorganizing commits before review is straightforward. The technique is simple: soft-reset to the merge base, unstage everything, then selectively re-commit in a logical order. No interactive rebase gymnastics required.

This guide walks through the full process step by step.

## Why bother

A clean commit history is not about vanity. It directly affects how reviewable your MR is:

- **Reviewers can read commits in dependency order.** Infrastructure first, then the feature that uses it, then the tests that cover it.
- **Independent fixes are isolatable.** A reviewer can approve a small bugfix commit without needing to understand the full feature.
- **Noise is gone.** No one needs to review a lockfile regeneration or an auto-formatter run alongside your actual logic changes.

The goal is not perfection. It is making the reviewer's job easier, which gets your code merged faster.

## The process

### 1. Find the merge base

First, identify where your branch diverged from `main`:

```bash
git merge-base <your-branch> origin/main
```

This gives you the commit SHA that is the common ancestor. Every commit after this point is what your MR contains.

### 2. Review what you have

Look at all the commits in your MR:

```bash
git log --oneline <merge-base>..HEAD
```

This is the list you are about to reorganize.

### 3. Soft-reset and unstage

Now collapse all those commits back into uncommitted changes:

```bash
git reset --soft <merge-base>
git reset HEAD .
```

The first command moves HEAD back to the merge base but keeps all your changes staged. The second unstages everything so you have a clean working tree with all your modifications visible in `git status` and `git diff`.

### 4. Review the full diff

Before re-committing, understand the full scope of what changed:

```bash
git diff --stat
git status
```

Read through each file's diff. Understand what each change does and which logical group it belongs to.

### 5. Group and re-commit in order

This is where the real work happens. Stage and commit files in this order:

1. **Independent fixes** -- Small self-contained bugfixes, config changes, or infra updates that have no dependency on your feature.
2. **Data and logic layer** -- New types, utilities, shared components, and hooks that your feature depends on.
3. **Feature UI** -- The components and views that consume the above.
4. **Tests** -- Unit and E2E tests covering all of the above.
5. **Discard noise** -- Use `git checkout -- <file>` for unrelated diffs (formatting-only changes, lockfile churn) and `rm` for stray generated files.

For each group:

```bash
git add <files-in-this-group>
git commit -m "descriptive message for this group"
```

### 6. Verify and push

Once you have re-committed everything:

```bash
git log --oneline <merge-base>..HEAD   # verify the new history
git status                              # verify clean working tree
git push --force-with-lease origin <your-branch>
```

Use `--force-with-lease` instead of `--force`. It will refuse to push if someone else has pushed to the branch since your last fetch, which prevents accidentally overwriting their work.

## Quick reference checklist

**Prep:**
- Find the merge base: `git merge-base <branch> origin/main`
- Review the MR commits: `git log --oneline <merge-base>..HEAD`
- Soft-reset to merge base: `git reset --soft <merge-base>`
- Unstage everything: `git reset HEAD .`
- Review all changes: `git diff --stat` and `git status`

**Analyze and group:**
- Read through each file's diff to understand what it does
- Identify independent bugfixes and infra changes (no feature dependency)
- Identify new shared components, utilities, and types
- Identify feature UI changes that depend on the above
- Identify test changes (unit and E2E)
- Identify unrelated noise (lockfiles, formatting, generated files)

**Commit order:**
1. Independent fixes
2. Data and logic layer
3. Feature UI
4. Tests
5. Discard noise

**Finalize:**
- Verify history: `git log --oneline <merge-base>..HEAD`
- Verify clean tree: `git status`
- Force push: `git push --force-with-lease origin <branch>`

## Drop-in instructions for AI coding agents

If you use an AI coding agent (Claude Code, OpenCode, Cursor, Codex, or similar), you can paste the following paragraph into your repository's agent instructions file (such as `AGENTS.md`, `CLAUDE.md`, or `.cursorrules`). It teaches the agent how to reorganize commits when asked:

> When asked to reorganize, clean up, or restructure commits on a branch, follow this process. First, find the merge base with `git merge-base HEAD origin/main`. Then review the current commits with `git log --oneline <merge-base>..HEAD`. Soft-reset to the merge base with `git reset --soft <merge-base>`, then unstage everything with `git reset HEAD .`. Review all changes with `git diff --stat` and `git status`. Read through each file's diff and group changes into logical categories: (1) independent bugfixes and config changes, (2) new types, utilities, shared components, and hooks, (3) feature UI that depends on the above, (4) tests, and (5) noise to discard. Re-commit in that order with clear messages. Discard noise with `git checkout -- <file>` or `rm`. Verify the result with `git log --oneline <merge-base>..HEAD` and `git status`. Do not force-push unless explicitly asked to; instead, present the new commit list and ask for confirmation before pushing with `git push --force-with-lease`.

This gives the agent enough context to do the reorganization autonomously while still asking for confirmation before the destructive push step.

## Rewrite in place or work on a new branch

There are two ways to approach this, and which one you pick depends on how much you trust the safety net.

### Option A: Rewrite the original branch

This is the approach described above. You soft-reset directly on your MR branch, re-commit, and force-push. It is simpler and keeps everything in one place.

The risk is that you are rewriting history on the branch your MR already points to. If you make a mistake during the re-commit step, the old commits are gone from the branch. You can recover them with `git reflog`, but that requires knowing what you are looking for and acting before the reflog entries expire.

In practice, this is fine for most people most of the time. If you are comfortable with `git reflog` and you are the only person working on the branch, just do it in place.

### Option B: Create a new branch first

The safer alternative is to create a new branch before touching anything:

```bash
git checkout -b <branch>-reorganized
```

Then do the full soft-reset and re-commit process on the new branch. Once you are happy with the result, you can either update the MR to point at the new branch or force-push the new history back onto the original branch name.

This gives you an easy escape hatch. If something goes wrong, your original branch is still sitting there untouched. No reflog diving required.

### GitHub and GitLab track force-push history

One thing worth knowing: both GitHub and GitLab preserve the previous state of a branch after a force-push. GitHub shows a "force-pushed" event in the MR timeline with a link to the before-and-after comparison. GitLab does the same. So even if you rewrite in place, the old commits are not truly lost at the platform level. Reviewers can still see what changed between force-pushes.

This means option A is less risky than it sounds. The platform is your backup. But it is worth being aware of because if you are reorganizing commits on a branch that already has review comments tied to specific commits, those comment anchors may break or become harder to find after a force-push.

### Which one to use

If you are the sole author and the MR has not been reviewed yet, rewrite in place. It is faster and there is nothing to lose.

If the MR already has review threads you want to preserve context for, or if you are just not confident about the process yet, create a new branch first. You can always delete it after.

## When not to do this

This technique works best on branches where you are the only author. If multiple people have pushed commits to the branch, rewriting history can create conflicts for them. Coordinate with your team before force-pushing a shared branch.

It is also not always necessary. If your MR is three clean commits that already tell a clear story, do not reorganize for the sake of it. The goal is clarity, not process.
