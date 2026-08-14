---
title: "Running Parallel Coding Agents with a Manager and Workers"
description: "Orchestrate one manager session and several autonomous workers across Git worktrees, with configurable autonomy and draft-PR review gates."
updatedAt: "2026-08-14"
publishedAt: "2026-08-12"
audience: "Engineers who already use a coding agent and want several tasks moving at once without losing review control."
tags:
  - AI
  - workflow
  - git
---

# Running Parallel Coding Agents with a Manager and Workers

A procedure for running several coding agents at once: one **manager** session that plans and coordinates, and several **worker** sessions that implement in isolation.

```text
        you
         |
         v
  +-------------+        +--------+  +--------+  +--------+
  |   manager   | -----> | worker | | worker | | worker |
  | plan/review |        +--------+  +--------+  +--------+
  +-------------+             |           |           |
         ^                    v           v           v
         +---------------  draft PRs  ---------------- +
```

Examples use [OpenCode](https://opencode.ai) and [cmux](https://cmux.dev), but any agent CLI with session resume and Git worktrees works.

## What you get

- Several visible, inspectable sessions running at once
- One place (the manager) holding the dependency graph and review queue
- Per-task autonomy control
- Resumable work that survives closed terminals
- Merge authority that stays with you

## What this is not

- Not a review shortcut — every change lands through a PR you approve
- Not for one ambiguous task — a single supervised session is better
- Not free — each worker costs disk, CPU, ports, and CI capacity

## The isolation model

Four boundaries per worker:

| Boundary | Mechanism | Prevents |
| --- | --- | --- |
| History | One branch per task | Interleaved commits |
| Files | One worktree per task | Concurrent edits |
| Runtime | One port per task | Port collisions |
| Context | One session per task | Lost task memory |

## How to read this guide

Ch. 1-3: the procedure. Ch. 4: workers vs. subagents. Ch. 5: a remediation case study. Ch. 6-7: failure modes and templates.
