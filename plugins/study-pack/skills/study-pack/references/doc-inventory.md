# Document inventory

The tier template, one brief per document, and the Claude skill that generates
each. Scale to the target — a 1–2 PR change wants 8–14 documents, a large
multi-repo stack 25–35. **Drop, never pad.** A tier with nothing real to say is
a tier you delete.

Numbers are stable across packs so that "go read 08" means the same thing
everywhere. Skipping a number is fine and expected; renumbering is not.

## Why name the generating skill on every document

Three reasons, in order of how much they matter:

1. **Provenance.** A reader can see the lens a document was written through, and
   discount it accordingly. `judge-x-opposing-view` output should be read as
   advocacy; `teach-x-study-guide` output should not.
2. **Regeneration.** Any document can be rebuilt from the same sources by
   re-running the named skill. The pack is reproducible, not a one-off.
3. **Coverage.** Reading down the skill column shows at a glance whether the pack
   is all exposition and no recall — the commonest failure.

Use the skills the session actually has. The names below are from a personal
library and are a *shape*, not a dependency: substitute the local equivalent and
name whatever you actually used. If you wrote a document unaided, say `hand`.

## Tier 0 · Entry point

| # | File | Skill | Brief |
|---|---|---|---|
| — | `index.html` | `explain-x-outline` | Browser entry point. Reading-track filter, one card per document, tier grouping. |
| 00 | `00-README.md` | `explain-x-outline` | The same index in Markdown, for the editor and for grep. Includes the reading tracks and the PR table. |

The two must agree. Generate them from one list.

**Reading tracks** — three, always:

- **One hour** — the 4–6 documents that make someone useful in a meeting.
  Typically: explained-simply, exec summary, architecture, decision ledger,
  staleness.
- **Half a day** — the above plus the walkthroughs and the data model.
- **Everything** — in number order.

## Tier 1 · The feature

The main event. Depth here, brevity elsewhere.

| # | File | Skill | Brief |
|---|---|---|---|
| 01 | `01-exec-summary.md` | `explain-x-executive-summary` | What shipped, why it exists, what it deliberately does **not** do. One page. The non-goals are the load-bearing half. |
| 02 | `02-timeline.md` | `spec-x-timeline` | How the design arrived, from first commit to current head. Call out reversals explicitly — a decision that was made and then unmade teaches more than one that was right first time. |
| 03 | `03-architecture.md` + `.html` | `artifact-diagramming` | The moving parts and where they meet. Lead with the single fact that makes everything else legible. Hand-authored inline SVG in the HTML version. |
| 04… | `04-walkthrough-<path>.md` | `brick-by-brick-learning` | **One per distinct code path** (write path, read path, frontend, migration…). Every hop with `file:line`. This is where a reader converts "I have read about it" into "I could change it". |
| 07 | `07-data-model.md` | `brick-by-brick-learning` | Schema, indexes, constraints — every one as a *decision* with its reason, not as a column list. Include it only if the change has a persistence story. |
| 08 | `08-design-decisions.md` | `judge-x-compare-options` | The decision ledger: each call, the alternative that was rejected, and the stated reason. Mined from PR descriptions and review threads (Phase 2), not inferred from the code. |
| 09 | `09-doc-vs-code-divergence.md` | `teach-x-quiz` | **The exercise.** Where the design doc, the ticket or the PR description contradicts the shipped code. Posed as a problem, answered at the bottom. See below. |
| 10 | `10-local-vs-prhead.md` | `explain-x-summarize-as-table` | The staleness report from Phase 1. **Written first, always present**, even when nothing is stale. |

Use `NNb` suffixes (`06b`) for a short document that hangs off a longer one —
a gap, a caveat, a thing that is true but does not deserve its own number.

### 09 is the one to get right

Format each divergence as: *where the doc says X* → *where the code does Y* →
**the reader works out which is authoritative and why** → the answer, with the
evidence. Three good divergences beat ten trivial ones. If there is genuinely no
divergence, say so and drop the document rather than manufacturing one.

## Tier 2 · Surroundings

The subsystem the change lives in, and **one document per repo convention the
change actually exercises**. The test for inclusion is not "is this convention
important" — it is "did this change have to obey it". Teach each convention
*through this code's use of it*, so the example is already loaded.

| # | File | Skill | Brief |
|---|---|---|---|
| 11 | `11-<subsystem>.md` | `teach-x-study-guide` | The whole lifecycle of the subsystem this change sits inside. |
| 12… | `12-conventions-<name>.md` | `teach-x-study-guide` | One per convention: migrations, logging, auth, multi-tenancy, feature flags, whatever this change touched. |
| … | `NN-failure-isolation.md` | `teach-x-break-it-down` | If the change has error handling worth explaining: what fails open, what fails closed, and why the answer differs per guard. |

## Tier 3 · Repo orientation

For a reader new to the repo as a whole. Skip this tier entirely if the pack's
audience already works in the repo — say so in `00-README.md` rather than
writing thin versions.

| # | File | Skill | Brief |
|---|---|---|---|
| 17 | `17-repo-map.md` | `teach-x-study-guide` | Services, packages, workspaces, where things live. |
| 18 | `18-repo-conventions.md` | `teach-x-study-guide` | Typing, imports, logging, auth — the house style. |
| 19 | `19-ci-and-deploy.md` | `teach-x-study-guide` | How code gets tested and shipped. Call out any CI trap this change actually hit. |

## Tier 4 · Active recall and challenge

**Do not skip this tier to save effort.** Exposition without recall produces a
reader who recognises the material and cannot use it.

| # | File | Skill | Brief |
|---|---|---|---|
| 20 | `20-flashcards.md` + `.html` | `teach-x-flashcards` | Self-contained Q&A on the non-obvious. Each card must stand alone — no "it", no "the above". Roughly 2 cards per Tier-1 document. |
| 21 | `21-quiz.md` + `.html` | `teach-x-quiz` | Multiple choice, true/false, short answer, judgment. Every answer carries a full explanation; a distractor should be something a careful reader might actually believe. |
| 22 | `22-deep-questions.md` | `teach-x-deep-questions` | What a staff engineer would ask in review. **No answer key** — these are for thinking, not scoring. |
| 23 | `23-glossary.md` | `explain-x-jargon` | Every term this codebase uses in a non-obvious way. |
| 24 | `24-open-threads.md` | `spec-x-action-items` | **Unresolved items, with owners, kept visibly separate from settled design.** See below. |
| 25 | `25-explain-simply.md` | `teach-x-explain-simply` | The whole thing with no jargon. Often the right first read — link it as such. |
| 26 | `26-break-down-<hardest>.md` | `teach-x-break-it-down` | The single hardest concept, from foundations. Pick the one a smart reader will bounce off. |
| 27 | `27-steelman-against.md` | `judge-x-opposing-view` | The strongest case *against* this design, made persuasively, then answered. Reveals which parts of the design are load-bearing and which are habit. |
| 28 | `28-key-quotes.md` | `spec-x-quotes` | The load-bearing comments and docstrings. In a well-commented subsystem these *are* the design record. |
| 29 | `29-master-table.md` | `explain-x-summarize-as-table` | Every file × what it does × which PR. The cheat sheet to keep open in a second window. |

### 24 is the one that decays fastest

An open thread is anything not settled: an unvalidated assumption, a deferred
decision, a known gap, a review comment answered with "follow-up". Give each one
an owner and a status. Never fold one into Tier 1 prose as though it were
decided — a document that smooths over an unresolved question is worse than no
document, because it is confidently wrong in a way the reader cannot detect.

## Tier 5 · Optional

| # | File | Skill | Brief |
|---|---|---|---|
| 30 | `30-<memorable-title>.md` | `explain-x-dramatize` | One mnemonic retelling of the most memorable incident in the stack's history. Explicitly skippable, and labelled as such. Include it only if there is a real story. |

## Header block

Every document opens with one, carrying the generating skill, the tier, the
reading estimate, and the ref:

```markdown
# 07 · The data model

> **Skill:** `brick-by-brick-learning` · **Tier 1** · ~10 min
> Written against `b0e1c3ca0` (mono). Re-verify before relying on it — see
> [`10-local-vs-prhead.md`](10-local-vs-prhead.md).
```
