---
title: "Never trust the working tree"
description: "Why the first step is a staleness check, and why the fix is not to fetch."
part: "The Judgments"
---

# Never trust the working tree

This is the judgment the whole plugin is built around, and the one most likely to
save you from publishing something confidently wrong.

## The failure

You have the branch checked out. You read the files. You write it up. Everything
you wrote is an accurate description of code that will never run, because review
replaced it two rounds ago and your local ref is behind the PR head.

It fails **silently**. Nothing errors. Nothing looks wrong. The output is
detailed, internally consistent, and useless.

On the run this plugin came from, *every* local branch was behind its PR, one
repository was on an unrelated branch entirely, and six load-bearing facts
differed between tree and head. Two of three research agents read the tree and
reported the superseded design in convincing detail.

## The gate

Before anything else:

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/pr_head_check.sh acme/webapp 4821 4822 4823
```

Per PR: the head branch, the PR head SHA, the local SHA of that branch, and a
verdict. It exits non-zero if anything is stale, missing or unreadable.

```text
PR        BRANCH                          PR-HEAD      LOCAL        VERDICT
--------  ------------------------------  -----------  -----------  -------
#4821     alex/eng-412-emit-events        e4d7d0739    feddda242    STALE — PR head not in local objects
#4822     alex/eng-412-add-table          9fb30a39c    226bf54f0    STALE — local is 3 behind / 0 ahead
#4823     alex/eng-412-rank-by-usage      b0e1c3ca0    b0e1c3ca0    current
```

Four verdicts, and each means something different. `MISSING` means the branch was
never fetched. `STALE — PR head not in local objects` means the head exists but
you have never pulled it, so the distance is not computable locally — and
computing it would mean fetching, which is the one thing this check must not do.

## Reading at the head

```bash
gh api "repos/<o>/<r>/contents/<path>?ref=<sha>" --jq '.content' | base64 -d
gh api "repos/<o>/<r>/git/trees/<sha>?recursive=1" --jq '.tree[].path'
gh pr diff <n> --repo <o>/<r>
```

No fetch, no checkout, no stash.

## The part people get wrong

The instinct on seeing a stale branch is to fetch and check out. **Don't.** The
working tree is the user's: they may have uncommitted work, a deliberate
checkout, or a half-finished rebase. The workflow is designed to need nothing
from it, and "I left your repository exactly as I found it" is a property worth
keeping.

The pack's `10-local-vs-prhead.md` is written **first**, before any other
document, and is present even when nothing is stale — because *"verified current
at this SHA on this date"* is a fact with a shelf life, and next week it will not
be true.

> **A code reading is only as current as the ref it was taken against. State the
> ref. An unstated ref is an unverifiable claim.**

Which is why every document in a pack names its ref in the header.

## When you delegate

If you fan work out to subagents, the prohibition has to travel with the brief,
in about these words:

> Read source at `<sha>` via `gh api "repos/<owner>/<repo>/contents/<path>?ref=<sha>"`.
> The local working tree is stale — do not read it, do not fetch, do not check out.
> Report file paths with line numbers and name the ref in your findings.

Then cross-check what comes back against the diff before it enters a document.
This is not belt-and-braces; it is the step that catches the failure above.
