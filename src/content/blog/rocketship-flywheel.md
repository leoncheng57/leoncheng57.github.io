---
title: "The Rocketship Flywheel: User Adoption vs Quality in Tech Projects"
description: "A mental model for tech projects as a spiral flywheel — shipping, adoption, bugs, analysis, and quality — and how to draw your project's history as a multi-loop diagram."
publishedAt: "2026-04-21"
tags:
  - product
  - engineering
  - mental-models
  - visualization
  - workflow
---

# The Rocketship Flywheel: User Adoption vs Quality in Tech Projects

Most tech projects I have worked on do not actually move in a straight line. They spiral. You ship something, users pile in, the cracks show up, you dig into root causes, you rebuild the weak parts — and then you ship again, with a bigger audience and a slightly different problem set.

The mental model I keep coming back to is a **flywheel**. Not the marketing kind that promises compounding growth forever, but a mechanical one: five phases that you keep rotating through, each loop a little wider than the last.

I call it the **Rocketship Flywheel**, because the best projects I have seen feel exactly like this — you light the engine, adoption pulls you forward, quality problems try to pull you back, and you only make it to the next stage by completing the loop again.

![Rocketship Flywheel: the five phases of a tech project iteration](/blog/rocketship-flywheel/flywheel-diagram.svg)

## Contents

- [The five phases](#the-five-phases)
- [Why the tension matters](#why-the-tension-matters)
- [Why it is a spiral, not a circle](#why-it-is-a-spiral-not-a-circle)
- [How to draw your own](#how-to-draw-your-own)
  - [Step 1: Identify the loops](#step-1-identify-the-loops)
  - [Step 2: Lay out the rings](#step-2-lay-out-the-rings)
  - [Step 3: Template](#step-3-template)
- [When to use this](#when-to-use-this)
- [Closing thought](#closing-thought)

## The five phases

| **Ship Fast & Release** | **User Adoption & Growth** | **Bugs & Requests** | **Deep Dive Analysis** | **Implementations & Quality** |
| ----------------------- | -------------------------- | ------------------- | ---------------------- | ----------------------------- |
| Get something in front of users. Versioned, deployed, actually usable. Not a prototype, not a slide deck — a thing that runs in production. | People try it. Some of them stick. Usage grows in ways you did not fully predict, and the product starts to behave differently under real load and real workflows. | Adoption surfaces everything: the assumptions that did not hold, the edge cases you skipped, the features users insist they need now that they are actually using it. | You stop reacting and start thinking. What is the actual root cause? What is the shape of the feedback? Which requests are symptoms of the same underlying problem? | You rebuild, refactor, harden. Not just fixes — the structural changes that let the next "Ship Fast" phase go further than the last one. |

Then the loop starts again, one ring wider.

## Why the tension matters

There are two forces pulling on every phase of this flywheel, and they pull in opposite directions.

On one side is **user adoption and growth** — the pressure to ship, to expand, to get in front of more people, to move fast enough that the momentum does not die. Adoption is oxygen. Without it, the project stalls and nothing else you do matters.

On the other side is **quality and improvement** — the pressure to understand what you built, fix what is broken, and strengthen the parts that will have to carry more weight in the next loop. Without this, adoption becomes a liability. More users means more pain.

## Why it is a spiral, not a circle

A single flywheel diagram is a circle. A real project, over time, is a spiral — the same five phases, but each loop happens at a different scale, with a different user base, and with different stakes.

The first loop is tiny. You are shipping to five people. Bugs are embarrassing but cheap. Deep dive analysis fits in one afternoon.

The third or fourth loop is much larger. You are shipping to thousands. A single production bug can be front-page material. Analysis has to coordinate across teams. The "quality" phase is no longer one engineer cleaning up a file — it is a multi-week structural project.

Same five phases. Completely different scale. That is the part a flat diagram cannot capture, and it is why I draw project histories as **concentric rings**, each one a completed loop around the flywheel.

Here is a worked example for a fictional three-loop project:

![Example flywheel diagram showing three completed loops and a current in-progress loop](/blog/rocketship-flywheel/example-flywheel.svg)

The innermost ring is the first iteration, when the project was young and scrappy. The outer rings are later iterations, when the stakes and the scope were much bigger. The current, in-progress loop is the open pink arc on the outside.

## How to draw your own

### Step 1: Identify the loops

Look at your project's git history, changelogs, or milestone merges. Group the work into major iterations where the project went through the full flywheel cycle. For each loop, answer five questions:

1. **Ship Fast & Release** — What was shipped? (Which versions, which features?)
2. **User Adoption & Growth** — What happened when users or teams started using it?
3. **Bugs & Requests** — What broke? What did users ask for?
4. **Deep Dive Analysis** — What was the root cause or the key insight?
5. **Implementations & Quality** — What was improved or rebuilt as a result?

Each group of five answers equals one loop. If you cannot answer all five, it probably was not a complete loop — it was a half-iteration that skipped either the quality work or the adoption phase.

### Step 2: Lay out the rings

The diagram layout is simple:

```
Center:  Initial Idea (dashed light-blue circle)
Rings:   Concentric circles expanding outward, one per completed loop
         All completed rings use the same muted gray color
Arc:     The outermost ring is an open arc in pink — the current,
         in-progress loop
Labels:  Placed at 5 positions around each ring, one per phase:
         - Top (12 o'clock):     Ship labels      (yellow)
         - Upper-right (1-2):    Adoption labels  (green)
         - Bottom (6 o'clock):   Bugs labels      (amber)
         - Lower-left (7-8):     Analysis labels  (blue)
         - Left (9 o'clock):     Quality labels   (purple)
Sidebar: Right side, short summaries of each loop with dates
Legend:  Bottom-right box with the phase colors
```

Two rules I have found matter more than they look:

- **Ring colors are uniform.** Every completed ring is the same muted gray. Only the current, in-progress ring is pink. This keeps the eye on the phase labels instead of counting rings.
- **Label colors represent phases, not loops.** Ship is always yellow. Adopt is always green. Bugs are always amber. Analysis is always blue. Quality is always purple. That way, you can trace a single phase across multiple loops by following the color — which is often where the most interesting patterns live.

### Step 3: Template

The SVG is hand-crafted, which sounds worse than it is. The skeleton fits on one screen, and once you have the first ring working, the rest is copy-paste with different radii.

A minimal template looks like this:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1300 900"
     width="1300" height="900" style="background:#1a1b26">
  <!-- Center point: cx=480, cy=440 -->

  <!-- Title -->
  <text x="480" y="36" text-anchor="middle" font-size="22"
        font-weight="700" fill="#a9b1d6">[Project] — History</text>

  <!-- Center: Initial Idea -->
  <circle cx="480" cy="440" r="42" fill="#bfdbfe" stroke="#60a5fa"
          stroke-width="2" stroke-dasharray="6 3" />

  <!-- Completed loops: concentric gray circles, +60px radius each -->
  <circle cx="480" cy="440" r="100" fill="none"
          stroke="#565f89" stroke-width="2" stroke-opacity="0.4" />
  <circle cx="480" cy="440" r="160" fill="none"
          stroke="#565f89" stroke-width="2" stroke-opacity="0.4" />

  <!-- Current loop: open arc in pink -->
  <path d="M 480,220 A 220,220 0 1 1 260,440"
        fill="none" stroke="#f472b6" stroke-width="2.5"
        stroke-opacity="0.6" marker-end="url(#arrow-current)" />

  <!-- Phase labels positioned around each ring (see gist) -->
</svg>
```

Sizing rule of thumb: start with a radius of 100 for the first ring and add 60 for each subsequent ring. Two loops fit comfortably in a `1100 × 700` viewBox; five or six loops need `1300 × 900` or taller.

## When to use this

I do not reach for this diagram on every project. It earns its keep in a few specific situations:

- **Retrospectives at the end of a major release.** Drawing the loop forces you to name the analysis and quality phases, which tend to get skipped in narrative retros.
- **Onboarding new team members.** A single image of "here is how this project has actually evolved" beats a wall of changelog links.
- **Strategy conversations with stakeholders.** When someone asks "why aren't we shipping faster?", showing where you are on the current ring — and what still needs to happen before the loop closes — is much more concrete than "we're working on quality stuff."
- **Your own sanity check.** If you cannot draw the current loop, you probably are not sure which phase you are in, and that is worth noticing on its own.

## Closing thought

The Rocketship Flywheel is not a framework. It is a way of looking at work that already exists. The value of naming the phases is that it gets easier to notice when you are stuck, when you are skipping a phase, and when the current loop is finally ready to close.
