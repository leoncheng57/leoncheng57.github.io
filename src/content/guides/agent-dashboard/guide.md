---
title: "Watching Parallel Agents with a Status Protocol and a Local Board"
description: "Give every worker agent a status file it rewrites on each phase change, then read those files as one live terminal board that shows who is working, who is blocked, and who has gone quiet."
updatedAt: "2026-08-14"
publishedAt: "2026-08-14"
audience: "Engineers already running several coding agents at once who cannot tell, at a glance, which ones are stuck."
tags:
  - AI
  - workflow
  - observability
---

# Watching Parallel Agents with a Status Protocol and a Local Board

Running several coding agents at the same time scales the work but not the visibility. Once four or five workers are going, the only way to know where they are is to walk the terminals one by one, and a worker that quietly blocked on a missing credential looks exactly like a worker that is still thinking.

This guide fixes that with two pieces. The first is a **reporting protocol**: every worker rewrites a small `.agent-status.json` at the root of its own worktree on every phase change. The second is a **CLI board**: a local, zero-dependency Node command that collects those files, joins them with Git, GitHub, and cmux state, and prints one row per worker — as a one-shot table, a live `--watch` board in a spare terminal, or `--json` for other tools.

![The live board in a terminal: a header counting children, blocked, stale, and done, then one row per child showing phase, age, branch with ahead/behind counts, CI state, pull request number, cmux workspace, and a one-line note.](/guides/agent-dashboard/board.svg "One row per child, sorted worst-first. The stale row and the no-report rows are the ones that matter.")

The protocol is the part that matters. It is useful on its own, before any dashboard exists, because it converts "go look at five terminals" into "read five small files". The board is just the nicest way to read them.

This guide is a companion to [Running Parallel Coding Agents with a Manager and Workers](/guides/manager-worker-parallel-agents), which covers how the workers get launched in the first place. You do not need to have read it, but the vocabulary — manager, worker, worktree, contract — comes from there. Everything is on this one page: the flow, the protocol, the manager activation block, the CLI, and the reference.

## Why a terminal board

This board exists for one specific moment: an agent session you are working in becomes a **manager**, fans the work out to several **child** sessions, and you suddenly have four or five terminals doing things you can no longer see at once.

The flow it supports has four steps:

1. During a session, you decide the work should be parallelized. The session becomes the manager.
2. You paste the manager activation block (next section) so the session knows the conventions: one child per Git worktree, one cmux workspace per child, a status file each child rewrites as it works.
3. The manager launches the children, then spawns this CLI in a spare terminal with `--watch`. One live table, one row per child.
4. When the run is over, you close that terminal yourself. The board holds no state; nothing else notices.

The board is a CLI on purpose. The children are terminals, the manager is a terminal, and a watcher belongs next to them — one more pane in the same multiplexer, not a browser tab that drifts behind the work. It also means the machine-readable form is one flag away: `--json` is the same aggregation the table prints.

### Why not just look at the terminals?

Reading a child's TUI from outside is a guess dressed up as monitoring:

- A quiet terminal is ambiguous. A long test run, deep model thinking, a prompt waiting for input, and a dead process all look identical from the outside.
- Scrollback is lossy. The line that explained the failure scrolled away an hour ago.
- Output formats change. The moment the agent's TUI redraws differently, the scraper reads noise.
- It does not scale. Five children means five panes to walk, every few minutes, forever.

The same is true of the other indirect signals. Processes prove existence, not progress. Git proves commits, not work in progress.

| Approach | Tells you | Fails when |
| --- | --- | --- |
| Watch processes | A process exists | The agent is alive but stuck waiting for input |
| Watch Git | Commits landed | Work is in progress and uncommitted |
| Scrape terminals | Whatever was printed | Output format changes, or scrollback is lost |
| Child reports | The phase the child believes it is in | The child dies — which the timestamp then exposes |

### Poll to push

The fix is to stop observing and start requiring reports. Every child rewrites a small status file at the root of its own worktree on every phase change. That one rule converts "walk five terminals" into "read five small files" — and converts a manager that polls into a manager that gets told.

Two failure modes get first-class treatment, because they are the ones that silently eat an afternoon:

- **Blocked children announce themselves.** A child that hits a missing credential writes `blocked` with a reason and stops, instead of burning tokens guessing.
- **Silent children get exposed.** Every report carries a timestamp; a row that has not been rewritten in fifteen minutes is flagged stale. A child that died mid-task looks exactly like this — which is the point.

And to be clear about scope: this is not a scheduler or a supervisor — it reads and never starts, stops, or nudges a child. It is not remote monitoring — it reads local files on one machine, so there is nothing to deploy. And it is not a transcript viewer — it never parses agent output. Children report; they are not scraped.

## The status protocol

The protocol is one rule: **on every phase change, a child rewrites a small JSON file at the root of its own worktree.** Everything else on this page reads that file.

### The file

The file is `.agent-status.json`, written at the root of the child's worktree:

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

It is deliberately flat: one object per child, no nesting, no history. The reader should never have to understand a transcript to answer "what is everyone doing right now".

| Field | Type | Purpose |
| --- | --- | --- |
| `task` | string | Stable task identifier, usually the issue slug |
| `phase` | string | Current phase, from the vocabulary below |
| `branch` | string | Branch the child owns |
| `pr_url` | string or null | Draft PR once one exists |
| `summary` | string | One line of human context for the current phase |
| `blockers` | string array | Empty unless `phase` is `blocked` |
| `updated_at` | ISO 8601 string | Rewritten on every transition |

Two fields do the real work. `phase` is what you scan for; `updated_at` is what makes silence detectable.

### One phase vocabulary

A shared vocabulary is what lets one board describe children doing unrelated jobs. Six phases cover the normal path, and one covers trouble:

```text
assigned -> working -> verifying -> pushed -> pr-open -> done
                 \
                  `-> blocked (from any phase, and back again)
```

| Phase | Means |
| --- | --- |
| `assigned` | Contract received, nothing written yet |
| `working` | Implementing |
| `verifying` | Running lint, tests, build |
| `pushed` | Branch pushed, no pull request yet |
| `pr-open` | Draft pull request open, awaiting review |
| `done` | Work handed off; the child is idle but resumable |
| `blocked` | Cannot proceed; `blockers` says why |

Keep the list short and closed. A vocabulary that grows per task stops being scannable, which is the only thing it was for.

`blocked` is the phase that earns the whole protocol. A child that hits a missing credential, an ambiguous requirement, or a failing dependency writes the reason and stops, instead of burning tokens or silently guessing.

### Keep the file out of Git

The status file describes a local run, not the branch, so it must never land in a commit. Add it to `.gitignore` once, in the shared repository:

```bash
echo '.agent-status.json' >> .gitignore
```

Ignoring it centrally also means a child cannot accidentally include it in a diff, which would otherwise produce a pull request whose contents change every time the agent changes phase.

### Mirror the phase where you already look

The file is for tooling. If your terminal multiplexer can show a per-tab status, mirror the phase there too, so the information is present in the place you are already looking:

```bash
cmux set-status agent "$PHASE" --icon "bolt.fill"
```

This is optional and entirely substitutable — a tmux window rename does the same job. The file remains the source of truth; the tab is a convenience.

### Turn a session into a manager

The protocol only happens if the manager demands it, so the whole arrangement is packaged as one block you paste into any agent session the moment you decide it should become a manager. It carries the conventions, the assignment template, the reporting rule, and the board:

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

With the protocol in place you already have something useful: `cat ../*/.agent-status.json` answers the question across every worktree. The CLI replaces that with a board.

## Run the CLI

The CLI is a single file with no dependencies. From any directory inside the repository whose children you want to watch:

```bash
node <site-repo>/alpha-projs/agent-dashboard/cli.mjs            # one-shot table
node <site-repo>/alpha-projs/agent-dashboard/cli.mjs --watch    # live board, redrawn every 5s
node <site-repo>/alpha-projs/agent-dashboard/cli.mjs --json     # the same state, for scripts and agents
```

There is no install step and, in the common case, no config: the project is inferred from the directory you run it in. The main clone is found with `git rev-parse --git-common-dir` (so running from inside a worktree works), the base branch from `origin/HEAD`, the children from the sibling `<repo>.worktrees/*` directory, and the GitHub repo from the `origin` remote. A config file overrides any of that — see the reference below.

### Reading the board

```text
leoncheng57.github.io  base main
4 children  0 blocked  1 stale  0 done  5:10:49 PM

CHILD             PHASE      AGE  BRANCH                          CI    PR    WORKSPACE     NOTES
gr-screenshot     working    8h   alpha-projs/gmail-reader-sc… +1/-2  pass  #191  -        Installing deps and studying GA dashboard screenshot
Notif CLI         no-report  -    -                               -     -    workspace:45  no .agent-status.json found for this workspace
Notif Plugin Core no-report  -    -                               -     -    workspace:44  no .agent-status.json found for this workspace
Selfhost Pilot    no-report  -    -                               -     -    workspace:46  no .agent-status.json found for this workspace
```

One row per child, sorted worst-first — stale rows, then blocked, then the working phases, with `done` at the bottom. The top of the table is always the shortest description of what still needs attention. In the capture above, all four rows are demanding it: a child that claims `working` but has not reported for eight hours is almost certainly dead, and three `Child:` workspaces exist that never reported at all.

| Column | Source | Meaning |
| --- | --- | --- |
| CHILD | status file | The `task`, falling back to the worktree directory name |
| PHASE | status file | The phase the child last reported, colored by severity |
| AGE | status file | Time since `updated_at`; red once it crosses the stale threshold |
| BRANCH | status file + Git | The child's branch, with `+ahead/-behind` counted against the base branch |
| CI | GitHub | The status-check rollup of the branch's newest pull request |
| PR | GitHub | Pull request number — dim while draft, blue when open, purple when merged |
| WORKSPACE | cmux | The cmux workspace the child's worktree lives in |
| NOTES | status file | Blockers in red; otherwise the child's one-line summary |

Two synthetic phases can appear alongside the reported ones. `no-report` marks a `Child:` cmux workspace that has no status file — a child that was created but never reported, which is precisely the child that must not be invisible. `invalid` marks a status file that would not parse, usually one caught mid-write; the row stays on the board with the parse error in NOTES.

`cmux` and `gh` are optional. When either is missing or fails, its columns show `-` and the reason appears once, as a quiet note under the table. Only Git and the status files are required.

### The live board

`--watch` renders the same table in the alternate screen buffer and redraws it on an interval (`--interval <seconds>`, default 5). Ctrl-C restores the terminal exactly as it was — the board holds no state, so quitting and relaunching it costs nothing.

In the four-step flow above, the manager spawns this right after launching the children, in a spare pane it does not focus:

```bash
cmux new-pane --type terminal --direction right --focus false
# then, in that pane:
node <site-repo>/alpha-projs/agent-dashboard/cli.mjs --watch
```

You glance at the board while the run is going, chat with the manager or any child in their own panes, and close the board's pane yourself when the run is over. Nothing depends on it being up; it is a window onto files, not a participant.

### The machine-readable board

`--json` prints the exact aggregation the table renders — children, counts, sources, notes — and exits. It exists so the board is not only for eyes: a manager session can read it directly instead of globbing the status files itself, and any other tool can build on the same view of the run. The schema is in the reference below.

## Reference

### Flags

| Flag | Meaning |
| --- | --- |
| `--watch` | Live board in the alternate screen buffer, restored cleanly on Ctrl-C |
| `--json` | Print the aggregated state as JSON and exit |
| `--config <path>` | Use this config file instead of auto-detection |
| `--project <name>` | Select one project from a multi-project config |
| `--interval <seconds>` | Redraw interval for `--watch` (default 5) |
| `--help` | Usage |

`NO_COLOR` in the environment, or piping stdout, disables color.

### Auto-detection

With no config file, the project is inferred from the current directory:

| Value | Derived from |
| --- | --- |
| `root` | `git rev-parse --git-common-dir`, so running from inside a linked worktree resolves to the main clone |
| `name` | The basename of `root` |
| `mainBranch` | `origin/HEAD`, falling back to `main` |
| `worktrees` | `<parent of root>/<name>.worktrees/*` — the sibling-directory layout the manager conventions use |
| `github` | Owner and repo parsed from the `origin` remote, SSH or HTTPS form |

If the current directory is not inside a Git repository, the CLI refuses to guess and asks for `--config`.

### Config keys

`agent-dashboard.config.json`, created by copying `agent-dashboard.config.example.json`, found in the current directory or next to `cli.mjs`. The file is gitignored because its values are local paths; only the example is committed. A config that exists but does not parse is a hard error — a silently ignored config is worse than a refusal to start.

| Key | Type | Meaning |
| --- | --- | --- |
| `name` | string | Project label shown in the header |
| `root` | string | Path to the main clone |
| `mainBranch` | string | Base branch for ahead/behind counts |
| `worktrees` | string | Directory of child worktrees; a trailing `/*` scans its subdirectories |
| `github` | `{ "owner", "repo" }` | Repository for `gh pr list`; omit to use `gh`'s own resolution |
| `staleAfterSeconds` | number | Age past which a row is flagged stale (default 900); `done` rows are exempt |

Anything the config leaves out falls back to auto-detection, so a config can be a single overridden key. To track several projects, wrap them in a `projects` array and select one with `--project <name>`.

### The `--json` response

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

Top level: `generatedAt` (when this response was built), `project` (the resolved project; `source` is `auto-detected` or the config path), `staleAfterSeconds` (echoed so a consumer can explain its own coloring), `counts` (`total`, `blocked`, `stale`, `done`), `sources` (whether `cmux` and `gh` answered on this pass), `notes` (non-fatal degradations, such as `gh not on PATH`), and `children` (one entry per child, pre-sorted worst-first).

Per child: `id` (worktree directory name), `worktree` (absolute path the status file was read from), the status-file fields passed through (`task`, `phase`, `branch`, `summary`, `blockers`, with `pr_url` camel-cased to `prUrl`), `updatedAt`/`ageSeconds` (with the age derived at read time), `stale` (`ageSeconds > staleAfterSeconds` and phase is not `done`), `note` (set on synthetic rows), `git` (`{ available, ahead, behind, base }`), `ci` (`{ state, available }` — `passing`, `failing`, `pending`, `unknown`, or `none`), `pr` (`{ number, state, isDraft, url }`), and `cmux` (`{ ref, title }` of the matched `Child:` workspace).

Every row has the same keys whether or not its file parsed, so consumers never feature-detect. `snake_case` on disk is for humans writing the file by hand; `camelCase` in the output is for the clients reading it.

### Extending

The CLI separates its sources, which is where extensions belong:

- `readStatusFile(directory, …)` decides what a child is. Accept a second file format here by mapping it into the same shape, rather than teaching the renderer a second schema.
- `readCmuxWorkspaces()` / `readPullRequests()` / `readAheadBehind()` each degrade independently. A new source — a CI system, a different multiplexer — should follow the same pattern: return `available: false` with a one-line note instead of throwing.
- Every subprocess goes through one cached `run()` helper (5-second TTL, 10-second timeout), so a new source inherits the same cost controls.

The rule to keep is that the CLI reads and never writes. As soon as it can nudge a child, a bug in it can corrupt a run, and its job is to be the thing you trust when everything else is uncertain.

### Checklist

- [ ] `.agent-status.json` added to the repository `.gitignore`
- [ ] Reporting rule present in every child contract
- [ ] Worktrees at `../<repo>.worktrees/<branch>` so auto-detection finds them
- [ ] `staleAfterSeconds` longer than your slowest normal verification step
- [ ] Board left running in an unfocused pane for the whole run — and closed by you, not by the manager
- [ ] Blocked rows treated as an interrupt, not a queue

### Related reading

- [Running Parallel Coding Agents with a Manager and Workers](/guides/manager-worker-parallel-agents) — how the children this watches are planned, launched, and reviewed
- [The CLI source](https://github.com/leoncheng57/leoncheng57.github.io/tree/main/alpha-projs/agent-dashboard) — one file, no dependencies, vendored in this site's repository
