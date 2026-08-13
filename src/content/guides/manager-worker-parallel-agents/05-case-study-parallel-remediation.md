---
title: "Case study: parallel remediation after a manager review"
description: "What a manager review found in an autonomously built MVP, and how the fixes were split across workers with an explicit integration order and a go-live gate."
---

# Case study: parallel remediation after a manager review

The earlier chapters use a feature batch as the example. This chapter covers the other common shape: a worker builds something end to end, the manager reviews it, and the findings become the next parallel batch.

The subject was a local-first client that syncs and acts on data from a third-party API. A single worker built the MVP autonomously across five milestone commits. Type checking, linting, tests, and the production build all passed on every commit.

The manager then reviewed the whole system before it was ever pointed at real data. That review produced 19 findings.

## Finding 1: green checks are a floor, not a finish line

| Severity | Count | Nature of the findings |
| --- | --- | --- |
| Critical | 2 | Untrusted content rendered without sanitization; a local API trusting the network boundary instead of validating request origin |
| High | 10 | Data-integrity and state-machine defects, plus credential and logging hygiene |
| Medium | 7 | Scale limits, missing review affordances, and refresh gaps |

Every one of these existed in a codebase where all automated checks were green. The checks verified that the code did what it said; nobody had yet asked whether what it said was safe or correct under failure.

This is the single most transferable lesson. An autonomous worker optimizes for its acceptance criteria. If security invariants, failure semantics, and destructive-action safety are not in the contract, they will not be in the result, and no amount of passing tests will reveal that.

## Finding 2: the recurring defect patterns

The specific bugs were project-specific; the shapes were not. These are worth checking in any agent-built system that touches real data:

- **Untrusted content rendered directly.** Third-party content injected into the DOM without sanitization, with remote resources loading by default.
- **Trusting the network boundary.** Binding a service to loopback and assuming that is an authorization check, without validating request origin.
- **Transient errors treated as authoritative state.** A timeout or rate-limit response interpreted as "this record no longer exists", silently deleting local state. Only an explicit not-found response should mean absence; everything else must abort without advancing a sync cursor.
- **Local data not bound to its account.** No record of which account produced the local cache, so reconnecting a different account could reuse a stale index or apply queued changes to the wrong place.
- **Partial success recorded as failure.** A remote write succeeding but its verification read failing, marked as failed and made non-retryable, leaving the local audit trail and the remote system permanently inconsistent.
- **Long-running mutations neither resumable nor atomic.** A crash mid-operation leaving the batch stuck in an "applying" state with no recovery path.
- **A gap between review and apply.** New items arriving after the user approved a batch and before it executed, then being acted on without ever having been reviewed.
- **Secrets at default permissions, and sensitive values in logs.** Token files written with default modes; search terms and authorization codes landing in request logs that the project's own documentation claimed were private.
- **No anti-forgery state in the auth handshake.**
- **Silent truncation.** A view labelled as showing everything, capped by an undisclosed query limit.

## Finding 3: split remediation by theme, not by file

For feature work, splitting by file ownership is right. For remediation, group findings into themes that map to a subsystem, then give each theme to one worker.

Theme grouping gives each worker a coherent mental model. A worker holding all the state-machine findings can see that atomicity, resumability, and the review-to-apply gap are one problem, and fix them once rather than three times.

| Worker | Theme | Findings covered |
| --- | --- | --- |
| 1 | Render security | Untrusted content rendering |
| 2 | Sync fidelity | Error taxonomy, incomplete fetches, storage permissions, stale reference data |
| 3 | Action safety | Partial success, resumability, review-to-apply gap, cleanup, concurrency |
| 4 | Auth and API security | Origin validation, account binding, log hygiene, anti-forgery state, auth flow UX |
| 5 | Scale and UX | Pagination, review detail, refresh, missing controls |

Each worker got its own worktree and branch, ran under the manager's group, and none were permitted to push to the main branch.

## Finding 4: declare the integration order up front

Five branches touching an overlapping core will conflict if they all merge at once. The manager fixed a sequential integration order before launching, chosen so that each merge landed on top of the changes it was most likely to touch:

1. Sync fidelity
2. Auth and API security
3. Action safety
4. Scale and UX
5. Render security

The workers still ran fully in parallel. Only the merges were serialized, by the manager, one at a time, with the full verification suite after the final merge.

Deciding this at planning time rather than at merge time is what keeps parallel remediation from collapsing into one long rebase.

## Finding 5: high-risk work needs a gate above the merge gate

Merging is not the same as being safe to use. The review added an explicit go/no-go gate:

> Do not connect a real account until every critical and high finding is fixed and the integration review passes.

Then the first live run was staged rather than trusted in one shot:

1. Read-only sync.
2. Inspect the results.
3. One single-item action.
4. Verify the audit trail and undo.
5. Only then, a small batch.

This is the remediation equivalent of raising autonomy gradually. The system earns access to real data in steps.

## Finding 6: schedule follow-up workers, do not inline them

Two further pieces of work were identified during review: a local-only analytics view, and a dedicated integration-review pass covering the full suite plus security regressions.

Both were queued as follow-up workers rather than folded into the five remediation branches. Adding them would have widened each worker's scope and delayed the gate. Keeping a batch narrow is what makes it reviewable.

## Transferable checklist

Apply this whenever a worker has built something autonomously and it is about to touch real data:

- [ ] Run a manager review before first real-data use, independent of CI status
- [ ] Triage findings by severity, and record the counts
- [ ] Group findings into subsystem themes, one theme per worker
- [ ] Give each worker its own worktree and branch, with no permission to push to the main branch
- [ ] Decide the integration order before launching, not at merge time
- [ ] Merge sequentially, manager-owned, with full verification after the last merge
- [ ] Define an explicit go/no-go gate for the first high-risk use
- [ ] Stage the first live run from read-only through to a small batch
- [ ] Queue newly discovered work as follow-up workers instead of widening the current batch

## What to put in the next build contract

The cheapest fix for all of this is a better contract next time. Findings from a review should be fed back into the launch contract for future builders:

```text
Beyond the feature requirements, this build must:
- sanitize all third-party content before rendering, and block remote resources by default
- validate request origin explicitly; never treat a loopback bind as authorization
- distinguish "not found" from transient failure, and never advance a sync cursor on error
- bind local data to the account that produced it
- make every remote mutation resumable, atomic, and retryable after partial success
- re-check the reviewed set immediately before applying it
- write secrets with owner-only permissions and keep sensitive values out of logs
- state, in the README, exactly which of these are enforced and which are not
```

The final line matters most. A worker that is asked to document what it did not implement will usually tell you, and that list is the beginning of the next review.
