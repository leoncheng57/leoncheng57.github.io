---
title: "Workers versus subagents"
description: "When a persistent worker session beats a delegated subagent call."
---

# Workers versus subagents

Subagents are useful for bounded research or a single lookup. For multi-step feature delivery, persistent worker sessions are usually better.

| Dimension | Subagent | Persistent worker session |
| --- | --- | --- |
| Visibility | Usually summarized on return | Live terminal, files, Git history, PR |
| Lifetime | Ends with the delegated call | Survives pauses; can be resumed |
| Intervention | Limited while running | Inspect and redirect at any time |
| Isolation | Often shares the parent environment | Dedicated worktree, process, and port |
| Review loop | Typically one result | Commits, draft PRs, CI, revisions |
| Best use | Narrow investigation | Feature work with its own lifecycle |

## Persistence is a configuration, not a gift

To get resumable workers:

- keep the session record;
- keep the worktree until the work is verified;
- launch so the session remains interactive after the run finishes.

That last point is easy to miss. `opencode run "$(cat prompt.md)"` exits when the run completes; appending `opencode --continue` keeps the session available.

## Why this changes review economics

Hours after a worker first reports completion, you can send new feedback to the same session. Its branch, files, and conversation are still aligned, so the cost of another review round is a follow-up message rather than a fresh onboarding prompt.

With subagents, the same feedback means reconstructing context from scratch, usually by pasting a diff back into a new call.

## When to still use a subagent

- Answering a factual question about the codebase.
- Searching for every call site of a symbol.
- Producing a one-off summary the manager will act on immediately.

These are bounded, read-mostly, and produce a single answer. Nothing is gained from a dedicated worktree.
