---
title: "Launch, review, and land the work"
description: "Start workers safely, monitor without taking over, review draft PRs, and clean up."
part: "The Procedure"
---

# Launch, review, and land the work

```text
launch -> monitor -> draft PR -> review -> feedback -+
   ^                                                   |
   +--------------------- revise <--------------------+
                                        |
                                     merge -> cleanup
```

## Step 6: Launch the workers

```bash
cmux new-workspace \
  --name "Task 1" \
  --cwd ../workers/task-1 \
  --command 'opencode run "$(cat ../prompts/task-1.md)"; opencode --continue' \
  --focus false
```

`opencode --continue` keeps the session alive after the run finishes; `--focus false` keeps it from stealing your window. Confirm each worker actually started — see [Chapter 6](/guides/manager-worker-parallel-agents/troubleshooting).

## Step 7: Monitor without taking over

The manager polls screens, branches, and CI. A stalled worker gets a focused follow-up, not a takeover — a manager that starts implementing stops seeing the system.

## Step 8: Review the draft PRs

A draft PR is a checkpoint, not just the final artifact: commits separated, diff matches scope, evidence covers acceptance criteria, dependent branches still rebase.

## Step 9: Route feedback into the owning session

```bash
cd ../workers/task-1
opencode run --continue \
  "Review feedback: split the media-generation changes from the modal commit."
```

A second review round costs a follow-up message, not a fresh onboarding prompt.

## Step 10: Merge and clean up

You merge; the manager does not.

```bash
git worktree remove ../workers/task-1
git branch -d feature/station-pwas
git worktree prune
```

Remove worktrees only after verification, not at first green CI.
