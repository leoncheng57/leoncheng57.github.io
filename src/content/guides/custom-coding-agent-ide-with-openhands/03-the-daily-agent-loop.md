---
title: "Worktrees, streaming, and live previews"
description: "The mechanics that make a long-running agent feel like a usable development environment."
part: "Build"
---

# Worktrees, streaming, and live previews

The most important product decisions were not about the model. They were about where the agent works and how its activity becomes visible.

## One task, one workspace

The safe default is a fresh detached Git worktree created from the selected local project.

```text
main checkout
     │
     ├── session A worktree ──► branch feat/a
     ├── session B worktree ──► branch fix/b
     └── session C worktree ──► branch docs/c
```

The choice is explicit because each mode has a different failure mode:

```text
                         choose workspace
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       local worktree    shared folder     clone by URL
       isolated edits    instant/live      clean remote task
       extra disk        collision risk    clone/setup cost
```

A worktree prevents ordinary file collisions, but it is not a security sandbox. Every conversation still runs inside the same agent container, and the configured projects root is mounted there.

## Durable history plus a live stream

The OpenHands conversation is the source of truth. Events are persisted by the agent server; the BFF does not own a second transcript database.

```text
 durable lane:  agent event log ──► paginated replay ──► React transcript
 live lane:     token callback   ──► BFF SSE bridge  ──► draft response
```

This two-lane design matters:

- a BFF hot reload can drop the live connection without losing the conversation;
- the browser reconnects and fills gaps from durable events;
- streaming improves perceived latency without becoming the persistence mechanism;
- old history can page in from the top while the newest activity stays anchored.

The stream also needs resource rules. Hidden tabs pause their connection, reconnect attempts are bounded, and idle streams are reaped. Without those details, a few background conversations can exhaust browser connection limits and overload upstream event walks.

## A conversation-scoped preview URL

Frontend agents often start a dev server inside their workspace. Publishing a Docker port for every conversation would make orchestration and cleanup awkward, so the BFF provides a reverse proxy.

```text
browser
  │ /api/openhands/conversations/<id>/preview/app/...
  ▼
Express preview proxy
  │ path-preserving request
  ▼
agent container: conversation dev server on an allowlisted port
```

Starting a preview is intentionally narrow:

1. the browser selects an allowlisted repository configuration;
2. the BFF chooses the command template and port;
3. only server-derived values enter the shell command;
4. runtime PID, log, and port files live under fixed `/tmp` paths;
5. the browser sees start, stop, status, and logs—not arbitrary command execution.

The result is a browser tab embedded next to the conversation and changes view. An agent can edit a component, run Vite, and let me inspect the result without adding host port mappings.

## The inspection loop

A typical frontend task becomes:

```text
choose project
    │
    ▼
create isolated worktree
    │
    ▼
watch transcript + tool activity
    │
    ├──► inspect files / command output
    ├──► review Git diff
    └──► open live preview
              │
              ▼
       steer, verify, commit, PR
```

Notifications close the loop when I leave the page. Browser banners and sound are client-side; optional push notifications are server-side. Completion, error, stuck, and input-needed states can each be configured independently.

## Why the operational layer matters

None of these mechanics improves the agent's reasoning directly. They improve whether I can:

- tell what it is doing;
- recover after a restart;
- avoid branch collisions;
- review evidence before accepting “done”;
- supervise more than one task without keeping every tab in view.

That is the central bet of the project: **workflow reliability can create as much practical value as another prompt tweak.**
