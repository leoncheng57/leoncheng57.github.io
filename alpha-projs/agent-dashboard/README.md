# Agent Dashboard (alpha, local-only)

One view of every child agent working in parallel. Each child writes a small
`.agent-status.json` at the root of its own git worktree on every phase change;
this CLI collects those files and joins them with git, GitHub, and cmux state to
print one row per child.

It is intentionally **not deployed**: the thing it reports on is a set of
worktrees on one laptop, so a static host has nothing to point it at.

## Run

```bash
cd alpha-projs/agent-dashboard
node cli.mjs            # one-shot table
node cli.mjs --watch    # live board, redrawn every 5s, ctrl-c to exit
node cli.mjs --json     # aggregated state for scripts and agents
```

No install step and no config file: there are no dependencies, and the project
is inferred from the current directory. Requires Node 22 or newer.

```text
leoncheng.dev  base main
5 children  1 blocked  1 stale  1 done  4:04:29 PM

CHILD                 PHASE      AGE  BRANCH                      CI    PR    WORKSPACE     NOTES
auth-guard            working    2h   refactor/auth-guard         -     -     -             extracting the guar…
search-filters        blocked    6m   feat/search-filters         -     -     -             needs a decision on…
manager-worker-guide  verifying  1m   blog/manager-worker-ag… +9  pass  #175  -             running lint, tests…
Agent Dashboard 2     pr-open    4m   guides/agent-dashbo… +7/-5  pass  #192  workspace:39  draft PR open, awai…
gmail-screenshot      done       42m  alpha-projs/gmail-r… +1/-1  pass  #191  -             merged
```

Rows sort worst-first - stale, then by phase - so the top of the table is the
shortest description of what still needs attention.

## Flags

| Flag | Meaning |
| --- | --- |
| `--watch` | Live board in the alternate screen buffer, restored cleanly on ctrl-c |
| `--json` | Print the aggregated state and exit |
| `--config <path>` | Use this config file instead of auto-detection |
| `--project <name>` | Select one project from a multi-project config |
| `--interval <seconds>` | Redraw interval for `--watch` (default 5) |
| `--help` | Usage |

## Auto-detection

With no config file, the project is inferred from the current directory:

- **root** - the main clone, from `git rev-parse --git-common-dir`, so this works
  from inside a linked worktree too
- **name** - that directory's basename
- **mainBranch** - `origin/HEAD`, falling back to `main`
- **worktrees** - `<parent of root>/<name>.worktrees/*`
- **github** - owner and repo parsed from the `origin` remote

Copy `agent-dashboard.config.example.json` to `agent-dashboard.config.json` to
override any of those, or to track several projects via a `projects` array. The
config file is gitignored because its values are local paths.

## Degrading

`cmux` and `gh` are optional. When either is missing or fails, its columns show
`-` and the reason is printed as a single note under the table. Only git and the
status files are required.

## Privacy rules for this folder

- No status files, worktree paths, or config with local paths may be committed -
  copy the example config to `agent-dashboard.config.json` instead.
- The collector reads only `.agent-status.json`; it never reads agent
  transcripts, and it never writes to a child's worktree.

Full walkthrough: [the Agent Dashboard guide](https://leoncheng.dev/guides/agent-dashboard).
