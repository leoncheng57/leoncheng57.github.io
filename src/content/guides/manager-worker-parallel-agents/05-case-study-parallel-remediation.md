---
title: "Case study: parallel remediation after a manager review"
description: "What a manager review found in an autonomously built MVP, and how the fixes were split across workers with an explicit integration order and a go-live gate."
part: "Beyond the Basics"
---

# Case study: parallel remediation after a manager review

The other common shape: a worker builds something end to end, the manager reviews it, and the findings become the next batch.

Subject: a local-first client syncing third-party API data, built autonomously across five commits, all checks green. The manager's review before real data — found 19 issues.

## Green checks are a floor, not a finish line

| Severity | Count | Nature |
| --- | --- | --- |
| Critical | 2 | Unsanitized rendering; a loopback API trusting the network instead of validating origin |
| High | 10 | State-machine defects, credential and logging hygiene |
| Medium | 7 | Scale limits, missing affordances, refresh gaps |

Checks verify the code does what it says, not whether that's safe. Omit failure semantics from the contract, and they won't be in the result.

## Recurring defect shapes

Check for these in any agent-built system touching real data:


- Untrusted content rendered unsanitized, remote resources loading by default
- A loopback bind mistaken for an authorization check
- Transient errors treated as "record no longer exists," silently deleting local state
- Local data not bound to the account that produced it
- Partial success (write ok, verify failed) marked non-retryable forever
- Mutations that are neither resumable nor atomic after a crash
- A gap between review and apply where new items skip review
- Secrets at default permissions, sensitive values in logs
- No anti-forgery state in the auth handshake
- Silent truncation behind an undisclosed query limit

## Split by theme, not by file

Group findings into themes mapping to a subsystem; one theme per worker.

| Worker | Theme | Findings |
| --- | --- | --- |
| 1 | Render security | Unsanitized rendering |
| 2 | Sync fidelity | Errors, incomplete fetches, permissions, stale refs |
| 3 | Action safety | Partial success, resumability, review gap, concurrency |
| 4 | Auth/API security | Origin validation, account binding, logs, anti-forgery |
| 5 | Scale & UX | Pagination, review detail, refresh, controls |

Own worktree and branch per worker, under the manager's group; none could push to `main`.

## Declare the integration order up front

Five branches touching an overlapping core conflict if merged at once. Workers ran fully in parallel — only the merges were serialized by the manager, one at a time, full verification after the last.

```text
sync -> auth -> action -> scale -> render -> [verify all]
```

## A gate above the merge gate

> No real account until every critical/high finding is fixed and integration review passes.

The first live run was staged: read-only sync, inspect, one single-item action, verify audit/undo, then a small batch — autonomy earned in steps.

## Schedule follow-ups, don't inline them

Two more items surfaced during review — a local-only analytics view, a dedicated integration-review pass. Both queued as follow-up workers instead of widening the current five. A narrow batch stays reviewable.

## Transferable checklist

- [ ] Manager review before first real-data use, independent of CI status
- [ ] Findings triaged by severity, counts recorded
- [ ] Grouped by subsystem theme, one theme per worker
- [ ] No worker permission to push to `main`
- [ ] Integration order decided before launch, not at merge time
- [ ] Sequential merge, full verification after the last
- [ ] Explicit go/no-go gate for first high-risk use
- [ ] Staged first live run, read-only through small batch
- [ ] New findings queued as follow-up workers, not scope creep

## Feed it back into the next contract

```text
Beyond the feature requirements, this build must:
- sanitize third-party content; block remote resources by default
- validate request origin; never treat a loopback bind as authorization
- distinguish "not found" from transient failure
- bind local data to the account that produced it
- make every remote mutation resumable, atomic, retryable
- re-check the reviewed set immediately before applying it
- keep secrets owner-only and out of logs
- state in the README what is and isn't enforced
```

A worker asked to document what it didn't implement usually will — that list starts the next review.
