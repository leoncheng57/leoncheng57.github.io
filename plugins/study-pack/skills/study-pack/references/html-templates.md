# The HTML layer

Four pages, all copied from `assets/` and filled in — never written from scratch.
They exist because four things in a study pack are genuinely better interactive
than flat: choosing a reading depth, following a data flow, drilling cards, and
being told you got one wrong.

Everything else stays Markdown. A `.md` file is greppable, diffable, readable in
an editor, and renders through the local server anyway. Do not promote a document
to HTML because it is important; promote it because it is *interactive*.

| Asset | Copy to | Why it earns HTML |
|---|---|---|
| `index.html` | `index.html` | Reading-track filter — the same pack serves an hour and a week. |
| `diagram.html` | `03-architecture.html` | Inline SVG; a data flow is a picture. |
| `flashcards.html` | `20-flashcards.html` | Flip, shuffle, mark known, persist. |
| `quiz.html` | `21-quiz.html` | Per-question feedback the moment you answer. |

## Rules that hold for all four

**Single file, no dependencies.** Inline `<style>`, inline `<script>`, no build
step, no CDN, no framework. Study packs are opened over `file://` as often as
through the server, often on a machine with no network. A page that needs a CDN
is a page that is blank on a plane.

**The palette is committed and light-only.** Paste the `:root` block from
`paper-theme.css` verbatim into every page. `color-scheme: light`, no
`prefers-color-scheme` block, no toggle. The tier colours are calibrated against
the paper ground and lose their meaning inverted, and a study pack is a document,
not an app — documents have one appearance.

**Colour carries meaning, never decoration.** `--accent` is the path under
discussion; `--ok/--t1` correct or current; `--warn/--t2` stale or provisional;
`--bad/--t4` wrong or dead. If a colour is not saying one of those things, use
`--surface` and `--rule`.

**Namespace `localStorage` by pack slug.** `"<slug>-track"`, `"<slug>-cards-known"`.
Two packs served from the same origin — which is what `localhost:8899` guarantees
— will otherwise overwrite each other's state.

**Every HTML page links back to `index.html`** (`<a class="back">`) and to its
Markdown twin. The two must agree in content; generate both from one source.

**It should print.** No gradients, no shadows, no animation, no hover-only
content.

## `index.html`

The `DOCS` array is the pack's table of contents. Every field is documented in
the template's own comment block.

- **One entry per document that exists on disk.** The commonest defect in a
  generated pack is an index card linking to a document that was planned and
  never written. Verify before handing over:

  ```bash
  ${CLAUDE_PLUGIN_ROOT}/scripts/check_links.sh <pack-dir>
  ```

- **`track` is the *shortest* track the doc belongs to**, not a list. `TRACKS`
  widens: `hour` shows `hour`, `half` shows `hour`+`half`, `all` shows everything.
  Mark a document `hour` and it appears in all three.
- **`star` sparingly.** Five or six across a pack. Star everything and the reader
  starts nowhere.
- **`skill` is provenance**, shown as a pill. Name the skill you actually used, or
  `hand`.
- **Drop empty tiers** from `TIERS`. `render` skips them, but the labels should be
  honest about what the pack contains.
- **Keep the staleness banner** whenever any branch is stale. Delete the whole
  `.warn` block only when `10-local-vs-prhead.md` reports everything current.

## `03-architecture.html`

Hand-authored inline SVG. No Mermaid, no D3, no layout library — a generated
diagram lays out for the graph, not for the explanation, and the explanation is
the point.

- `viewBox` with a fixed aspect; `svg{width:100%;height:auto}` scales it.
  `min-width` (≈44rem) inside a scrolling `figure` keeps labels legible on narrow
  screens instead of crushing them.
- Colour by meaning, with the `.s-*` classes: `.s-acc` the path under discussion,
  `.s-box` neutral infrastructure, `.s-warn` a caveat, `.s-dead` a path that
  records nothing, `.s-group` a dashed "these belong together" box.
- Label every box. `text.mono` for identifiers and file paths, `text.lbl` for
  edge labels, `text.small` for asides.
- `role="img"` plus an `aria-label` that states the **whole flow in a sentence**.
  That sentence is the only version a screen reader gets — write it as prose, not
  as a list of node names.
- Every `<figcaption>` says something the picture cannot. A caption that restates
  the title is wasted.
- One diagram per path. Two paths on one canvas is how you get a diagram nobody
  reads.

Put the "one thing to understand first" section **above** the diagrams. A reader
who takes only the first paragraph should still have the load-bearing fact.

## `20-flashcards.html`

- Same cards as `20-flashcards.md`. The array is JSON so it lifts cleanly between
  the two.
- `s` (section) drives the filter. Keep the set small — 4 to 7 sections. Sections
  should match the pack's structure, not invent a second taxonomy.
- **Every card stands alone.** No "it", no "the above", no dependence on the
  previous card. Shuffle is a first-class control; a card that only makes sense in
  order is broken by it.
- `a` carries the reason, not just the fact. A card that states a fact without its
  reason is a card that will be re-forgotten.
- `q` and `a` are inserted with `innerHTML` — inline `<code>`, `<b>`, `<i>`,
  `<br>` are fine. Never paste untrusted text.

## `21-quiz.html`

- Four banks: `MC` (multiple choice, `c` = 0-based correct index), `TF`
  (`a` = truth value), `SA` (short answer, revealed), `JD` (judgment, model
  answer). Numbering, scoring and the progress bar are all derived from array
  lengths — add and remove questions freely.
- **`MC` and `TF` are scored; `SA` and `JD` are not.** The scored half tests
  recall; the unscored half tests thinking, which is not gradeable and should not
  pretend to be.
- **Distractors must be believable.** A wrong option nobody would pick teaches
  nothing. The best distractor is the thing a careful reader would conclude from
  the design doc — which is to say, from the stale version.
- **The explanation is the teaching.** Say why the right answer is right *and* why
  the tempting wrong one is wrong. Show it on correct answers too.
- Score bands are fractions of the scored set, and each band **names the document
  to go back to**. "Re-read the material" is useless; "re-read 05 · read path" is
  a next action. Replace the `{{…}}` document names with real ones from the pack.
