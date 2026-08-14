---
title: "Watch the run: a status protocol and a live board"
description: "Give every worker a status file it rewrites on each phase change, then watch all of them as one live terminal board."
part: "Beyond the Basics"
---

# Watch the run: a status protocol and a live board

Running several workers at once scales the work but not the visibility. Once four or five are going, the only way to know where they are is to walk the terminals one by one — and a worker that quietly blocked on a missing credential looks exactly like a worker that is still thinking.

This chapter fixes that with two pieces. The first is a **reporting protocol**: every worker rewrites a small `.agent-status.json` at the root of its own worktree on every phase change. The second is a **CLI board**: a local, zero-dependency Node command that collects those files, joins them with Git, GitHub, and cmux state, and prints one row per worker — as a one-shot table, a live `--watch` board in a spare terminal, or `--json` for other tools.

![The live board in a terminal: a header counting children, blocked, stale, and done, then one row per child showing phase, age, branch with ahead/behind counts, CI state, pull request number, cmux workspace, and a one-line note.](/guides/manager-worker-parallel-agents/board.svg "One row per worker, sorted worst-first. The stale row and the no-report rows are the ones that matter.")

The protocol is the part that matters. It is useful on its own, before any dashboard exists, because it converts "go look at five terminals" into "read five small files". The board is just the nicest way to read them.

## Why reporting beats watching

Reading a worker's TUI from outside is a guess dressed up as monitoring. A quiet terminal is ambiguous — a long test run, deep model thinking, a prompt waiting for input, and a dead process all look identical from the outside. Scrollback is lossy. Output formats change. And it does not scale: five workers means five panes to walk, every few minutes, forever.

So stop observing and start requiring reports. One rule — every worker rewrites its status file on every phase change — converts a manager that polls into a manager that gets told. Two failure modes get first-class treatment, because they are the ones that silently eat an afternoon:

- **Blocked workers announce themselves.** A worker that hits a missing credential writes `blocked` with a reason and stops, instead of burning tokens guessing.
- **Silent workers get exposed.** Every report carries a timestamp; a row that has not been rewritten in fifteen minutes is flagged stale. A worker that died mid-task looks exactly like this — which is the point.

<details>
<summary>How reporting compares with every polling approach</summary>

| Approach | Tells you | Fails when |
| --- | --- | --- |
| Watch processes | A process exists | The agent is alive but stuck waiting for input |
| Watch Git | Commits landed | Work is in progress and uncommitted |
| Scrape terminals | Whatever was printed | Output format changes, or scrollback is lost |
| Worker reports | The phase the worker believes it is in | The worker dies — which the timestamp then exposes |

The last row's failure mode is handled by the timestamp: absence of an update is itself a signal, which is what makes a stale row meaningful.

To be clear about scope: the board is not a scheduler or a supervisor — it reads and never starts, stops, or nudges a worker. It is not remote monitoring — it reads local files on one machine. And it is not a transcript viewer — it never parses agent output. Workers report; they are not scraped.

</details>

## The status protocol

On every phase change, a worker rewrites `.agent-status.json` at the root of its own worktree:

```json
{
  "task": "agent-dashboard",
  "phase": "working",
  "branch": "guides/agent-dashboard",
  "pr_url": null,
  "summary": "building the CLI board",
  "blockers": [],
  "updated_at": "2026-08-14T12:35:00Z"
}
```

It is deliberately flat: one object per worker, no nesting, no history. Two fields do the real work — `phase` is what you scan for, and `updated_at` is what makes silence detectable. Six phases cover the normal path, and one covers trouble:

```text
assigned -> working -> verifying -> pushed -> pr-open -> done
                 \
                  `-> blocked (from any phase, and back again)
```

Keep the vocabulary short and closed. A list that grows per task stops being scannable, which is the only thing it was for. `blocked` is the phase that earns the whole protocol.

<details>
<summary>Field-by-field and phase-by-phase reference</summary>

| Field | Type | Purpose |
| --- | --- | --- |
| `task` | string | Stable task identifier, usually the issue slug |
| `phase` | string | Current phase, from the vocabulary below |
| `branch` | string | Branch the worker owns |
| `pr_url` | string or null | Draft PR once one exists |
| `summary` | string | One line of human context for the current phase |
| `blockers` | string array | Empty unless `phase` is `blocked` |
| `updated_at` | ISO 8601 string | Rewritten on every transition |

| Phase | Means |
| --- | --- |
| `assigned` | Contract received, nothing written yet |
| `working` | Implementing |
| `verifying` | Running lint, tests, build |
| `pushed` | Branch pushed, no pull request yet |
| `pr-open` | Draft pull request open, awaiting review |
| `done` | Work handed off; the worker is idle but resumable |
| `blocked` | Cannot proceed; `blockers` says why |

</details>

Two housekeeping rules make the protocol stick. First, the file describes a local run, not the branch, so gitignore it once in the shared repository (`echo '.agent-status.json' >> .gitignore`) — otherwise a pull request's contents change every time the agent changes phase. Second, if your terminal multiplexer can show a per-tab status, mirror the phase there too (`cmux set-status agent "$PHASE"`); the file remains the source of truth, the tab is a convenience.

## Turn a session into a manager

The protocol only happens if the manager demands it, so the whole arrangement — the conventions from the earlier chapters, the reporting rule, and the board — is packaged as one block you paste into any agent session the moment you decide it should become a manager.

<details>
<summary>The manager activation block (copy-paste)</summary>

```text
MANAGER MODE. From now on, this session is a MANAGER coordinating parallel
CHILD agent sessions. You coordinate, review, and merge; children implement.

Conventions
- One child = one git worktree = one cmux workspace.
  git worktree add -b <branch> ../<repo>.worktrees/<branch> main
- Child workspaces are named "Child: <Task>" and created in this workspace's
  group, unfocused. Children run a persistent `opencode --auto -m <model>` TUI
  so they can be chatted with after their task finishes.
- Children NEVER push the main branch. They push their own branch (and open a
  draft PR when the repo uses PRs).

Every child assignment prompt must include:
1. Identity + scope: "You are the <task> worker, working ONLY in this worktree
   on branch <branch>."
2. Autonomy: implement, test, commit, push -u origin <branch>; never push main.
3. Reporting (verbatim):
   - On every phase change, rewrite .agent-status.json at the worktree root:
     {"task": "<task>", "phase": "<phase>", "branch": "<branch>",
      "pr_url": <url|null>, "summary": "<one line>", "blockers": [],
      "updated_at": "<ISO 8601 UTC>"}
   - Phases: assigned, working, verifying, pushed, pr-open, done. Use blocked
     at any point, with blockers explaining why.
   - Never skip the write. A stale file is read as a dead worker.
   - Mirror the phase with `cmux set-status agent "<phase>"` and send
     `cmux notify` when done or blocked.
4. The verification gate to run before every commit (lint, tests, build).
5. "Print a short summary and stay available for follow-up instructions."

Manager rules
- Monitor children through their status files and pushed branches. Never
  screen-scrape a child's TUI; read a screen only to debug a stuck child.
- Merge one branch at a time with full verification between merges.
- Immediately after launching children, spawn the live board in a spare
  terminal pane, unfocused:
    cmux new-pane --type terminal --direction right --focus false
  then run in it:
    node <site-repo>/alpha-projs/agent-dashboard/cli.mjs --watch
  The user closes that pane manually when the run is over; never close it
  yourself.
```

Adjust the two placeholders — the model and the path to a checkout of [the CLI](https://github.com/leoncheng57/leoncheng57.github.io/tree/main/alpha-projs/agent-dashboard) — and the block is complete. The `cmux` lines assume [cmux](https://cmux.io); under tmux, substitute a `split-window` and a window rename.

</details>

With the protocol in place you already have something useful: `cat ../*/.agent-status.json` answers the question across every worktree. The CLI replaces that with a board.

## Run the CLI

The CLI is a single file with no dependencies, [vendored in this site's repository](https://github.com/leoncheng57/leoncheng57.github.io/tree/main/alpha-projs/agent-dashboard). From any directory inside the repository whose workers you want to watch:

```bash
node <site-repo>/alpha-projs/agent-dashboard/cli.mjs            # one-shot table
node <site-repo>/alpha-projs/agent-dashboard/cli.mjs --watch    # live board, redrawn every 5s
node <site-repo>/alpha-projs/agent-dashboard/cli.mjs --json     # the same state, for scripts and agents
```

There is no install step and, in the common case, no config: the project is inferred from the directory you run it in. In the four-step flow this guide teaches, the manager spawns the `--watch` board right after launching the workers, in a spare pane it does not focus; you glance at it during the run and close it yourself when the run is over. Nothing depends on it being up — it is a window onto files, not a participant.

```text
leoncheng57.github.io  base main
4 children  0 blocked  1 stale  0 done  5:10:49 PM

CHILD             PHASE      AGE  BRANCH                          CI    PR    WORKSPACE     NOTES
gr-screenshot     working    8h   alpha-projs/gmail-reader-sc… +1/-2  pass  #191  -        Installing deps and studying GA dashboard screenshot
Notif CLI         no-report  -    -                               -     -    workspace:45  no .agent-status.json found for this workspace
Notif Plugin Core no-report  -    -                               -     -    workspace:44  no .agent-status.json found for this workspace
Selfhost Pilot    no-report  -    -                               -     -    workspace:46  no .agent-status.json found for this workspace
```

Rows sort worst-first — stale, then blocked, then the working phases, with `done` at the bottom — so the top of the table is always the shortest description of what still needs attention. In the capture above all four rows are demanding it: a worker that claims `working` but has not reported for eight hours is almost certainly dead, and three `Child:` workspaces exist that never reported at all.

<details>
<summary>Reading the board, column by column</summary>

| Column | Source | Meaning |
| --- | --- | --- |
| CHILD | status file | The `task`, falling back to the worktree directory name |
| PHASE | status file | The phase the worker last reported, colored by severity |
| AGE | status file | Time since `updated_at`; red once it crosses the stale threshold |
| BRANCH | status file + Git | The worker's branch, with `+ahead/-behind` counted against the base branch |
| CI | GitHub | The status-check rollup of the branch's newest pull request |
| PR | GitHub | Pull request number — dim while draft, blue when open, purple when merged |
| WORKSPACE | cmux | The cmux workspace the worker's worktree lives in |
| NOTES | status file | Blockers in red; otherwise the worker's one-line summary |

Two synthetic phases can appear alongside the reported ones. `no-report` marks a `Child:` cmux workspace that has no status file — a worker that was created but never reported, which is precisely the worker that must not be invisible. `invalid` marks a status file that would not parse, usually one caught mid-write; the row stays on the board with the parse error in NOTES.

`cmux` and `gh` are optional. When either is missing or fails, its columns show `-` and the reason appears once, as a quiet note under the table. Only Git and the status files are required.

</details>

<details>
<summary>Flags, auto-detection, and config</summary>

| Flag | Meaning |
| --- | --- |
| `--watch` | Live board in the alternate screen buffer, restored cleanly on Ctrl-C |
| `--json` | Print the aggregated state as JSON and exit |
| `--config <path>` | Use this config file instead of auto-detection |
| `--project <name>` | Select one project from a multi-project config |
| `--interval <seconds>` | Redraw interval for `--watch` (default 5) |
| `--help` | Usage |

With no config file, the project is inferred from the current directory: the main clone from `git rev-parse --git-common-dir` (so running inside a linked worktree works), the name from that directory's basename, the base branch from `origin/HEAD` (falling back to `main`), the workers from the sibling `<repo>.worktrees/*` directory, and the GitHub repo from the `origin` remote. If the current directory is not inside a Git repository, the CLI refuses to guess and asks for `--config`.

`agent-dashboard.config.json` (copied from the committed `.example` file, and gitignored because its values are local paths) overrides any of those keys: `name`, `root`, `mainBranch`, `worktrees` (a trailing `/*` scans subdirectories), `github` (`{ "owner", "repo" }`), and `staleAfterSeconds` (default 900; `done` rows are exempt). Anything the config leaves out still falls back to auto-detection, and several projects can be tracked with a `projects` array plus `--project <name>`. A config that exists but does not parse is a hard error — a silently ignored config is worse than a refusal to start.

</details>

<details>
<summary>The --json response shape</summary>

```json
{
  "generatedAt": "2026-08-14T20:41:07.201Z",
  "project": {
    "name": "leoncheng.dev",
    "root": "/Users/you/code/leoncheng57.github.io",
    "mainBranch": "main",
    "worktrees": "/Users/you/code/leoncheng57.github.io.worktrees/*",
    "github": { "owner": "leoncheng57", "repo": "leoncheng57.github.io" },
    "source": "auto-detected"
  },
  "staleAfterSeconds": 900,
  "counts": { "total": 2, "blocked": 0, "stale": 1, "done": 1 },
  "sources": { "cmux": { "available": true }, "gh": { "available": true } },
  "notes": [],
  "children": [
    {
      "id": "agent-dashboard",
      "worktree": "/Users/you/code/leoncheng57.github.io.worktrees/agent-dashboard",
      "task": "agent-dashboard",
      "phase": "pr-open",
      "branch": "guides/agent-dashboard",
      "prUrl": "https://github.com/leoncheng57/leoncheng57.github.io/pull/192",
      "summary": "draft PR open, awaiting review",
      "blockers": [],
      "updatedAt": "2026-08-14T20:37:00Z",
      "ageSeconds": 247,
      "stale": false,
      "note": null,
      "git": { "available": true, "ahead": 7, "behind": 5, "base": "origin/main" },
      "ci": { "state": "passing", "available": true },
      "pr": { "number": 192, "state": "OPEN", "isDraft": true, "url": "https://…/pull/192" },
      "cmux": { "ref": "workspace:39", "title": "Child: Agent Dashboard 2" }
    }
  ]
}
```

Top level: `generatedAt`, the resolved `project` (`source` is `auto-detected` or the config path), `staleAfterSeconds` (echoed so a consumer can explain its own coloring), `counts`, `sources` (whether `cmux` and `gh` answered on this pass), `notes` (non-fatal degradations such as `gh not on PATH`), and `children` pre-sorted worst-first.

Per child: the status-file fields passed through (with `pr_url` camel-cased to `prUrl`), `updatedAt`/`ageSeconds`, `stale`, `note` (set on synthetic rows), `git` (`{ available, ahead, behind, base }`), `ci` (`passing`, `failing`, `pending`, `unknown`, or `none`), `pr` (`{ number, state, isDraft, url }`), and `cmux` (`{ ref, title }`). Every row has the same keys whether or not its file parsed, so consumers never feature-detect. It exists so the board is not only for eyes: a manager session can read `--json` directly instead of globbing the status files itself.

</details>

<details>
<summary>Extending the CLI, and a checklist</summary>

The CLI separates its sources, which is where extensions belong. `readStatusFile()` decides what a worker is — accept a second file format there by mapping it into the same shape, rather than teaching the renderer a second schema. `readCmuxWorkspaces()`, `readPullRequests()`, and `readAheadBehind()` each degrade independently; a new source — a CI system, a different multiplexer — should follow the same pattern and return `available: false` with a one-line note instead of throwing. Every subprocess goes through one cached helper (5-second TTL, 10-second timeout), so a new source inherits the same cost controls.

The rule to keep is that the CLI reads and never writes. As soon as it can nudge a worker, a bug in it can corrupt a run, and its job is to be the thing you trust when everything else is uncertain.

- [ ] `.agent-status.json` added to the repository `.gitignore`
- [ ] Reporting rule present in every worker contract
- [ ] Worktrees at `../<repo>.worktrees/<branch>` so auto-detection finds them
- [ ] `staleAfterSeconds` longer than your slowest normal verification step
- [ ] Board left running in an unfocused pane for the whole run — and closed by you, not by the manager
- [ ] Blocked rows treated as an interrupt, not a queue

</details>
