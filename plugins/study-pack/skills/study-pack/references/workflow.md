# The workflow, in full

The phases from `SKILL.md`, with the commands and — more usefully — the failure
mode each phase exists to prevent. Read this when a phase is not going to plan;
`SKILL.md` alone is enough for the happy path.

---

## Phase 0 · Resolve the target and the destination

### Finding the PRs

```bash
# from a ticket id
gh search prs "ENG-412" --json url,title,repository,state --limit 30

# from a branch
gh pr list --head alex/eng-412-rank-by-usage --state all \
  --json number,url,title,repository

# your own recent work, when the user has nothing specific in mind
gh pr list --author @me --state all --limit 20 --json number,title,url,repository
```

**Failure mode: a stack that spans repos, found one repo at a time.** Backend and
frontend PRs are often in different repositories, opened days apart, with branch
names that do not match the ticket slug. Ask explicitly. A pack that covers three
of four PRs reads as though the fourth does not exist — which is worse than one
that admits it is partial.

**Failure mode: the branch name is not the ticket slug.** Trackers generate a
suggested branch name; people rename. Resolve the branch from the *PR*
(`headRefName`), never from the ticket.

### Choosing the destination

```bash
git -C <repo> check-ignore -q .claude/study/ \
  && echo "ignored — safe to write here" \
  || echo "TRACKED — would dirty git status"
```

Three options, offered in order: the gitignored in-repo path, the session
scratchpad, or a path the user names. Ask; do not assume.

**Failure mode: a 30-file pack committed by accident.** A study pack is generated
material. It goes stale the moment the branch moves, and it is not reviewable.
Writing into a tracked path without saying so is how it ends up in a PR.

---

## Phase 1 · The staleness gate

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/pr_head_check.sh acme/webapp 4821 4822 4823
```

Per PR: the head branch name, the PR head SHA, the local SHA of that branch (or
`MISSING`), and how far apart they are. Exit 0 only when every branch is present
and current.

Reading at a ref, without touching the working tree:

```bash
# one file
gh api "repos/<o>/<r>/contents/<path>?ref=<sha>" --jq '.content' | base64 -d

# the whole tree, to find paths
gh api "repos/<o>/<r>/git/trees/<sha>?recursive=1" --jq '.tree[].path'

# the diff
gh pr diff <n> --repo <o>/<r>

# what changed, file by file
gh pr view <n> --repo <o>/<r> --json files --jq '.files[].path'
```

**Failure mode — the one this whole plugin exists for:** reading the working tree
and learning a version of the design that review already replaced. It fails
silently. Nothing errors, nothing looks wrong, and the resulting documents are
detailed, confident and describe code that will never run. On the stack this
workflow came from, *every* local branch was behind its PR head, one repo was on
an unrelated branch entirely, and six load-bearing facts differed — nullability,
index count, timestamp semantics, the window computation, a dead predicate, and a
function signature.

**Do not "fix" staleness by fetching.** The user's working tree is theirs; they
may have uncommitted work, a deliberate checkout, or a half-finished rebase. The
workflow is designed to need nothing from it.

`10-local-vs-prhead.md` is written **first**, before any other document, and is
present even when everything is current — "verified current as of `<date>` at
`<sha>`" is a fact worth recording, and next week it will not be true.

---

## Phase 2 · Mine the narrative

```bash
gh pr view <n> --repo <o>/<r> \
  --json title,body,state,headRefOid,baseRefName,files,commits,reviews,comments
```

Read in this order, because each changes what you look for in the next:

1. **The description.** Including collapsed `<details>` blocks — that is where
   provenance, rejected alternatives and review-change logs are usually hidden.
2. **Review threads.** A reversal is the most instructive artefact in a PR: it
   records a design that was plausible enough to ship and wrong enough to undo.
3. **The commit trail.** `gh pr view <n> --json commits`. Commit order shows the
   design arriving; the squashed diff shows only where it landed.
4. **Linked design docs, tickets, RFCs.** Note which version you read — Phase 4
   needs it.

**Failure mode: going straight to the code.** Code records *what*, almost never
*why*, and never *what was considered and rejected*. The decision ledger (08) is
unwritable from code alone, and it is one of the two or three documents people
actually come back to.

**Failure mode: trusting the description over the diff.** Descriptions are
written early. Check the final diff before repeating a claim from the body — a PR
description can be stale inside its own PR.

---

## Phase 3 · Fan out

One Explore agent per concern, dispatched in parallel. Every brief carries the
ref and the prohibition:

> Read source at `<sha>` via
> `gh api "repos/<owner>/<repo>/contents/<path>?ref=<sha>" --jq '.content' | base64 -d`.
> The local working tree is stale — do not read it, do not fetch, do not check
> out, do not stash. Report file paths with line numbers and name the ref in your
> findings.

Then **cross-check every claim against the diff** before it enters a document.

**Failure mode: an agent silently reads the working tree.** This is not
hypothetical — two of three agents did exactly that on the originating run,
despite the tree being stale, and reported the superseded design in convincing
detail. Nothing in their output was wrong *about the files they read*. The only
defence is the explicit prohibition plus the cross-check.

**Failure mode: agents that overlap.** Split by concern (backend / data / frontend
/ tests / CI), not by file count. Two agents on the same subsystem produce two
accounts you then have to reconcile, and the reconciliation is where errors get
laundered into confidence.

---

## Phase 4 · Find the divergences

Two diffs worth doing by hand:

- **Design doc vs shipped code.** The doc is written before review; the code is
  what survived it. Every gap is a decision that changed and a reason to find out
  why.
- **PR description vs the PR's own final diff.** Same reasoning, shorter window.

Each divergence becomes an exercise in `09-doc-vs-code-divergence.md`: where the
doc says X, where the code does Y, the reader works out which is authoritative
and why, then the answer with the evidence.

**Failure mode: writing 09 as a list of discrepancies.** A list is skimmed and
forgotten. Posed as a problem, it is the document people report learning the most
from — because working out *which source is authoritative* is exactly the skill
the pack is trying to transfer.

**Failure mode: manufacturing divergence.** If the doc and the code agree, drop
the document. A padded 09 costs the pack its credibility on the one document that
most needs it.

---

## Phase 5 · Write the pack

Structure, briefs and generating skills: `doc-inventory.md`.

Every document: numbered filename, header block naming skill / tier / reading
estimate / ref, `file:line` citations, relative links to siblings.

**Failure mode: padding to hit a number.** The originating pack had 33 documents
because that stack had 33 documents' worth of material. A 1–2 PR change has 8–14.
Filling a tier because the template lists it produces documents that say nothing,
and their presence makes the real ones harder to find.

**Failure mode: burying the open threads.** Unresolved items go in 24, marked as
unresolved, with owners. Never smoothed into Tier 1 prose as settled design.

---

## Phase 6 · The HTML layer

Copy the four assets, fill the `{{PLACEHOLDER}}` slots, keep the structure.
Conventions in `html-templates.md`, palette in `paper-theme.css`.

Verify before handing over:

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/check_links.sh <pack-dir>
```

**Failure mode: an index listing documents that were planned and never written.**
The `DOCS` array is easy to write from the inventory and forget to prune. Every
entry must correspond to a file on disk.

---

## Phase 7 · Serve it

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/serve_study.py <pack-dir> --port 8899
```

Stdlib only. Renders `.md` in the same paper theme so links navigate;
`?raw=1` gives the source. Tell the user the URL and that Ctrl-C stops it.

Last step, always:

```bash
git -C <target-repo> status --porcelain
```

Empty, or exactly what it was before. The workflow reads at refs precisely so
this holds.
