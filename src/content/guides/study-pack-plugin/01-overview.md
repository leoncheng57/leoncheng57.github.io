---
title: "Overview"
description: "What a study pack is, when it beats reading the diff, and when it is overkill."
part: "Start Here"
---

# Overview

A **study pack** is a folder of numbered Markdown documents plus a few
interactive HTML pages, written for someone who has never read the codebase and
has to understand one feature well enough to change it.

It is not a summary of the diff. A diff tells you what bytes moved. A study pack
tries to answer the questions that make those bytes make sense: why this design
and not the obvious alternative, what review reversed, what is still unsettled,
and which of the things you might read are no longer true.

## What you get

For a change of moderate size, roughly:

```text
study/<slug>/
├── index.html                    browser entry, filters by reading track
├── 00-README.md                  the same index, for the editor and for grep
├── 01-exec-summary.md            what shipped, and what it deliberately doesn't do
├── 02-timeline.md                how the design arrived; what review reversed
├── 03-architecture.md + .html    the moving parts, with hand-drawn SVG
├── 04..06-walkthrough-*.md       one per code path, every hop with file:line
├── 08-design-decisions.md        the ledger: each call + its rejected alternative
├── 09-doc-vs-code-divergence.md  the exercise
├── 10-local-vs-prhead.md         what in your checkout is lying to you
├── 12..16-conventions-*.md       the repo conventions this change had to obey
├── 20-flashcards.md + .html      click to flip, shuffle, mark known
├── 21-quiz.md + .html            self-scoring, every answer explained
└── 24-open-threads.md            unresolved, with owners
```

Every document names the ref it was written against and the Claude skill that
generated it. Both matter — the first because a code reading is only as current
as its ref, the second because it tells you the lens the document was written
through and lets you regenerate any single file.

## Reading tracks

A pack that only works if you read all of it does not get read. `index.html`
filters to three depths:

| Track | Roughly | Who |
|---|---|---|
| **One hour** | 4–6 documents | you are in a meeting about this tomorrow |
| **Half a day** | plus the walkthroughs and data model | you are reviewing or extending it |
| **Everything** | in number order | you are taking ownership |

## When it is overkill

A one-file bug fix does not need this. The workflow earns its cost when at least
one of these is true:

- the change spans **several PRs**, especially across repositories
- the PR descriptions carry design rationale that exists nowhere else
- there is a **design doc** that may or may not still match the code
- the people who will maintain it were not in the review

If none of those hold, read the diff.
