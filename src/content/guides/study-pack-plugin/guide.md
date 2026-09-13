---
title: "Study Packs: Turning a PR Stack into Onboarding Material"
description: "A Claude Code plugin that reads a set of related PRs at their heads — never your working tree — and emits a tiered set of documents, flashcards and a quiz for someone seeing the codebase for the first time."
updatedAt: "2026-09-12"
publishedAt: "2026-09-12"
audience: "For engineers who have to bring someone up to speed on a feature that landed across several PRs, and who have been burned by documentation that described the wrong version of the code."
repoUrl: "https://github.com/leoncheng57/leoncheng57.github.io/tree/main/plugins/study-pack"
repoAccess: "public"
repoScope: "this-site"
tags:
  - claude-code
  - plugins
  - onboarding
---

# Study Packs: Turning a PR Stack into Onboarding Material

A feature ships as four pull requests across two repositories. Someone joins in
three months and asks how it works. The design doc is stale, the PR descriptions
are the only place the rejected alternatives were ever written down, and the
person who built it has moved teams.

`study-pack` is a [Claude Code](https://code.claude.com/docs) plugin for exactly
that moment. Point it at the PRs and it produces a numbered set of Markdown
documents plus a few interactive HTML pages — an architecture diagram, flashcards,
a self-scoring quiz — fronted by a browser index and served locally in a paper
theme.

```text
  PR urls / ticket id / branch
              │
              ▼
  ┌─────────────────────────────┐
  │  1. staleness gate          │  local branch vs PR head
  │  2. mine PRs + commits      │  rationale lives here, not in code
  │  3. read at the PR head     │  gh api ...?ref=<sha>
  │  4. hunt doc/code drift     │  becomes an exercise
  └─────────────────────────────┘
              │
              ▼
  index.html · 8-35 documents · flashcards · quiz
```

## The output is not the point

Generating documents is the easy half, and on its own it is worth very little.
The plugin exists to encode four judgments that were expensive to arrive at and
easy to lose:

1. **Never trust the working tree.** Check every local branch against its PR head
   before reading a line, and read source at the head.
2. **Mine the PR descriptions and the commit trail before the code.** Code records
   *what*. It almost never records *why*, and never records *what was rejected*.
3. **Turn design-doc ↔ code divergence into an exercise** rather than a bullet list.
4. **Keep open threads visibly separate from settled design.** A document that
   smooths over an unresolved question is worse than no document.

Item 1 is not a hypothetical. The run this plugin was extracted from found every
local branch behind its PR, one repository sitting on an unrelated branch
entirely, and six load-bearing facts that differed between the tree and the head
— nullability, index count, timestamp semantics, a window computation, a dead
predicate and a function signature. Two of three research agents read the working
tree and described the superseded design confidently and in detail.

Nothing in their output was wrong *about the files they read*.

## Install

```bash
/plugin marketplace add leoncheng57/leoncheng57.github.io
/plugin install study-pack@leoncheng
```

Then either invoke it directly:

```text
/study-pack:study-pack ENG-412
/study-pack:study-pack https://github.com/owner/repo/pull/123
```

or just say what you want — it auto-triggers on phrasings like *"help me really
understand this PR stack"*.

It needs `gh` authenticated against the repositories you point it at, `git`, and
`python3` from the standard library. Nothing to `pip install`.

## What the chapters cover

The four judgments first, because they are the transferable part — they are worth
reading even if you never install anything. Then the shape of the output, the
HTML layer, and the mechanics.
