---
title: "Worktrees, streaming, and live previews"
description: "The mechanics that make a long-running agent feel like a usable development environment."
part: "Build"
---

# Worktrees, streaming, and live previews

The safest default is one detached Git worktree per conversation:

```text
main checkout
 ├── session A worktree → branch feat/a
 ├── session B worktree → branch fix/b
 └── session C worktree → branch docs/c
```

The UI still offers the original folder for quick experiments and fresh clone directories for URL-based tasks. Worktrees prevent normal edit collisions; they are not security sandboxes, because conversations still share one agent container and mounted projects root.

The transcript uses two lanes:

```text
durable events ──► paginated replay ──► transcript
live tokens    ──► BFF SSE bridge  ──► draft bubble
```

A BFF restart can drop the live stream without losing the conversation. The browser reconnects and fills gaps from durable events. Hidden tabs pause streams, and reconnects are bounded so background sessions do not exhaust browser connections.

For frontend work, the BFF also reverse-proxies an allowlisted dev server from the agent container to a conversation-scoped URL. I can watch the agent edit, inspect its command output and diff, then open the result beside the conversation without publishing a Docker port per task.

Notifications close the loop when I leave: browser banners and sound run client-side; optional push notifications cover finished, error, stuck, and input-needed states.
