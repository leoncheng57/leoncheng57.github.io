---
title: "Overview"
description: "What the manager/worker procedure is and when it beats a single agent."
part: "Start Here"
---

# Overview

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

## When this works well

This setup earns its overhead on **vague-ish engineering tasks** - work where the destination is clear but the route isn't. If a task is fully specified, a single agent can usually one-shot it; a manager and workers would just add ceremony.

Good fits:

- **Exploratory tasks with several plausible approaches.** Spin up multiple workers to try 3 alternative solutions simultaneously, then have the manager compare the draft PRs and keep the best one.
- **A backlog of loosely related tasks** that can proceed independently while you review at your own pace.
- **Work that needs iteration against feedback**, where workers can keep moving while you're heads-down elsewhere.

Poor fits: single well-specified changes, tightly coupled edits to the same files, or anything cheaper to do yourself than to specify.
