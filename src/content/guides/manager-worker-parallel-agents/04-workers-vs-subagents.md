---
title: "Workers versus subagents"
description: "When a persistent worker session beats a delegated subagent call."
part: "Beyond the Basics"
---

# Workers versus subagents

Subagents suit a single lookup. For multi-step delivery, persistent workers usually win.

| Dimension | Subagent | Worker session |
| --- | --- | --- |
| Visibility | Summarized on return | Live terminal, files, PR |
| Lifetime | Ends with the call | Survives pauses, resumable |
| Intervention | Limited while running | Inspect and redirect anytime |
| Isolation | Shares parent environment | Own worktree, process, port |
| Review loop | One result | Commits, draft PRs, revisions |

```text
subagent:  spawn -> answer -> gone
worker:    spawn -> commit -> PR -> feedback -> revise -> PR ...
```

## Persistence is configured, not automatic

Keep the session record and worktree, and launch so the session stays interactive:

```bash
opencode run "$(cat prompt.md)"; opencode --continue
```

Without that trailer, the session exits when the run completes.

## Why this changes review economics

Hours later, feedback goes to the same session — its branch and conversation are still aligned, so a second review round costs a follow-up, not context reconstruction. With subagents, that means pasting a diff back into a fresh call.

## When a subagent is still right

Factual questions, symbol search, one-off summaries — bounded, read-mostly, single-answer work with nothing gained from a dedicated worktree.
