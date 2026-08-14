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
