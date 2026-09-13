---
title: "The HTML layer"
description: "Four pages earn interactivity; everything else stays Markdown. And why the theme is light-only."
part: "The Output"
---

# The HTML layer

Four pages, no more. Everything else stays Markdown — greppable, diffable,
readable in an editor, and rendered by the local server anyway.

The test for promoting a document to HTML is **not** importance. It is whether
the thing is genuinely *interactive*.

| Page | Why it earns HTML |
|---|---|
| `index.html` | Reading-track filter — one pack serves an hour and a week |
| `03-architecture.html` | Inline SVG; a data flow is a picture |
| `20-flashcards.html` | Flip, shuffle, mark known, persist |
| `21-quiz.html` | Per-question feedback the moment you answer |

## Single file, no dependencies

Inline `<style>`, inline `<script>`, no build step, no CDN, no framework. Study
packs get opened over `file://` as often as through the server, often on a
machine with no network.

> A page that needs a CDN is a page that is blank on a plane.

## The theme is committed, and light-only

A warm paper ground, dark brown-black ink, and four "ink colours" that carry
meaning rather than decoration: the path under discussion, correct/current,
stale/provisional, and wrong/dead.

```css
--bg:#f2efe4;  --surface:#fbf9f2;  --ink:#282419;
--accent:#2e4a86;                      /* the path under discussion */
--ok:#3d6b46;   /* correct, current */
--warn:#8a5f12; /* stale, provisional */
--bad:#9c3a42;  /* wrong, dead */
color-scheme: light;
```

No `prefers-color-scheme` block and no toggle — which is a deliberate choice, not
an oversight. The tier colours are calibrated against the paper ground and lose
their meaning inverted, and a study pack is a *document*. Documents have one
appearance.

The rule that follows: **if a colour is not saying one of those four things, it
should be `--surface` and `--rule`.**

## Diagrams are hand-authored

Inline SVG. No Mermaid, no D3, no layout library — a generated diagram lays out
for the graph, not for the explanation, and the explanation is the point.

Every diagram gets `role="img"` plus an `aria-label` that states the whole flow
**in a sentence**. That sentence is the only version a screen reader gets, so it
is written as prose, not as a list of node names. Every `<figcaption>` has to say
something the picture cannot; a caption that restates the title is wasted.

No gradients, no shadows, no animation. It should print.

## Namespace browser storage

`localStorage` keys are prefixed with the pack slug — `"<slug>-track"`,
`"<slug>-cards-known"`. Two packs served from the same origin (which
`localhost:8899` guarantees) would otherwise overwrite each other's state.
