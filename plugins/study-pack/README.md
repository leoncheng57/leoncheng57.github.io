# study-pack

A Claude Code plugin that turns a set of related PRs into onboarding material for
someone reading the codebase for the first time: numbered Markdown documents plus
a few interactive HTML pages, fronted by a browser index and served locally in a
paper theme.

The output is the visible part. The value is four judgments the workflow enforces:

1. **Never trust the working tree.** Every local branch is checked against its PR
   head before a line of code is read, and source is read at the PR head via
   `gh api …?ref=<sha>` — no fetch, no checkout, no stash.
2. **Mine the PR descriptions and commit trail before the code.** Rationale,
   rejected alternatives and review reversals live there and nowhere else.
3. **Hunt for design-doc ↔ code divergence** and turn it into an exercise.
4. **Keep open threads visibly separate from settled design.**

Item 1 is not theoretical. On the stack this plugin was extracted from, every
local branch was behind its PR, one repo was on an unrelated branch entirely, six
load-bearing facts differed — and two of three research agents read the working
tree and reported the superseded design confidently and in detail.

## Install

This plugin lives in the `leoncheng` marketplace, hosted in
[leoncheng57/leoncheng57.github.io](https://github.com/leoncheng57/leoncheng57.github.io):

```bash
/plugin marketplace add leoncheng57/leoncheng57.github.io
/plugin install study-pack@leoncheng
```

The repo is public, so this needs no credentials.

### Without a marketplace

Any plugin directory dropped into `~/.claude/skills/` auto-loads as
`<name>@skills-dir` next session — useful for iterating on a checkout:

```bash
git clone https://github.com/leoncheng57/leoncheng57.github.io.git
```

```bash
ln -s "$PWD/leoncheng57.github.io/plugins/study-pack" ~/.claude/skills/study-pack
```

## Use

Either invoke it directly:

```
/study-pack:study-pack ENG-412
/study-pack:study-pack https://github.com/owner/repo/pull/123
/study-pack:study-pack my-feature-branch
```

or just say what you want — the skill auto-triggers on phrasings like *"help me
really understand this PR stack"*, *"make me study material for these PRs"*,
*"onboard me to this feature"*.

With no argument it asks what to build a pack for.

### Where the pack lands

It asks. The options, in the order it offers them:

1. `<repo>/.claude/study/<slug>/` — offered **only if** `git check-ignore` says
   the path is ignored.
2. The session scratchpad — nothing to clean up, does not survive the session.
3. Anywhere you name.

It never writes into a tracked path without saying so, and `git status` in the
target repo is verified unchanged at the end.

### Reading the pack

```bash
python3 ~/.claude/plugins/.../scripts/serve_study.py <pack-dir> --port 8899
```

The skill starts this for you and prints the URL. Stdlib only — no pip install.
It renders `.md` to HTML in the same paper theme as the HTML pages so
cross-document links navigate in a browser; `?raw=1` on any document gives the
source. Ctrl-C stops it.

## What is in here

```
.claude-plugin/
  plugin.json          the plugin manifest
  marketplace.json     the repo as its own single-plugin marketplace
skills/study-pack/
  SKILL.md             the workflow — eight phases, staleness gate first
  references/
    workflow.md        each phase with its commands and the failure mode it prevents
    doc-inventory.md   the tier template, one brief per document, generating skill
    html-templates.md  conventions for the four HTML pages
    paper-theme.css    the committed light palette and what each token means
  assets/
    index.html         browser entry point with reading-track filter
    diagram.html       inline-SVG architecture page
    flashcards.html    flip / shuffle / mark-known
    quiz.html          four banks, self-scoring
scripts/
  pr_head_check.sh     local-branch-vs-PR-head staleness report (read-only)
  check_links.sh       every local link in a generated pack resolves
  serve_study.py       dependency-free md→HTML paper-theme server
```

## Requirements

- `gh`, authenticated with `repo` scope on the repositories being studied.
- `python3` (standard library only).
- `git`.

## Notes

- **No `version` in `plugin.json`.** While the plugin is iterating, omitting it
  keys installs to the git SHA so they auto-update — `plugin list` shows the SHA
  where a version would be. The trade-off is that `claude plugin validate
  --strict` warns about it; validate without `--strict` until the first real
  release, then set a version and use `claude plugin tag`.
- **`plugin eval` is in early access** and was not enabled on the machine this
  was built on, so there is no `evals/` suite yet. `claude plugin eval init` is
  the way in once it is.
- **The plugin has no CI of its own.** The host repo's CI (`npm run lint` over
  `src`, vitest, `vite build` into `docs/`) does not touch `plugins/`, so nothing
  here is linted or built by it.
- **The theme is light-only by decision.** The tier colours are calibrated against
  the paper ground and lose their meaning inverted. Please do not add a dark mode.

## Licence

MIT
