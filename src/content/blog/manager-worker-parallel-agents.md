---
title: "One Manager, Five Workers: A Practical Pattern for Parallel Coding Agents"
description: "How I used one OpenCode manager session, five persistent worker sessions, Git worktrees, and cmux to deliver five GitHub issues in parallel with configurable autonomy and visible review gates."
publishedAt: "2026-08-12"
tags:
  - AI
  - git
  - workflow
---

# One Manager, Five Workers: A Practical Pattern for Parallel Coding Agents

I recently worked through five GitHub issues at the same time with six OpenCode sessions: one long-lived **manager** and five autonomous **workers**, each operating in its own Git worktree and cmux workspace.

The workers handled station-specific PWAs, an install-help modal, installation walkthroughs, a feedback flow, and return links across hosted projects. The manager did not implement those features. It decomposed the work, wrote each worker's contract, launched the sessions, watched their progress, reviewed handoffs, and coordinated a moving stack of branches.

I called the implementation sessions "runners" while doing the work. "Worker" is the more useful name because the relationship is not limited to fire-and-forget execution. A worker can stop at checkpoints, open a draft pull request, request a review, revise its commits, or run all the way to completion. The manager-worker contract decides how much autonomy it gets.

This post builds on [my cmux setup for parallel AI coding](/blog/my-cmux-setup-for-parallel-ai-coding) and [choosing between worktrees and remote coding agents](/blog/worktrees-vs-remote-coding-agents). Those posts cover the workspace and isolation layers. This one covers orchestration.

## The experiment

The work came from [issues #149-#153](https://github.com/leoncheng57/leoncheng57.github.io/issues/158):

| Worker | Assignment | Main handoff |
| --- | --- | --- |
| [149](https://github.com/leoncheng57/leoncheng57.github.io/issues/149) | Generate a distinct installable PWA for every Sub-Wait station | [PR #156](https://github.com/leoncheng57/leoncheng57.github.io/pull/156) |
| [150](https://github.com/leoncheng57/leoncheng57.github.io/issues/150) | Add visual installation walkthroughs | [PR #161](https://github.com/leoncheng57/leoncheng57.github.io/pull/161), followed by [#168](https://github.com/leoncheng57/leoncheng57.github.io/pull/168) and [#172](https://github.com/leoncheng57/leoncheng57.github.io/pull/172) |
| [151](https://github.com/leoncheng57/leoncheng57.github.io/issues/151) | Open accessible install help from the collapsed call to action | [PR #159](https://github.com/leoncheng57/leoncheng57.github.io/pull/159), consolidated in [#161](https://github.com/leoncheng57/leoncheng57.github.io/pull/161) |
| [152](https://github.com/leoncheng57/leoncheng57.github.io/issues/152) | Add a feedback entry point and wire the form | [PR #157](https://github.com/leoncheng57/leoncheng57.github.io/pull/157), followed by [#171](https://github.com/leoncheng57/leoncheng57.github.io/pull/171) |
| [153](https://github.com/leoncheng57/leoncheng57.github.io/issues/153) | Add a clear return link to hosted projects | [PR #155](https://github.com/leoncheng57/leoncheng57.github.io/pull/155) |

This was not five independent prompts thrown at one checkout. Three install tasks shared code and had to form a stack. Two could branch from `main`. Every worker needed its own dependencies, port, Git branch, terminal, and OpenCode session.

![One manager session coordinates five visible worker sessions. Each worker has an isolated worktree and cmux workspace, then hands a draft pull request and test evidence back through the manager to a human merge gate.](/blog/manager-worker-agents/orchestration-map.svg "The manager owns planning and coordination; workers own isolated implementation; the human owns merge.")

## The architecture: isolate execution, centralize coordination

Each worker had four boundaries:

1. **A Git branch** isolated its commit history.
2. **A worktree** isolated its files and working directory.
3. **A unique dev-server port** isolated runtime state.
4. **A cmux workspace and OpenCode session** isolated its conversation and made it observable.

The manager stayed in a sixth workspace. It held the global picture: the issue graph, branch dependencies, file ownership, worker status, and review queue.

A simplified launch looked like this:

```bash
git worktree add ../workers/issue-149 \
  -b sub-wait/12-station-pwas origin/main

cmux new-workspace \
  --name "Issue 149" \
  --cwd ../workers/issue-149 \
  --command 'npm ci && opencode run "$(cat ../prompts/149.md)"' \
  --focus false
```

I generated one prompt file per worker instead of improvising instructions in terminals. The prompt was a launch contract that included:

- the issue and desired outcome;
- files the worker owned and files it should avoid;
- its branch, worktree, port, and pull-request base;
- lint, test, build, screenshot, and accessibility gates;
- when to commit and push;
- when to ask the manager for review;
- what to do if a dependency or permission blocked progress;
- the exact completion report the manager expected.

That contract is the control plane. cmux makes sessions visible and addressable, but it does not magically decide authority. Autonomy comes from the prompt, tool permissions, branch policy, and review gates.

## The manager is a planner, not a senior worker

The manager's highest-value work happened before launch.

### Build the dependency graph

Issues 149, 151, and 150 touched the same installation experience. Launching all three from `main` would have created overlapping edits and a painful final merge. The manager instead defined a stack and told each worker which branch to use as its base.

Issues 152 and 153 were independent, so they ran directly from `main`. This distinction matters: parallelism should follow the dependency graph, not the number of tasks on the board.

### Assign ownership

"Improve the install flow" is not an ownership boundary. A useful contract says which component and tests a worker owns, where shared edits are permitted, and which neighboring files belong to another worker.

Explicit ownership made conflicts structurally less likely. The stack still moved while workers were active, but each worker knew when to fetch, rebase, and update its draft PR.

### Define evidence before coding

The manager required evidence that matched each task: generated-manifest counts for the PWA worker, focus and Escape tests for the modal worker, media size and caption checks for the walkthrough worker, and route screenshots for UI changes.

Without predeclared gates, "done" means whatever the worker happened to verify. With gates, the manager can compare handoffs consistently.

### Monitor without taking over

The manager watched terminal state, branch activity, draft PRs, and CI. When a worker stalled, it sent a focused follow-up into the same session rather than opening the files and finishing the task itself.

This separation kept the manager's context available for coordination. If the manager starts implementing one feature, it becomes another busy worker and stops seeing the whole system.

## Autonomy is a dial, not a switch

The most important improvement over a generic "spawn five agents" workflow is that every manager-worker relationship can use a different autonomy level.

![Four configurable worker autonomy levels: supervised, checkpointed, draft PR, and outcome-only. Manager involvement decreases as worker autonomy increases, while the human merge gate remains.](/blog/manager-worker-agents/autonomy-spectrum.svg "Worker autonomy can be tuned independently for each task.")

I use four practical modes:

| Mode | Worker behavior | Manager behavior | Good fit |
| --- | --- | --- | --- |
| Supervised | Proposes a plan and asks before consequential edits | Reviews the plan and answers frequent questions | Ambiguous or risky work |
| Checkpointed | Implements a slice, commits, then pauses | Reviews the diff and unlocks the next slice | Shared files or uncertain architecture |
| Draft PR | Implements, tests, opens a draft PR, and requests review | Reviews commits, scope, workload, and CI; sends revisions back | Most bounded product work |
| Outcome-only | Runs to completion and reports the PR plus evidence | Intervenes only on alerts or failure | Mechanical, isolated, well-specified tasks |

These modes can be encoded directly in the launch contract. For example:

```text
Work autonomously through implementation and local verification.
Open a draft PR after the first complete commit.
Ask the manager to review the commit stack and remaining workload.
Do not mark the PR ready until the manager confirms scope and CI.
Never merge.
```

Another worker might receive:

```text
Run to completion without intermediate check-ins.
Stop only for a destructive action, missing credential, or scope conflict.
When done, report the PR URL, commits, tests, screenshots, and residual risks.
Never merge.
```

This is finer-grained than a single global "auto-approve" flag. A documentation worker can be outcome-only while a migration worker pauses after every schema decision. A worker can also change modes: supervised during discovery, checkpointed for the first implementation slice, then autonomous once the design is proven.

## Workers can run while the manager is blocked

The sessions are independent processes. This creates a useful asymmetry: a worker with a narrow contract and pre-scoped permissions can continue unattended, while the interactive manager may pause to ask me for permission, resolve an ambiguity, or approve a command.

The manager is not a scheduler that must stay continuously active for workers to make progress. Once launched, each worker can keep editing, testing, committing, and opening its draft PR. The manager catches up from terminal output, Git history, and PR state when it resumes.

This independence is why permission design belongs in the contract:

- Pre-approve routine commands inside the worker's worktree.
- Deny destructive commands and merges.
- Require escalation for credentials, external systems, or scope changes.
- Give the manager broader read and coordination access without giving workers unnecessary authority.

One worker in this experiment did stall because a non-interactive session auto-rejected access outside its worktree. That was a useful failure: the worker boundary worked, but the contract had not provided an unattended alternative. The fix was not "approve everything." It was to constrain the task to tools and files available inside the worker environment.

## Draft PRs are communication, not just delivery

A worker does not need to wait until the end to become visible. A draft PR is a durable checkpoint where the manager can inspect:

- whether commits are logically separated;
- whether the diff still matches the assigned scope;
- whether the worker has taken on too much or too little work;
- whether tests and screenshots cover the acceptance criteria;
- whether a dependent branch can safely rebase;
- what remains before human review.

The manager can return feedback to the owning OpenCode session:

```bash
opencode run --continue \
  "Review feedback: split the media-generation changes from the modal commit, rerun the accessibility tests, and update the draft PR evidence."
```

The worker receives that feedback with its original implementation context. The manager does not have to reconstruct the reasoning, and the worker does not have to start over.

## Persistent workers versus subagents

Subagents are useful for bounded research, code search, or a calculation that returns one answer. I would still use them for those jobs. Persistent worker sessions are better for multi-step feature delivery.

| Dimension | Subagent | Persistent worker session |
| --- | --- | --- |
| Visibility | Usually summarized when it returns | Live terminal, files, Git history, and PR |
| Lifetime | Ends with the delegated call | Can survive pauses and continue later |
| Intervention | Limited while running | Manager or human can inspect and redirect |
| Isolation | Often shares the parent's environment | Dedicated worktree, process, port, and workspace |
| Review loop | Usually returns one result | Supports commits, draft PRs, CI, and revisions |
| Best use | Narrow investigation or helper task | Feature work with an independent lifecycle |

The distinction is not that subagents are always black boxes or workers are automatically persistent. Persistence has to be configured. Keep the session record, keep the worktree, and launch in a way that leaves a resumable session. In this workflow, `opencode run --continue` let a closed or completed workspace re-enter the same conversation later.

That changed review economics. Hours after a worker first reported completion, I could send new feedback to the same session. Its branch, files, and conversation were still aligned. The cost of another review round was a follow-up, not a fresh onboarding prompt.

## What failed in practice

The pattern worked, but the failures were as instructive as the successful PRs.

### A launch command lost its first character

One terminal was not ready when text was sent, so `npm ci` arrived as `pm ci`. The worker never started. A manager that only waits for completion notifications would have waited forever; the first monitoring sweep caught the shell error immediately.

The operational lesson is to wait for terminal readiness and verify a launch acknowledgment, not merely that a workspace exists.

### Completed workspaces closed too early

Two workers exited after `opencode run` completed, removing the live terminal I wanted to inspect. Their OpenCode sessions and worktrees still existed, so `--continue` recovered them without re-explaining the task.

For inspectable long-lived workers, I now prefer a launch shape that completes the run and then remains interactive:

```bash
opencode run "$(cat prompt.md)"; opencode --continue
```

### The stacked base changed during implementation

Human feedback changed an earlier branch while a dependent worker was active. Because the worker contract already required fetching and rebasing before its handoff, the moving base was routine. Without that rule, the dependent PR would have looked green against an obsolete base.

### Local resources became part of scheduling

Five worktrees meant five dependency trees, build outputs, dev servers, and agent processes. This small Vite repository handled it. A large monorepo may not.

The manager should treat CPU, memory, disk, ports, and CI capacity as workload constraints. "Five available tasks" does not imply "five safe concurrent workers."

## cmux helps, but it is not the architecture

The load-bearing pieces are Git worktrees, persistent OpenCode sessions, explicit contracts, and a manager that can inspect worker state. cmux made the system pleasant:

- one named workspace per worker;
- visible terminals and scrollback;
- non-focus-stealing launches;
- commands for reading screens and sending follow-ups;
- completion and needs-input notifications;
- browser context beside each task.

Every capability has substitutes:

| cmux capability | Substitute |
| --- | --- |
| Workspace per task | tmux window, terminal tab, or separate process |
| Visible progress | `tmux capture-pane` or per-worker log files |
| Follow-up routing | `tmux send-keys` or `opencode run --continue` |
| Notifications | Slack webhook, ntfy, Pushover, or desktop notification |
| Browser beside worker | Separate browser profile or Playwright process |

The orchestration model survives if cmux is removed. What you lose is the compact control room where every worker remains visible and addressable.

## A reusable manager-worker contract

This is the compact template I would use for the next batch:

```text
Goal
- Deliver <issue> on branch <branch> from base <base>.

Ownership
- You own: <files/components>.
- Do not modify: <boundaries>.

Autonomy
- Mode: <supervised | checkpointed | draft PR | outcome-only>.
- Escalate only for: <conditions>.
- Never merge or use destructive Git commands.

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

## What I would keep

The key lesson is not "run more agents." It is to make delegation explicit enough that parallel work stays understandable.

- Plan dependencies before launching workers.
- Give each worker isolated files, runtime state, and conversation state.
- Choose an autonomy level per task rather than globally.
- Use draft PRs as reviewable checkpoints, not just final output.
- Keep workers persistent so feedback returns to the session that owns the context.
- Let workers run independently when the manager pauses.
- Keep merge as a human gate.
- Schedule against machine and CI capacity, not just task count.

The skill I want to improve is the planning conversation with the manager: defining ownership, evidence, autonomy, escalation, and handoff before implementation starts. When that contract is good, five workers feel less like five opaque agents and more like a small, observable engineering system.
