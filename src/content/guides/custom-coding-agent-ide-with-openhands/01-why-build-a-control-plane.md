---
title: "Why build a control plane?"
description: "The gap between an agent that can code and a system I can operate all day."
part: "Design"
---

# Why build a control plane?

Coding agents already handle the inner loop: inspect a repository, edit files, run commands, and explain the result. My missing piece was the outer loop: **which tasks are active, where are they working, what changed, and which one needs me?**

I chose not to build another agent framework. OpenHands already provides durable conversations, events, tools, workspaces, model calls, and a headless API. I put my workflow in an Express backend-for-frontend (BFF) and React UI instead.

```text
 React UI ──► Express BFF ──► OpenHands agent server
    ▲          policy +          events + tools
    └──────── browser-safe ◄──── durable state
```

The BFF owns the product decisions:

| Concern | Custom behavior |
| --- | --- |
| Start task | Validate prompt, model, images, repo, and workspace |
| Inspect | Bound file, diff, command, and disk reads |
| Preview | Proxy an allowlisted dev server into the browser |
| Credentials | Keep agent, model, and forge tokens off the client |
| Orchestrate | Validate manager commands and track workers |

This boundary keeps the browser simple, makes workflow rules testable, and leaves the stock OpenHands canvas available when the custom UI lags an upstream feature.
