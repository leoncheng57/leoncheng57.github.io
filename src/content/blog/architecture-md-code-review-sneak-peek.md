---
title: "A Sneak Peek: Letting Each Folder Tell the Reviewer What Matters"
description: "A short teaser on giving an AI code reviewer a per-folder ARCHITECTURE.md, so it only speaks up when a change breaks a rule the code relies on."
publishedAt: "2026-10-18"
tags:
  - AI
  - code-review
  - engineering
---

# A Sneak Peek: Letting Each Folder Tell the Reviewer What Matters

Most AI code reviewers read a diff cold. They spot generic bugs well enough, but they don't know which rules a part of the codebase quietly depends on: the invariant other code assumes, or the one helper everyone is meant to call instead of rolling their own check. So the comment that matters lands in a long list, looking just like the nitpicks.

We've been trying something small. Next to the code that matters, a short ARCHITECTURE.md says in plain words how that area works and which rules other code relies on. Before the reviewer looks at a pull request, it finds the files that apply, reads them, and rates each changed snippet high or low risk against them. It stays quiet about low-risk changes. When a change breaks a written rule, it says which one and points at the line where the rule lives, and it flags when the doc itself has gone stale. Each finding gets its own thread reply, with the code right under it.

Early results are encouraging, with the caveat that it's only a handful of pull requests so far. It caught a rule break that a generic review had rated medium, and it raised a house-style nit that only someone who knew the rule would ask for. It also got faster: handing the reviewer the right context up front took reviews from timing out to about a minute. We're trialling it at small scale before rolling it out wider.

More details to come once it has a few more miles on it.

> Disclaimer: post 80% written by AI
