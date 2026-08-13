---
title: "Running Parallel Coding Agents with a Manager and Workers"
description: "A practical guide to orchestrating one manager agent session and several autonomous worker sessions across Git worktrees, with configurable autonomy, draft-PR review gates, and recovery procedures."
updatedAt: "2026-08-12"
publishedAt: "2026-08-12"
audience: "Engineers who already use a coding agent and want several tasks moving at once without losing review control."
tags:
  - AI
  - workflow
  - git
---

# Running Parallel Coding Agents with a Manager and Workers

This guide describes a repeatable way to run several coding agents at the same time: one long-lived **manager** session that plans and coordinates, and several **worker** sessions that implement in isolation.

It is written as a procedure you can follow, not a trip report. The examples use [OpenCode](https://opencode.ai) and [cmux](https://cmux.dev), but the pattern only requires an agent CLI that can resume a session, plus Git worktrees. A section near the end lists substitutes for every cmux-specific convenience.

The worked example throughout is a batch of five issues on this site ([#149](https://github.com/leoncheng57/leoncheng57.github.io/issues/149) through [#153](https://github.com/leoncheng57/leoncheng57.github.io/issues/153)) that were delivered in parallel.

## What you get

- Several tasks progressing at once, each in a visible session you can inspect.
- A single place (the manager) that holds the dependency graph and review queue.
- Per-task control over how much autonomy each worker has.
- Work that survives closed terminals, because sessions are resumable.
- Merge authority that stays with you.

## What this is not

- Not a way to skip review. Every change still lands through a pull request you approve.
- Not a fit for one ambiguous task. If the work cannot be split, a single supervised session is better.
- Not free. Each worker consumes disk, CPU, ports, and CI capacity.

## Prerequisites

- A Git repository you can branch from.
- An agent CLI that supports non-interactive runs and session resume. This guide uses `opencode run` and `opencode run --continue`.
- Enough disk and memory for one dependency install per worker.
- A terminal setup that keeps several sessions visible. cmux workspaces are used here; tmux windows work too.

## Concepts

A **manager** is an interactive agent session that never writes feature code. It decomposes work, writes worker contracts, launches workers, monitors them, reviews handoffs, and coordinates branch order.

A **worker** is an agent session scoped to exactly one task. It owns a branch, a worktree, a port, and a conversation. It implements, tests, commits, and hands back a reviewable artifact.

A **contract** is the prompt file a worker is launched with. It is the control plane: ownership, gates, autonomy level, escalation rules, and the expected handoff all live there.

![One manager session coordinates five visible worker sessions. Each worker has an isolated worktree and cmux workspace, then hands a draft pull request and test evidence back through the manager to a human merge gate.](/guides/manager-worker-agents/orchestration-map.svg "The manager owns planning and coordination; workers own isolated implementation; the human owns merge.")

## The isolation model

Give every worker four boundaries. Skipping any one of them is the usual cause of parallel work going wrong.

| Boundary | Mechanism | Prevents |
| --- | --- | --- |
| History | One branch per task | Interleaved commits |
| Files | One Git worktree per task | Concurrent edits to the same checkout |
| Runtime | One dev-server port per task | Port collisions and confusing previews |
| Context | One agent session per task | Mixed conversations and lost task memory |

## Procedure

### Step 1: Split the work and order the dependencies

Do this with the manager before creating anything.

Group the tasks by the files they touch. Tasks that share code must be sequenced as a stack with explicit pull-request bases; tasks that do not can branch from `main` independently.

In the worked example, three tasks touched the same install experience and became a stack, while two were independent:

```text
main
 |- #149 station PWAs ......... base: main
 |   \- #151 install modal .... base: #149
 |       \- #150 walkthroughs . base: #151
 |- #152 feedback flow ........ base: main
 \- #153 return links ......... base: main
```

Parallelism should follow this graph, not the number of open issues.

### Step 2: Create one worktree per task

```bash
git worktree add ../workers/issue-149 -b sub-wait/12-station-pwas origin/main
cd ../workers/issue-149 && npm ci
```

Repeat per task. Assign each worker a distinct dev port (5174, 5175, and so on) and record it in the contract.

### Step 3: Write the worker contract

Write a prompt file per worker instead of typing instructions into terminals. A contract that omits ownership or escalation rules is the most common source of conflicts.

Each contract should state:

- the goal and the issue link;
- the files this worker owns, and the files it must not touch;
- its branch, worktree path, dev port, and pull-request base;
- the quality gates that must pass before handoff;
- the autonomy level and escalation conditions;
- what to do if a dependency branch or permission blocks progress;
- the exact completion report expected.

A full template is in the [reference section](#reference-worker-contract-template).

### Step 4: Choose an autonomy level per worker

This is the step most teams skip, and it is the one that makes the pattern flexible. Autonomy is not one global "auto-approve" switch. Set it per task.

![Four configurable worker autonomy levels: supervised, checkpointed, draft PR, and outcome-only. Manager involvement decreases as worker autonomy increases, while the human merge gate remains.](/guides/manager-worker-agents/autonomy-spectrum.svg "Worker autonomy can be tuned independently for each task.")

| Mode | Worker behavior | Manager behavior | Use when |
| --- | --- | --- | --- |
| Supervised | Proposes a plan, asks before consequential edits | Answers questions, approves the approach | The task is ambiguous or risky |
| Checkpointed | Implements one slice, commits, pauses | Reviews the diff, unlocks the next slice | Files are shared or the design is unproven |
| Draft PR | Implements and tests, opens a draft PR, requests review | Reviews commits, scope, workload, and CI | Most bounded product work |
| Outcome-only | Runs to completion, then reports | Intervenes only on failure or alert | The task is mechanical and well specified |

Encode the choice as plain instructions. For a draft-PR worker:

```text
Work autonomously through implementation and local verification.
Open a draft PR after the first complete commit.
Ask the manager to review the commit stack and remaining workload.
Do not mark the PR ready until the manager confirms scope and CI.
Never merge.
```

For an outcome-only worker:

```text
Run to completion without intermediate check-ins.
Stop only for a destructive action, a missing credential, or a scope conflict.
When done, report the PR URL, commits, tests, screenshots, and residual risks.
Never merge.
```

A worker can change modes over its life: supervised while the design is uncertain, then draft-PR once the approach is settled.

### Step 5: Set permissions to match the autonomy level

Autonomy is only real if the worker can act unattended. Pair each mode with a permission scope:

- Pre-approve routine commands inside the worker's own worktree.
- Deny destructive Git commands and all merges.
- Require escalation for credentials, external systems, and scope changes.
- Keep broad read and coordination access on the manager, not the workers.

Workers launched non-interactively typically auto-reject anything outside this scope, which is the desired behavior. Fix a blocked worker by narrowing the task to tools available inside its environment, not by widening permissions.

### Step 6: Launch the workers

```bash
cmux new-workspace \
  --name "Issue 149" \
  --cwd ../workers/issue-149 \
  --command 'opencode run "$(cat ../prompts/149.md)"; opencode --continue' \
  --focus false
```

Two details matter:

- Trailing `opencode --continue` keeps the session interactive after the run completes, so a finished worker stays inspectable instead of closing.
- `--focus false` prevents each launch from stealing your window.

After launching, confirm each worker actually started. Do not assume a created workspace means a running agent; see [Troubleshooting](#troubleshooting).

### Step 7: Monitor without taking over

The manager polls worker screens, branch activity, draft PRs, and CI. When a worker stalls, it sends a focused follow-up rather than opening the files and finishing the job.

This restraint is deliberate. A manager that starts implementing becomes another busy worker and stops seeing the system.

Workers keep running while the manager is paused. The manager is interactive and may stop to ask you a permission or design question; the workers are independent processes with pre-scoped permissions and continue editing, testing, and pushing. The manager catches up from terminal output, Git history, and PR state.

### Step 8: Review the draft PRs

A draft PR is the review checkpoint, not just the final artifact. Check:

- commits are logically separated;
- the diff still matches the assigned scope;
- the workload taken on is neither too large nor too small;
- tests and screenshots cover the acceptance criteria;
- dependent branches can still rebase cleanly;
- what remains before human review.

### Step 9: Route feedback into the owning session

Send review feedback back to the session that wrote the code, so its implementation context is reused:

```bash
cd ../workers/issue-149
opencode run --continue \
  "Review feedback: split the media-generation changes from the modal commit, rerun the accessibility tests, and update the draft PR evidence."
```

This is the main economic advantage of the pattern. A second review round costs a follow-up message, not a fresh onboarding prompt.

### Step 10: Merge and clean up

You merge; the manager does not. After a change is merged and verified:

```bash
git worktree remove ../workers/issue-149
git branch -d sub-wait/12-station-pwas
git worktree prune
```

Remove worktrees only after verification. Deleting them at first green CI throws away the environment you need if something is wrong.

## Autonomy in practice

A few rules that hold up across batches:

- **Match autonomy to reversibility, not to difficulty.** A large but reversible refactor can run outcome-only. A small migration that touches production data should be supervised.
- **Raise autonomy over time, lower it on surprise.** Promote a worker to draft-PR mode once its first slice looks right; drop it back to checkpointed the moment it makes an unexpected structural change.
- **Autonomy never includes merge.** The human gate is fixed regardless of mode.
- **Make the escalation list explicit.** "Ask if unsure" is not actionable. "Stop for credential prompts, destructive commands, or scope changes" is.

## Workers versus subagents

Subagents are useful for bounded research or a single lookup. For multi-step feature delivery, persistent worker sessions are usually better.

| Dimension | Subagent | Persistent worker session |
| --- | --- | --- |
| Visibility | Usually summarized on return | Live terminal, files, Git history, PR |
| Lifetime | Ends with the delegated call | Survives pauses; can be resumed |
| Intervention | Limited while running | Inspect and redirect at any time |
| Isolation | Often shares the parent environment | Dedicated worktree, process, and port |
| Review loop | Typically one result | Commits, draft PRs, CI, revisions |
| Best use | Narrow investigation | Feature work with its own lifecycle |

Persistence is a configuration, not a gift. To get it: keep the session record, keep the worktree, and launch so the session remains resumable.

## Troubleshooting

**A worker never started.** A launch command can lose its first characters if text arrives before the shell is ready, turning `npm ci` into `pm ci`. Verify a launch acknowledgment on the first monitoring pass rather than trusting that the workspace exists.

**A worker stalled on a permission prompt.** Non-interactive sessions auto-reject access outside their scope. Rewrite the task to use tooling available inside the worktree.

**A finished worker's terminal disappeared.** The session and worktree still exist. Recover with `opencode run --continue` from that worktree. Prevent recurrence by appending `opencode --continue` to the launch command.

**The base branch moved during implementation.** Expected in a stack. Contracts should require dependent workers to fetch and rebase before handoff:

```bash
git fetch origin && git rebase origin/<base-branch>
```

**Everything slowed down at once.** This is resource exhaustion, not a model problem. See the next section.

## Capacity planning

Each worker adds a checkout, a dependency tree, build output, caches, a dev server, and an agent process. Watch for thermal throttling, test suites slowing across all sessions simultaneously, and disk filling with duplicate dependency trees.

Practical limits vary enormously by repository. A small Vite site handles five workers on a laptop. A large monorepo with heavy installs and language-server indexing may tolerate one or two. Treat CPU, memory, disk, ports, and CI concurrency as scheduling constraints, and stagger test-heavy phases.

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
git worktree add ../workers/issue-N -b feature/issue-N origin/main
cd ../workers/issue-N && npm ci
opencode run "$(cat ../prompts/issue-N.md)" > run.log 2>&1 &
# monitor:   tail -f run.log
# follow up: opencode run --continue "address the review comment ..."
```

## Reference: worker contract template

```text
Goal
- Deliver <issue> on branch <branch> from base <base>.

Ownership
- You own: <files/components>.
- Do not modify: <boundaries>.

Autonomy
- Mode: <supervised | checkpointed | draft PR | outcome-only>.
- Escalate only for: <conditions>.
- Never merge or run destructive Git commands.

Execution
- Worktree: <path>.
- Dev port: <port>.
- Commit and push after: <checkpoint>.
- Rebase rule: <rule for moving bases>.

Evidence
- Run: <lint/tests/build>.
- Capture: <screenshots/manual checks>.
- Report: PR, commits, checks, residual risks, remaining work.

Handoff
- Open a draft PR against <base>.
- Ask the manager to review <commits/scope/workload>.
- Apply manager feedback in this same session.
```

## Launch checklist

- [ ] Tasks split, dependencies ordered, stack bases chosen
- [ ] One branch, worktree, port, and session per task
- [ ] Contract written per worker, including ownership and escalation
- [ ] Autonomy level chosen per task and matched by permissions
- [ ] Launch command leaves the session resumable
- [ ] Launch acknowledgment verified for every worker
- [ ] Draft PRs opened and reviewed before ready-for-review
- [ ] Feedback routed into the owning session
- [ ] Merge performed by a human
- [ ] Worktrees removed only after verification

## Related reading

- [Worktrees, Remote Coding Agents, and Choosing the Right Kind of Isolation](/blog/worktrees-vs-remote-coding-agents)
- [My cmux Setup for Parallel AI Coding](/blog/my-cmux-setup-for-parallel-ai-coding)
