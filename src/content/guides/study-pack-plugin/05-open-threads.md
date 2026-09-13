---
title: "Keep open threads separate"
description: "A document that smooths over an unresolved question is worse than no document."
part: "The Judgments"
---

# Keep open threads separate

The last judgment is the cheapest to implement and the easiest to skip.

Every pack has a `24-open-threads.md`, and nothing unresolved is allowed anywhere
else. Not in the exec summary, not in the architecture doc, not softened into a
subordinate clause in a walkthrough.

## Why it matters more than it looks

A document that quietly presents an unsettled question as settled is not merely
incomplete — it is **confidently wrong in a way the reader cannot detect**. They
have no signal that this particular sentence is load-bearing-but-unverified,
because it reads exactly like the sentences around it that are solid.

That is worse than no document at all. Without the document they would have asked
someone.

## What counts as an open thread

- an unvalidated assumption ("we assume the 30-day window is right; nobody ran the
  experiment")
- a deferred decision
- a known gap with no ticket
- any review comment answered with "follow-up"
- a question the PR itself asked and merged without an answer

That last category is the one worth hunting for. A PR that says *"wanted before
merge: a yes/no from whoever owns X"* and then merges without one has left a live
question with no owner — and it will not surface again on its own.

## Give every thread an owner and a status

| # | Thread | Owner | Status |
|---|---|---|---|
| 1 | Is the evidence heuristic tight enough? | owner of the publish surface | **Asked before merge. Merged without an answer.** |
| 7 | Audited backfill for ambiguous history | — | **No ticket.** Named in the PR; nobody owns it. |

An unowned thread decays faster than a ticketed one, because nothing reminds
anyone it exists. Writing "— / no ticket" in the owner column is doing real work:
it converts an invisible gap into a visible one.

Date the document and say how to re-check it. Threads settle; the document does
not know that they have.
