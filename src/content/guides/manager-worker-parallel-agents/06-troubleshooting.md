---
title: "Troubleshooting and capacity"
description: "Common failure modes, resource limits, and how to run the pattern without cmux."
part: "Reference"
---

# Troubleshooting and capacity

## Failure modes

**A worker never started.** Text can arrive before the shell is ready, corrupting the first command. Verify a launch acknowledgment, not just that the workspace exists.

**A worker stalled on a permission prompt.** Non-interactive sessions auto-reject access outside their scope. Narrow the task to tools inside the worktree, don't widen permissions.

**A finished worker's terminal disappeared.** Session and worktree still exist — recover with `opencode run --continue`. Prevent recurrence with a trailing `opencode --continue` on launch.

**The base branch moved.** Expected in a stack; require dependents to rebase before handoff:

```bash
git fetch origin && git rebase origin/<base-branch>
```

**A merged branch never reached the base you expected.** Verify what each PR in a stack actually targets.

**Everything slowed down at once.** Resource exhaustion, not a model problem.

## Capacity planning

Each worker adds a checkout, dependency tree, build output, and an agent process. Watch for thermal throttling and disk filling with duplicate dependency trees.

Limits vary by repo — a small site handles five workers on a laptop; a monorepo may tolerate one or two. Re-run flaky tests in isolation before assuming a regression.

## Running without cmux

```text
worktree -> agent CLI -> log file -> tail -f -> follow-up
```

| Capability | Substitute |
| --- | --- |
| Workspace per worker | tmux window/tab |
| Watching progress | `tmux capture-pane` or log files |
| Sending follow-ups | `tmux send-keys` or `opencode --continue` |
| Completion alerts | Slack webhook, ntfy, desktop notification |

```bash
git worktree add ../workers/task-n -b feature/task-n origin/main
cd ../workers/task-n && npm ci
opencode run "$(cat ../prompts/task-n.md)" > run.log 2>&1 &
# tail -f run.log
# opencode run --continue "..."
```
