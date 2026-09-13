---
title: "Mine the narrative before the code"
description: "Rationale, rejected alternatives and review reversals live in the PR, not the diff."
part: "The Judgments"
---

# Mine the narrative before the code

The instinct is to open the diff. Resist it for twenty minutes.

Code records **what**. It occasionally records **why**, in a comment. It
essentially never records **what was considered and rejected** — and that is the
information a new maintainer needs most, because without it they will propose the
rejected design in their first week and nobody will remember why it was rejected.

## The order, and why it is an order

```bash
gh pr view <n> --repo <o>/<r> \
  --json title,body,state,headRefOid,baseRefName,files,commits,reviews,comments
```

1. **The description**, including collapsed `<details>` blocks. That is where
   provenance, rejected alternatives and review-change logs hide. A good PR
   description is often the only design document that was ever kept current.
2. **Review threads.** A reversal is the most instructive artefact in a pull
   request: it records a design that was plausible enough to write and wrong
   enough to undo. Nobody writes that down anywhere else.
3. **The commit trail.** `gh pr view <n> --json commits`. Commit order shows the
   design *arriving*; the squashed diff shows only where it landed. "Commit 3
   replaced inference with proof" is a sentence you can only write from the trail.
4. **Linked design docs and tickets.** Note which version you read — the next
   judgment needs it.

Each step changes what you look for in the next. Read the review threads first
and you will notice things in the commit trail you would otherwise skim past.

## Two traps

**Trusting the description over the diff.** Descriptions are written early. A PR
description can be stale inside its own PR. Check the final diff before repeating
a claim from the body.

**Going straight to the code.** The decision ledger — which is consistently one
of the two or three documents people actually return to — is *unwritable* from
code alone. If you skip this phase, that document either does not exist or, worse,
is full of plausible reconstructions of reasoning that nobody ever had.

## What it produces

`08-design-decisions.md`: a table of every call, the alternative that was
rejected, and the **stated** reason. Stated, not inferred. If the PR does not say
why, the ledger says "no stated reason" rather than inventing one — an admitted
gap is useful, a fabricated rationale is a landmine.
