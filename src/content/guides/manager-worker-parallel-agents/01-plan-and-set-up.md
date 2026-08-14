---
title: "Plan the work and set up workers"
description: "Split tasks, order dependencies, create isolated worktrees, and write the launch contract."
part: "The Procedure"
---

# Plan the work and set up workers

Most parallel-work failures are planning failures. Do these three steps before any agent writes code.

## Step 1: Split the work and order the dependencies

Group tasks by the files they touch. Tasks sharing code need a stack with explicit PR bases; independent tasks can branch from `main`.

```text
main
 |- #1 station PWAs ......... base: main
 |   \- #3 install modal .... base: #1
 |       \- #2 walkthroughs . base: #3
 |- #4 feedback flow ........ base: main
 \- #5 return links ......... base: main
```

Parallelism follows this graph, not the issue count. Split by file ownership for feature work, or by theme and severity for remediation ([Chapter 5](/guides/manager-worker-parallel-agents/case-study-parallel-remediation)).

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

Full template: [Chapter 7](/guides/manager-worker-parallel-agents/reference).

## Ownership and evidence

"Improve the install flow" is not an ownership boundary. Name the exact component a worker owns and what belongs to someone else — this makes conflicts structurally unlikely, not just less likely.

Require evidence matching the task before coding starts. Without predeclared gates, "done" means whatever the worker happened to check.
