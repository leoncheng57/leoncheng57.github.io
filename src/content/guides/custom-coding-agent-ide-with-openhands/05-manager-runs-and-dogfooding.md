---
title: "Manager runs and the self-development loop"
description: "How deterministic orchestration coordinates normal OpenHands workers—and how the IDE improves itself."
part: "Operate"
---

# Manager runs and the self-development loop

Manager runs add a planning conversation above normal worker conversations:

```text
                 ┌─ worker A → branch → draft PR
human ↔ manager ↔ executor + monitor
                 └─ worker B → branch → draft PR
```

The model decides how to split and steer work. Regular code validates commands, caps each wave, launches workers, records activity in Postgres, and derives progress from conversation, branch, and PR state. A model saying “done” is not authoritative.

Workers remain ordinary conversations, so I can open their full transcript, files, changes, commands, and preview. The run board is an aggregate view, not a second execution system.

Parallelism also multiplies spend, builds, branches, and review. A manager with one worker is often enough: the manager keeps clarification context while the worker keeps implementation context.

The IDE can work on its own repository, creating a feedback loop:

```text
use it → notice friction → start isolated fix → test + PR → ship → use it
```

That dogfooding produced the practical features: default worktrees, collision warnings, visible activity, stream hardening, mobile access, and better long-session behavior.
