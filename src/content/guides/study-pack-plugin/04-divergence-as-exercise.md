---
title: "Turn divergence into an exercise"
description: "Where the design doc contradicts the code is the best teaching material in the pack."
part: "The Judgments"
---

# Turn divergence into an exercise

Two diffs worth doing by hand:

- **Design doc vs shipped code.** The doc was written before review; the code is
  what survived it. Every gap is a decision that changed, and a reason to find out
  why.
- **PR description vs its own final diff.** Same logic, shorter window.

On the originating run, the design doc contradicted the code in three places.
Writing those up produced the single best document in the pack.

## Why an exercise and not a list

A list of discrepancies gets skimmed and forgotten. The same content posed as a
problem gets *worked*, and working it is the point — because the skill being
transferred is not "these three facts are wrong in the doc". It is **how to
decide which of two sources is authoritative**, which is the thing a new
maintainer will need on their own, next month, about a doc nobody has flagged.

The format:

```markdown
### 2 · The window

**The design doc says** the 30-day window is enforced by a retention job that
prunes rows older than 30 days.

**The code** has no pruning anywhere. `aresolve(...)` applies the window as a
query predicate.

**Which is authoritative, and why?** Work it out before reading on.

<details><summary>Answer</summary>

The code. The doc describes a design that was proposed and dropped in review
(commit `a254885`) ... correctness never depends on pruning having happened.

</details>
```

## Do not manufacture it

If the doc and the code agree, **drop the document**. A padded divergence
exercise costs the pack its credibility on the one document that most needs it —
and a reader who works a fake discrepancy and finds it trivial will not work the
next one.

Three good divergences beat ten trivial ones.
