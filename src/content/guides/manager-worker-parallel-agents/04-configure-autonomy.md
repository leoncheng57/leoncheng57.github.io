---
title: "Configure worker autonomy"
description: "Choose an autonomy level per task and back it with a matching permission scope."
part: "The Procedure"
---

# Configure worker autonomy

Autonomy is not one global switch — set it per task.

```text
 manager-heavy                              worker-heavy
 |------------|------------|------------|------------|
 supervised   checkpointed   draft PR    outcome-only
 (ask first)  (slice+pause) (PR+review)  (report only)
```

## Step 4: Choose an autonomy level

| Mode | Worker | Manager | Use when |
| --- | --- | --- | --- |
| Supervised | Proposes before edits | Approves the approach | Ambiguous or risky |
| Checkpointed | One slice, then pauses | Reviews, unlocks next | Shared files, unproven design |
| Draft PR | Implements, opens draft PR | Reviews commits, scope, CI | Most bounded work |
| Outcome-only | Runs to completion | Intervenes only on failure | Mechanical, well-specified |

Encode the choice directly. Draft-PR worker:

```text
Work autonomously through implementation and local verification.
Open a draft PR after the first complete commit.
Ask the manager to review the commit stack and remaining workload.
Never merge.
```

Outcome-only worker:

```text
Run to completion without intermediate check-ins.
Stop only for a destructive action, missing credential, or scope conflict.
Report the PR, tests, screenshots, and residual risks when done.
Never merge.
```

## Step 5: Match permissions to the level

- Pre-approve routine commands inside its own worktree
- Deny destructive Git commands and all merges
- Require escalation for credentials, external systems, scope changes

Rules that hold up: match autonomy to reversibility, not difficulty; raise it as trust builds and drop it on surprise; never include merge; make the escalation list explicit, not "ask if unsure."

## Workers run while the manager is blocked

Sessions are independent processes. A scoped worker keeps editing and pushing while the interactive manager pauses elsewhere for a permission question.
