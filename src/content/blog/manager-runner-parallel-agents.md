---
title: "One Manager, Five Runners: Orchestrating Parallel Coding Agents with OpenCode and Git Worktrees"
description: "How one long-lived OpenCode session planned, launched, monitored, and recovered five autonomous agent sessions working five GitHub issues in parallel — and why the planning is the real skill."
publishedAt: "2026-08-11"
tags:
  - AI
  - git
  - workflow
draft: true
---

# One Manager, Five Runners: Orchestrating Parallel Coding Agents with OpenCode and Git Worktrees

Last night five GitHub issues on this site — station-specific PWA installs, an install-help modal, animated walkthrough videos, a site-wide feedback button, and footer links across every hosted project — were implemented at the same time, by five autonomous OpenCode sessions, coordinated by a sixth session that never wrote a line of feature code itself.

That sixth session was the **manager**. The other five were **runners**. This post documents the pattern, what the manager actually does, where it went wrong, and why I now think the human-plus-manager planning conversation is the skill worth deliberately practicing.

It builds on two earlier posts: [choosing between worktrees and remote agents](/blog/worktrees-vs-remote-coding-agents) for isolation, and [my cmux setup for parallel AI coding](/blog/my-cmux-setup-for-parallel-ai-coding). This one is about what happens when you put an agent in charge of the other agents.

## The setup

The ingredients are ordinary:

- **Five GitHub issues**, written up-front with explicit checklists.
- **One git worktree per issue**, each with its own branch, its own `node_modules`, and its own dev-server port (5174–5178).
- **One task prompt file per runner** — the launch contract. Each prompt spelled out the goal, the issue link, strict file ownership, test/build gates, which branch the PR should target, stacking rules, and how to announce completion.
- **One workspace per runner** (cmux in my case, but see below — it's optional), each running `opencode run "$(cat prompt.md)"`.

The manager created all of it in a couple of minutes:

```bash
git worktree add ../wt/issue-149 -b sub-wait/12-station-pwas origin/main
# ...×5, then per issue:
cmux new-workspace --name "SW149" --cwd ../wt/issue-149 \
  --command 'npm ci && opencode run "$(cat ../prompts/149.md)"' --focus false
```

## What the manager actually does

The manager never edits feature code. Its job is everything around the code:

**Before launch — planning with the human.** Split the work into issues. Decide the dependency order: three of the five tasks touched the same install-related files, so they became a stacked chain (#149 → #151 → #150) with explicit PR bases, while the other two ran fully independent. Assign file ownership: each prompt lists the files that runner owns and the files it must not touch.

**At launch — writing the contracts.** A good runner prompt reads like a work order: goal, ownership, port, gates ("lint, tests, and build must pass"), PR base, push-early rules ("push your branch immediately after the first working commit — two sessions stack on you"), and fallback rules ("if the base branch never appears after an hour, base on main and say so in the PR body").

**During — monitoring and recovery.** The manager polls each workspace's screen, watches for stalls, and intervenes. When a human review landed on one runner's PR, the manager relayed the feedback into that same session with `opencode run --continue "<follow-up>"` — same conversation, full context, no re-explaining.

**Never — merging.** Runners open PRs; the human merges. The manager coordinates order, but approval stays human.

## The thesis: planning with the manager is the skill

Here's the part I didn't expect. Almost all of the value — and almost none of the time — was in the planning conversation before anything launched.

The runners that received precise prompts produced near-zero conflicts. Three sessions edited the same component file over the course of the evening and never collided, because the ownership boundaries and stacking order made collisions structurally impossible rather than merely unlikely. The only stall all night came from an environment permission, not from a planning failure.

Planning with a manager agent is a learnable, improvable skill, and it looks a lot like writing a good technical design doc:

- **Order the dependencies before launching anything.** Stacked branches with declared PR bases beat "everyone branch from main and we'll sort it out."
- **Write ownership lists, not vibes.** "You own `SubWaitPwa.tsx` and the new modal component; do not touch `InstallRoute.tsx`" prevents the merge conflict instead of resolving it.
- **Give every runner a fallback.** Agents wait politely forever unless you tell them when to stop waiting and what to do instead.
- **Make coordination observable.** Push early, push often; dependents poll `git fetch && git rev-parse origin/<base-branch>` and rebase when it moves.

Treat the planning session the way you'd treat code review: slow down, be explicit, assume the reader has no context — because it doesn't.

## War stories

Things went wrong in instructive ways:

- **A runner lost its first keystroke.** The terminal wasn't ready when the launch command was typed, so `npm ci` arrived as `pm ci` and the session sat at a shell error. The manager caught it on the first monitoring pass and re-sent the command.
- **Permission defaults differ.** Runners launched non-interactively auto-reject permission prompts the interactive manager would have approved. One session stalled trying to read a screenshot script outside its workspace. The fix was a prompt rule: only use tooling that works unattended.
- **Workspaces closed on completion.** Two finished runners' workspaces disappeared before I could inspect them. Recovery was painless — `opencode run --continue` in the same worktree resumed each session with zero lost context — and the lesson became a launch-command pattern: `opencode run "$(cat prompt.md)"; opencode --continue`, which drops into an open interactive session instead of exiting.
- **The stack rebased live.** While the middle of the stacked chain was still being built, the base PR absorbed human review feedback and gained new commits. The dependent runner's prompt already told it to re-fetch and rebase before opening its PR, so the moving base was routine instead of a fire.

## Why not just use subagents?

OpenCode (like most agent tools) can spawn subagents from within a session, and for research or bounded chores they're great. But for parallel feature work, the manager/runner pattern was preferable for two reasons:

- **Visibility.** A subagent is a black box until it returns: no screen to peek at, no incremental diff to review, no way to notice it stalled on a permission prompt ten minutes ago. Runners are ordinary sessions in ordinary terminals — you can watch them work, read their scrollback, and inspect their worktree at any moment.
- **Subagents terminate.** When a subagent finishes, its context is gone. A runner session persists: when the human review landed on one PR hours later, the feedback went back into the *same* conversation with `opencode run --continue`, with all of its implementation context intact. That resumability is what made recovery from stalls and review round-trips nearly free.

Subagents are fire-and-forget; runners are colleagues you can tap on the shoulder.

## Do you need cmux? No — it's optional

Everything load-bearing here is plain Git and OpenCode: worktrees, `opencode run`, `--continue`, branch stacking, and `gh` for PRs. cmux provided conveniences, each with a boring substitute:

| cmux feature | cmux-free alternative |
| --- | --- |
| A workspace per runner | tmux windows, or plain background processes |
| `cmux read-screen` monitoring | `tmux capture-pane`, or redirect `opencode run` to a log and `tail -f` |
| `cmux send` to inject follow-ups | `tmux send-keys`, or a fresh `opencode run --continue "<follow-up>"` in the worktree |
| `cmux notify` completion pings | ntfy.sh / Pushover / a Slack webhook curl at the end of the prompt |
| `cmux browser` for screenshots | Playwright per worktree |

A minimal cmux-free recipe:

```bash
git worktree add ../wt/issue-N -b feature/issue-N origin/main
cd ../wt/issue-N && npm ci
opencode run "$(cat ../prompts/issue-N.md)" > run.log 2>&1 &
# monitor: tail -f run.log
# follow up: opencode run --continue "address the review comment ..."
# notify: curl -d "issue-N done" ntfy.sh/your-topic   (appended to the prompt)
```

The manager loop — plan, launch, monitor, recover, coordinate — is identical either way.

## Warnings

Parallelism multiplies everything, including the costs:

- **CPU and disk pressure are real.** Each worktree carries its own `node_modules`, build output, caches, a dev server, and an agent session on top. Five runners means five of everything.
- **How much this hurts depends entirely on the project.** This small Vite site ran five parallel runners comfortably on a laptop. A mature frontend monorepo — multi-gigabyte checkouts, heavy installs, watchers, language servers indexing every worktree — may not tolerate more than one or two. The [worktrees post](/blog/worktrees-vs-remote-coding-agents) covers a laptop that crashed under exactly this load.
- **Watch for the symptoms:** fans and thermal throttling, test suites slowing down across *all* sessions at once, disk filling with duplicate dependency trees, editor indexers churning.
- **Mitigations:** cap concurrent runners, stagger the test/build-heavy phases, give every dev server a unique port, and clean up worktrees when the work is verified done.

## Practical takeaways

- Keep a **prompt-file template**: goal, issue link, file ownership, dev port, quality gates, PR base, stacking/fallback rules, completion notification.
- Launch with `opencode run "$(cat prompt.md)"; opencode --continue` so finished sessions stay open and interactive instead of exiting.
- Push stacked bases early; have dependents poll and rebase.
- Route human review feedback back into the *owning* session with `--continue` — the context is already there.
- Let the manager coordinate; let the human merge.

## Open questions on worktree lifecycle

Two policies I haven't settled between:

1. **Fresh-per-task, delete after verification.** Remove a worktree only once a human confirms the task is completely done — merged and deployed — with `git worktree remove` and branch cleanup as the manager's end-of-task step. Maximum cleanliness, maximum repeated setup cost.
2. **Pooled reuse.** Keep a small pool of warm worktrees and reassign them to new tasks — `git fetch && git checkout -B <new-branch> origin/main` after verifying a clean status — saving the `npm ci`/browser-install startup time without growing disk usage.

Fresh-per-task is safer; pooling is faster. A future post may compare them properly.
