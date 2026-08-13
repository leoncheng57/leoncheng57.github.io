---
title: "Configure worker autonomy"
description: "Choose an autonomy level per task and back it with a matching permission scope."
---

# Configure worker autonomy

This is the step most people skip, and it is the one that makes the pattern flexible. Autonomy is not one global "auto-approve" switch. Set it per task.

![Four configurable worker autonomy levels: supervised, checkpointed, draft PR, and outcome-only. Manager involvement decreases as worker autonomy increases, while the human merge gate remains.](/guides/manager-worker-agents/autonomy-spectrum.svg "Worker autonomy can be tuned independently for each task.")

## Step 4: Choose an autonomy level

| Mode | Worker behavior | Manager behavior | Use when |
| --- | --- | --- | --- |
| Supervised | Proposes a plan, asks before consequential edits | Answers questions, approves the approach | The task is ambiguous or risky |
| Checkpointed | Implements one slice, commits, pauses | Reviews the diff, unlocks the next slice | Files are shared or the design is unproven |
| Draft PR | Implements and tests, opens a draft PR, requests review | Reviews commits, scope, workload, and CI | Most bounded product work |
| Outcome-only | Runs to completion, then reports | Intervenes only on failure or alert | The task is mechanical and well specified |

Encode the choice as plain instructions. For a draft-PR worker:

```text
Work autonomously through implementation and local verification.
Open a draft PR after the first complete commit.
Ask the manager to review the commit stack and remaining workload.
Do not mark the PR ready until the manager confirms scope and CI.
Never merge.
```

For an outcome-only worker:

```text
Run to completion without intermediate check-ins.
Stop only for a destructive action, a missing credential, or a scope conflict.
When done, report the PR URL, commits, tests, screenshots, and residual risks.
Never merge.
```

A worker can change modes over its life: supervised while the design is uncertain, then draft-PR once the approach is settled.

## Step 5: Match permissions to the autonomy level

Autonomy is only real if the worker can act unattended. Pair each mode with a permission scope:

- Pre-approve routine commands inside the worker's own worktree.
- Deny destructive Git commands and all merges.
- Require escalation for credentials, external systems, and scope changes.
- Keep broad read and coordination access on the manager, not the workers.

Workers launched non-interactively typically auto-reject anything outside this scope, which is the desired behavior. Fix a blocked worker by narrowing the task to tools available inside its environment, not by widening permissions.

## Rules that hold up across batches

- **Match autonomy to reversibility, not to difficulty.** A large but reversible refactor can run outcome-only. A small migration that touches production data should be supervised.
- **Raise autonomy over time, lower it on surprise.** Promote a worker to draft-PR mode once its first slice looks right; drop it back to checkpointed the moment it makes an unexpected structural change.
- **Autonomy never includes merge.** The human gate is fixed regardless of mode.
- **Make the escalation list explicit.** "Ask if unsure" is not actionable. "Stop for credential prompts, destructive commands, or scope changes" is.

## Workers keep running while the manager is blocked

The sessions are independent processes. A worker with a narrow contract and pre-scoped permissions continues unattended, while the interactive manager may pause to ask you a permission or design question.

The manager is not a scheduler that must stay continuously active for workers to make progress. Once launched, each worker keeps editing, testing, committing, and opening its draft PR. The manager catches up from terminal output, Git history, and PR state when it resumes.
