---
title: "What a pack contains"
description: "The tier template, why documents are numbered, and why padding is the main failure mode."
part: "The Output"
---

# What a pack contains

Documents are grouped into tiers by **who needs them**, not by topic.

| Tier | Contents |
|---|---|
| **0** | `index.html` + `00-README.md` — the same index twice, for the browser and for grep |
| **1** | The change itself: exec summary, timeline, architecture, one walkthrough per code path, data model, the decision ledger, the divergence exercise, the staleness report |
| **2** | Surroundings: the subsystem it lives in, plus one document per repo convention the change *had to obey* |
| **3** | Repo orientation: map, house conventions, CI and deploy |
| **4** | Active recall: flashcards, quiz, deep questions, glossary, open threads, ELI5, the hardest concept from foundations, the case against, key quotes, master table |
| **5** | Optional / mnemonic |

## Numbers are stable across packs

`08` is the decision ledger in every pack that has one. Skipping a number is
expected; renumbering is not. "Go read 08" should mean the same thing to someone
who has read a different pack.

## Scale to the target, and drop rather than pad

A 1–2 PR change wants 8–14 documents. A large multi-repo stack wants 25–35.

**Padding is the main failure mode.** The template lists six tiers, and the pull
to fill all six is strong. Resist it: a tier with nothing real to say produces
documents that say nothing, and their presence makes the real ones harder to
find. Tier 3 in particular should be dropped outright when the audience already
works in the repo — and the README should say so, rather than shipping thin
versions.

## Two documents worth calling out

**`16`-style failure isolation.** If the change has error handling worth
explaining, what fails open, what fails closed, and *why the answer differs per
guard* is usually the most interesting thing in the whole change.

**`27-steelman-against.md`.** The strongest case against the design, made
persuasively, then answered. This reveals which parts of the design are
load-bearing and which are habit — and it is the document most likely to change
the mind of the person who wrote the code.

## Provenance on every document

Each one carries a header naming the generating skill, its tier, a reading
estimate, and the ref:

```markdown
# 07 · The data model

> **Skill:** `brick-by-brick-learning` · **Tier 1** · ~10 min
> Written against `b0e1c3ca0`. Re-verify before relying on it — see
> [`10-local-vs-prhead.md`](10-local-vs-prhead.md).
```

Naming the skill does three things: it tells the reader the lens (output from an
opposing-view skill should be read as advocacy), it makes any single document
regenerable from the same sources, and — reading down the skill column — it shows
at a glance whether the pack is all exposition and no recall, which is the
commonest structural failure.
