---
title: "Plan the work and set up workers"
description: "Split tasks, order dependencies, create isolated worktrees, and write the launch contract."
---

# Plan the work and set up workers

The first three steps happen before any agent writes code. Most parallel-work failures are planning failures, not model failures.

## Step 1: Split the work and order the dependencies

Do this with the manager before creating anything.

Group the tasks by the files they touch. Tasks that share code must be sequenced as a stack with explicit pull-request bases; tasks that do not can branch from `main` independently.

In the feature-batch example, three tasks touched the same install experience and became a stack, while two were independent:

```text
main
 |- #1 station PWAs ......... base: main
 |   \- #3 install modal .... base: #1
 |       \- #2 walkthroughs . base: #3
 |- #4 feedback flow ........ base: main
 \- #5 return links ......... base: main
```

Parallelism should follow this graph, not the number of open issues.

Two useful splitting criteria:

- **By file ownership**, for feature work. Tasks that cannot touch the same files can run fully in parallel.
- **By theme and severity**, for remediation work. Grouping related findings gives one worker a coherent mental model of a subsystem. [Chapter 5](/guides/manager-worker-parallel-agents/case-study-parallel-remediation) works through this.

## Step 2: Create one worktree per task

```bash
git worktree add ../workers/task-1 -b feature/station-pwas origin/main
cd ../workers/task-1 && npm ci
```

Repeat per task. Assign each worker a distinct dev port (5174, 5175, and so on) and record it in the contract.

## Step 3: Write the worker contract

Write a prompt file per worker instead of typing instructions into terminals. A contract that omits ownership or escalation rules is the most common source of conflicts.

Each contract should state:

- the goal and the issue link;
- the files this worker owns, and the files it must not touch;
- its branch, worktree path, dev port, and pull-request base;
- the quality gates that must pass before handoff;
- the autonomy level and escalation conditions;
- what to do if a dependency branch or permission blocks progress;
- the exact completion report expected.

A full template is in [Chapter 7](/guides/manager-worker-parallel-agents/reference).

## Writing good ownership boundaries

"Improve the install flow" is not an ownership boundary. A useful contract says which component and tests a worker owns, where shared edits are permitted, and which neighboring files belong to another worker.

Explicit ownership makes conflicts structurally less likely rather than merely unlikely. The stack will still move while workers are active, so each worker also needs to know when to fetch, rebase, and update its draft PR.

## Define evidence before coding

Require evidence that matches each task: generated-artifact counts for a build-step change, focus and keyboard tests for a modal, media size checks for video work, route screenshots for UI changes.

Without predeclared gates, "done" means whatever the worker happened to verify. With gates, the manager can compare handoffs consistently.
