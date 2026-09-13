---
title: "Mechanics and lessons"
description: "The scripts, the local server, and two bugs the first end-to-end run caught."
part: "Reference"
---

# Mechanics and lessons

## The three scripts

| Script | Does |
|---|---|
| `pr_head_check.sh` | The staleness gate. Read-only; exits non-zero if anything is stale, missing or unreadable. |
| `check_links.sh` | Every local `.md`/`.html` the pack links to exists. |
| `serve_study.py` | Renders `.md` to HTML in the paper theme so cross-links navigate in a browser. Stdlib only. |

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/serve_study.py <pack-dir> --port 8899
```

`?raw=1` on any document gives the source. Ctrl-C stops it.

## Where the pack is written

It asks, and the first option is offered only if it passes a check:

```bash
git check-ignore -q .claude/study/ && echo "ignored — safe" || echo "TRACKED"
```

A study pack is generated material. It goes stale the moment the branch moves,
and it is not reviewable. Writing it into a tracked path without saying so is how
a 30-file pack ends up in somebody's PR. The last step of every run is confirming
`git status` in the target repo is unchanged.

## Two bugs the first end-to-end run caught

Both are worth repeating because neither would have surfaced from reading the
code.

### The server announced a URL it had not bound

```python
print(f"study pack → http://localhost:{port}/")
ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
```

A leftover server from an earlier session already held port 8899. The bind threw,
the process died — and every page fetched from that "verified" URL came from the
*other* server, serving a different pack. Sizes matched to the byte, because they
were real files; just the wrong ones.

It is a failure that **looks like success**, which is the same shape as the stale
working tree the whole plugin exists to prevent. Fixed by binding first, then
announcing, and reporting `EADDRINUSE` with the `lsof` command and a `--port 0`
hint instead of a traceback.

> Never print a URL you have not successfully bound.

### The link checker matched too much

The original check was a one-liner:

```bash
grep -oE '[0-9A-Za-z._-]+\.(md|html)' index.html | sort -u | ...
```

It reported three missing files. All three were false positives: `.pill.html` from
a CSS selector, `d.html` from a JS property access, and `SKILL.md` mentioned in
prose. A check that cries wolf gets ignored, so it was replaced with a script that
matches **only link positions** — `href="…"`, Markdown `](…)`, and the index's
`f:` / `html:` fields.

## Packaging notes

- Executables go in `scripts/`, referenced as `${CLAUDE_PLUGIN_ROOT}/scripts/<name>`.
  A **top-level `bin/` is rejected** by claude.ai on org upload or marketplace
  sync, so keeping it out leaves that distribution path open.
- `version` is deliberately omitted from `plugin.json`, so installs key to the git
  SHA and auto-update. The cost is one warning under `claude plugin validate
  --strict`; set a version at the first real release.
- One skill, not a skill plus a command. Skills carry `argument-hint`, are invoked
  as `/plugin:skill`, *and* auto-trigger from their description — so `commands/`
  would add nothing.
