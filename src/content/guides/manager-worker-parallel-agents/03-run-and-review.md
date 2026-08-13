---
title: "Launch, review, and land the work"
description: "Start workers safely, monitor without taking over, review draft PRs, and clean up."
---

# Launch, review, and land the work

## Step 6: Launch the workers

```bash
cmux new-workspace \
  --name "Task 1" \
  --cwd ../workers/task-1 \
  --command 'opencode run "$(cat ../prompts/task-1.md)"; opencode --continue' \
  --focus false
```

Two details matter:

- Trailing `opencode --continue` keeps the session interactive after the run completes, so a finished worker stays inspectable instead of closing.
- `--focus false` prevents each launch from stealing your window.

After launching, confirm each worker actually started. Do not assume a created workspace means a running agent; see [Chapter 6](/guides/manager-worker-parallel-agents/troubleshooting).

## Step 7: Monitor without taking over

The manager polls worker screens, branch activity, draft PRs, and CI. When a worker stalls, it sends a focused follow-up rather than opening the files and finishing the job.

This restraint is deliberate. A manager that starts implementing becomes another busy worker and stops seeing the system.

## Step 8: Review the draft PRs

A draft PR is the review checkpoint, not just the final artifact. Check:

- commits are logically separated;
- the diff still matches the assigned scope;
- the workload taken on is neither too large nor too small;
- tests and screenshots cover the acceptance criteria;
- dependent branches can still rebase cleanly;
- what remains before human review.

## Step 9: Route feedback into the owning session

Send review feedback back to the session that wrote the code, so its implementation context is reused:

```bash
cd ../workers/task-1
opencode run --continue \
  "Review feedback: split the media-generation changes from the modal commit, rerun the accessibility tests, and update the draft PR evidence."
```

This is the main economic advantage of the pattern. A second review round costs a follow-up message, not a fresh onboarding prompt.

## Step 10: Merge and clean up

You merge; the manager does not. After a change is merged and verified:

```bash
git worktree remove ../workers/task-1
git branch -d feature/station-pwas
git worktree prune
```

Remove worktrees only after verification. Deleting them at first green CI throws away the environment you need if something turns out to be wrong.
