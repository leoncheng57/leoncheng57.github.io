---
title: "How it was built, layer by layer"
description: "From an API boundary to a standalone app, then workspaces, observability, hardening, and packaging."
part: "Build"
---

# How it was built, layer by layer

The repository was assembled as a series of working vertical slices. That history is a better blueprint than starting with a large framework design.

## 1. Write the boundary and decisions down

The project began with a plan and an append-only decision log. The key decision was to keep the OpenHands agent server intact and make the custom BFF the product layer.

That gave the first end-to-end contract:

```text
POST task ──► create conversation ──► run agent
    ▲                                      │
    └──── messages ◄── durable events ◄────┘
```

## 2. Scaffold the standalone shell

The minimum standalone application was:

1. Vite and React for the browser;
2. Express for the BFF;
3. an authenticated upstream client for the agent server;
4. local auth, logging, database, and forge adapters;
5. a Vite development proxy and production static-file fallback.

This step proved the browser could create a conversation, receive its event history, and send follow-up messages without knowing the upstream API key.

## 3. Bring over the real workflow, not just chat

A useful coding-agent interface needs more than messages. The next layer added the working surfaces:

- conversation lifecycle controls;
- paginated transcript events;
- file tree and file content;
- Git repositories, changes, commits, and diffs;
- read-only command history and output;
- disk usage;
- GitHub and GitLab pull-request metadata;
- model and notification settings.

Input limits, path validation, bounded reads, caches, and timeout behavior came with those endpoints. That policy work is most of the difference between a demo and an application I trust enough to leave running.

## 4. Package the runtime with Docker Compose

The development stack runs the React and Express app on the host and `agent-canvas` in Docker. Postgres is an optional profile used only by manager runs.

```text
┌─ host ──────────────────────────────────────────────────────┐
│ browser ─► Vite :5173 ─► Express :3000                     │
│                              │                              │
│                              ▼                              │
│                    Docker: agent-canvas :8010               │
│                       │                │                    │
│                       ▼                ▼                    │
│               workspace mount    optional Postgres         │
└─────────────────────────────────────────────────────────────┘
```

A bootstrap script starts the containers, waits for the agent key, seeds agent settings, and starts both development servers. The packaged stack later moved the built app into Docker too, exposing one browser port.

## 5. Make local projects the primary workflow

The first useful home screen was not a repository URL field. It was a grid of folders under a configured projects root.

The creation path grew three workspace modes:

| Mode | Workspace | Best for |
| --- | --- | --- |
| Local worktree | Detached worktree in `sessions/<conversation-id>` | Normal isolated work; now the default |
| Shared local folder | The original project directory | Fast experiments and deliberate live self-development |
| Clone by URL | Fresh `sessions/<conversation-id>` directory | Repository tasks without an existing local checkout |

The BFF mints the conversation ID before creation, derives the session directory from that validated ID, and asks Git to prepare the worktree when isolation is selected. The initial task tells the agent to create a task branch before committing.

## 6. Add observability, then harden it

Dogfooding long sessions exposed issues that short demos miss. The app gained:

- live token streaming over server-sent events;
- bottom-anchored history with older-page loading;
- visible “thinking” and tool activity;
- background-tab stream pausing;
- bounded reconnects and idle stream cleanup;
- desktop, sound, and optional push notifications;
- integration health checks;
- condenser settings for controlling long-context growth;
- mobile layouts and private-network access.

These features do not make the model smarter. They make the system understandable when it is slow, blocked, or running somewhere I am not watching.

## 7. Turn the repository into a package

The release path builds a multi-architecture application image plus a small Compose bundle and installer. In package mode:

```text
 browser :3000
      │
      ▼
 app container: static React + Express BFF
      │ private Compose network
      ▼
 agent-canvas :8000 ──► mounted projects + durable state
```

The agent server is not published to the host in that shape. The app reads its key through a read-only state mount and reaches it over the Compose network.

## The resulting code map

| Concern | Main location |
| --- | --- |
| Routes and shell | `client/main.tsx` |
| Project and new-task UI | `client/pages/Hub.tsx` |
| Conversation UI | `client/pages/Conversation.tsx` |
| BFF routes and policy | `server/openhands/setup.ts` |
| Authenticated agent client | `server/openhands/upstream.ts` |
| Manager/worker system | `server/openhands/manager/` |
| Development runtime | `docker-compose.yml`, `scripts/dev.sh` |
| Package and installer | `Dockerfile`, `deploy/` |

One thing I would change in a second build: split the BFF router earlier. Keeping policy together accelerated the first vertical slices, but the central setup module eventually became too large for easy ownership.
