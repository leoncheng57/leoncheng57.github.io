---
title: "The tools I built"
description: "A catalogue of what the control plane actually adds on top of a stock agent — one card each."
part: "Build"
---

# The tools I built

None of this is the agent loop; OpenHands does that. These are the surfaces built around it, and together they are the reason the app is worth running at all. Here is one pass through them:

![A screen recording of the custom OpenHands IDE running in a desktop browser.](component:desktop-tour)

![The tools built on top of the agent server, one card each.](component:tool-grid)

Behind those sit the smaller things that only matter once you live in the app: a read-only command audit with a `.sh` export, live token streaming with bounded reconnects, a pull-request panel with pipeline state, disk usage, per-tab identity so a wall of sessions stays readable, and a watcher that re-attaches conversations orphaned by a restart.
