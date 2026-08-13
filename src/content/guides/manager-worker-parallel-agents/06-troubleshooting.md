---
title: "Troubleshooting and capacity"
description: "Common failure modes, resource limits, and how to run the pattern without cmux."
---

# Troubleshooting and capacity

## Failure modes

**A worker never started.** A launch command can lose its first characters if text arrives before the shell is ready, turning `npm ci` into `pm ci`. Verify a launch acknowledgment on the first monitoring pass rather than trusting that the workspace exists.

**A worker stalled on a permission prompt.** Non-interactive sessions auto-reject access outside their scope. Rewrite the task to use tooling available inside the worktree instead of widening permissions.

**A finished worker's terminal disappeared.** The session and worktree still exist. Recover with `opencode run --continue` from that worktree. Prevent recurrence by appending `opencode --continue` to the launch command.

**The base branch moved during implementation.** Expected in a stack. Contracts should require dependent workers to fetch and rebase before handoff:

```bash
git fetch origin && git rebase origin/<base-branch>
```

**A merged branch never reached the base you expected.** In a stack, verify what each PR actually targets. A branch merged into an intermediate branch that has already merged to `main` will look complete while its changes are absent from `main`.

**Everything slowed down at once.** This is resource exhaustion, not a model problem. See below.

## Capacity planning

Each worker adds a checkout, a dependency tree, build output, caches, a dev server, and an agent process. Watch for thermal throttling, test suites slowing across all sessions simultaneously, and disk filling with duplicate dependency trees.

Practical limits vary enormously by repository. A small site handles five workers on a laptop. A large monorepo with heavy installs and language-server indexing may tolerate one or two. Treat CPU, memory, disk, ports, and CI concurrency as scheduling constraints, and stagger test-heavy phases.

Test flakiness under load deserves its own note. Suites that pass individually can time out when several workers run them at once. Before assuming a regression, re-run the failing test in isolation and with reduced worker concurrency.

## Running this without cmux

The load-bearing parts are Git worktrees, resumable sessions, explicit contracts, and an inspectable manager. Every cmux convenience has a substitute:

| Capability | Substitute |
| --- | --- |
| One workspace per worker | tmux window or a separate terminal tab |
| Watching progress | `tmux capture-pane`, or redirect output to per-worker log files |
| Sending follow-ups | `tmux send-keys`, or `opencode run --continue` in the worktree |
| Completion alerts | Slack webhook, ntfy, or a desktop notification at the end of the contract |
| Browser beside the worker | A separate browser profile or a Playwright process |

A minimal setup with no multiplexer at all:

```bash
git worktree add ../workers/task-n -b feature/task-n origin/main
cd ../workers/task-n && npm ci
opencode run "$(cat ../prompts/task-n.md)" > run.log 2>&1 &
# monitor:   tail -f run.log
# follow up: opencode run --continue "address the review comment ..."
```
