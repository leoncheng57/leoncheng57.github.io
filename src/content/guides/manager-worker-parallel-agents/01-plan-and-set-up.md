---
title: "Plan the work and set up workers"
description: "Split tasks into parallel waves, create isolated worktrees, and write the launch contract."
part: "The Procedure"
---

# Plan the work and set up workers

Most parallel-work failures are planning failures. Do these three steps before any agent writes code.

## Step 1: Split the work into waves

Group tasks by the files they touch. Tasks that share code must run in sequence; everything else runs at the same time. The result is a series of **waves** — each wave is a set of workers that can all run in parallel, and a wave starts once the previous one lands.

Five issues, three waves:

```text
 wave 1   #1 station PWAs    #4 feedback flow   #5 return links
          base: main         base: main         base: main
          `---------- 3 workers, all in parallel ----------'
             |
             v  (#1 lands)
 wave 2   #3 install modal
          base: #1
             |
             v  (#3 lands)
 wave 3   #2 walkthroughs
          base: #3
```

Wave 1 is three parallel workers because those files never overlap. Issues #3 and #2 touch the same install experience as #1, so they stack behind it with explicit PR bases. Parallelism follows this graph, not the issue count.

## The isolation model

Four boundaries per worker. Skip one and parallel work breaks:

| Boundary | Mechanism | Prevents |
| --- | --- | --- |
| History | One branch per task | Interleaved commits |
| Files | One worktree per task | Concurrent edits |
| Runtime | One port per task | Port collisions |
| Context | One session per task | Lost task memory |

## Step 2: Create one worktree per task

```bash
git worktree add ../workers/task-1 -b feature/station-pwas origin/main
cd ../workers/task-1 && npm ci
```

Repeat per task, with a distinct dev port each, recorded in the contract.

## Step 3: Write the worker contract

Write a prompt file per worker. Each contract states:

- goal and issue link
- files owned, and files off-limits
- branch, worktree path, port, PR base
- quality gates
- autonomy level and escalation conditions
- the exact completion report expected

"Improve the install flow" is not an ownership boundary — name the exact component a worker owns and what belongs to someone else. Full template: [the reference chapter](/guides/manager-worker-parallel-agents/reference).
