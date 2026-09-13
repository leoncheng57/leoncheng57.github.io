---
name: study-pack
description: 'Generate a tiered study pack that explains a PR stack or feature to someone reading the codebase for the first time — read at PR heads, never the working tree. Use for "help me really understand this code", "study pack", "onboard me to this PR stack", "explain this feature end to end", "make me study material for these PRs".'
argument-hint: "[ticket-id | PR urls | branch | nothing]"
---

# Study Pack

Turn a set of related PRs into onboarding material for someone who has never
read this codebase: a numbered set of Markdown documents plus a few interactive
HTML pages, fronted by a browser index and served locally in a paper theme.

The output is not the point. **Four judgments are the point**, and a pack that
skips them is worse than no pack:

1. **Never trust the working tree.** Check every local branch against its PR head
   before reading a single line. This is Phase 1 and it is not optional.
2. **Mine the PR descriptions and commit trail before reading code.** They carry
   design rationale, rejected alternatives and review history that no amount of
   code reading recovers.
3. **Hunt for doc↔code divergence** and turn what you find into an exercise.
4. **Keep open threads visibly separate from settled design.** A document that
   quietly smooths over an unresolved question is worse than no document.

## Phase 0 · Resolve the target and the destination

**Identify the PRs.** From the argument, in whatever form it arrives:

| Argument | How to resolve |
|---|---|
| A ticket id (`ENG-412`, `PROJ-88`) | Search PR titles and bodies: `gh search prs "ENG-412" --json url,title,repository`. Check the tracker too if a connector is available. |
| PR URLs or `owner/repo#n` | Use directly. |
| A branch name | `gh pr list --head <branch> --state all --json number,url,repository` |
| Nothing | Ask. Offer `gh pr list --author @me --state all --limit 20` as a starting point. |

A stack usually spans **more than one repo**. Ask explicitly whether there is a
frontend or sibling-service PR before concluding the set is complete — a pack
that covers three of four PRs reads as if the fourth does not exist.

**Ask where the pack should be written.** Offer, in this order:

1. `<repo>/.claude/study/<slug>/` — the natural home, **but only if it is
   gitignored**. Check before proposing it:
   ```bash
   git check-ignore -q .claude/study/ && echo "ignored — safe" || echo "TRACKED — would dirty git status"
   ```
2. The session scratchpad — nothing to clean up, but it does not survive.
3. Anywhere the user names.

Never write into a tracked path without saying so. The pack must leave
`git status` in the target repo exactly as it found it.

Pick a short kebab-case `<slug>` (the feature name, not the ticket id) and use it
for the directory and for every `localStorage` key in the HTML pages.

## Phase 1 · The staleness gate — mandatory, before any code is read

Run the check:

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/pr_head_check.sh <owner/repo> <pr> [<pr> ...]
```

once per repo in the stack. It prints, per PR, the PR head SHA against the local
SHA of that PR's head branch, and exits non-zero if anything is stale or missing.

**Whatever it says, read source at the PR head:**

```bash
gh api "repos/<owner>/<repo>/contents/<path>?ref=<sha>" --jq '.content' | base64 -d
gh pr diff <n> --repo <owner>/<repo>
gh api "repos/<owner>/<repo>/git/trees/<sha>?recursive=1" --jq '.tree[].path'
```

Do **not** fetch, check out, stash, or otherwise touch the working tree to make
the trees agree. Leaving it alone is the whole point.

Write `10-local-vs-prhead.md` now, first, before any other document. It carries:
the per-branch SHA table, a *What actually differs* table naming each load-bearing
fact that changed, the `gh api …?ref=` recipe, and a re-check snippet the reader
can paste in later. If nothing is stale, say so plainly and keep the document —
"verified current as of `<date>` at `<sha>`" is itself worth recording.

**Every document in the pack names the ref it was written against, in its header.**
An unstated ref is an unverifiable claim.

## Phase 2 · Mine the narrative before the code

In order, because each one changes what you look for in the next:

1. **PR descriptions** — `gh pr view <n> --repo <o/r> --json title,body,files,reviews,comments`.
   Read the whole body including collapsed `<details>` blocks; that is where
   rejected alternatives usually hide.
2. **Review threads** — what changed between rounds, and why. A reversal is the
   most instructive thing in a PR.
3. **The commit trail** — `gh pr view <n> --json commits`. Commit order shows the
   design arriving; a squashed diff shows only where it landed.
4. **Linked design docs, tickets, RFCs.** Note the version you read. These are the
   likeliest source of divergence, which is exactly what Phase 4 wants.

## Phase 3 · Fan out

Dispatch Explore agents in parallel — one per concern (backend, data model,
frontend, tests, CI, whatever the change actually spans).

**Every agent's brief must carry the ref and the prohibition**, in these words or
close to them:

> Read source at `<sha>` via `gh api "repos/<owner>/<repo>/contents/<path>?ref=<sha>"`.
> The local working tree is stale — do not read it, do not fetch, do not check out.
> Report file paths with line numbers and name the ref in your findings.

This is not belt-and-braces. On the run this workflow came from, two of three
agents read the working tree and reported the superseded design confidently and
in detail — nothing in their output was wrong about the files they read.

Cross-check agent claims against the diff before they enter a document.

## Phase 4 · Find the divergences

Diff the design doc against the shipped code and list every contradiction.
Diff the PR description against its own final diff — descriptions are written
early and go stale inside their own PR.

Each divergence becomes an item in `09-doc-vs-code-divergence.md`, written as an
**exercise**: state where the doc and the code disagree, make the reader work out
which is authoritative and why, then give the answer. This document is
consistently the best one in a pack. Do not downgrade it to a bullet list of
discrepancies.

## Phase 5 · Write the pack

The tier template, the per-document brief, and which Claude skill generates each
document are in `references/doc-inventory.md`. Read it before writing.

Scale to the target: a 1–2 PR change wants 8–14 documents, a large stack 25–35.
**Never pad.** A tier with nothing real to say is dropped, not filled.

Conventions every document follows:

- Numbered filename, `NN-kebab-name.md`, numbers matching the inventory.
- A header line naming the generating skill, the tier, and the reading estimate:

  ```markdown
  > **Skill:** `teach-x-study-guide` · **Tier 2** · ~7 min
  ```
- The ref it was written against.
- `file:line` citations for every code claim.
- Links to sibling documents by relative filename, so they resolve both in an
  editor and through the server.

## Phase 6 · The HTML layer

Copy from `${CLAUDE_PLUGIN_ROOT}/skills/study-pack/assets/` and fill in the
`{{PLACEHOLDER}}` slots — do not write these from scratch:

| Asset | Becomes | Notes |
|---|---|---|
| `index.html` | `index.html` | Browser entry point. Reading-track filter. One `DOCS` entry per document that **actually exists**. |
| `diagram.html` | `03-architecture.html` | Hand-authored inline SVG. No library. |
| `flashcards.html` | `20-flashcards.html` | Same cards as the `.md`, click to flip. |
| `quiz.html` | `21-quiz.html` | Same questions as the `.md`, self-scoring. |

Conventions, the SVG rules, and the palette: `references/html-templates.md` and
`references/paper-theme.css`. The theme is light-only by decision — do not add a
dark mode.

Then verify, before telling the user it is ready:

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/check_links.sh <pack-dir>
```

It walks every link position in every document — `index.html`'s `DOCS` array
included — and exits non-zero on the first dangling target. Matching only link
positions is the point: a looser grep over the whole file also "finds"
`.pill.html` in the CSS and `d.html` in the JS.

## Phase 7 · Serve it

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/serve_study.py <pack-dir> --port 8899
```

Renders `.md` to HTML in the same paper theme so links navigate in a browser;
`?raw=1` on any document gives the source. Stdlib only, no install. Tell the user
the URL and that Ctrl-C stops it.

Finally, confirm `git status` in the target repo is unchanged.

## Reference files

- `references/workflow.md` — the phases in full, with the commands and the failure
  modes each one guards against.
- `references/doc-inventory.md` — the tier template, one brief per document, and
  the generating skill for each.
- `references/html-templates.md` — conventions for the four HTML pages.
- `references/paper-theme.css` — the committed light palette and what each token means.
