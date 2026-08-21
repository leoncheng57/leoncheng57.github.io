---
title: "How it was built, layer by layer"
description: "From an API boundary to a standalone app, then workspaces, observability, and packaging."
part: "Build"
---

# How it was built, layer by layer

The repository grew through working vertical slices:

1. **Prove the API loop.** A Vite/React page talked to an Express BFF, which created an OpenHands conversation, replayed its events, and sent follow-up messages. The upstream API key stayed server-side.
2. **Add the real workflow.** Conversation controls, files, Git changes, commits, diffs, read-only command history, disk usage, model settings, and pull-request metadata turned chat into a development surface.
3. **Package the runtime.** Docker Compose starts `agent-canvas`; Node runs the BFF and UI in development. Postgres is optional and only powers manager runs.
4. **Make projects the home screen.** A grid under `OPENHANDS_PROJECTS_DIR` replaced the blank prompt as the main entry point.
5. **Dogfood and harden.** Real sessions drove token streaming, bounded reconnects, hidden-tab pausing, notifications, long-context settings, mobile layout, and task worktrees.
6. **Ship a package.** The release build puts the static UI and BFF in one container beside the agent container, exposing one browser port.

```text
Development                     Packaged
browser → Vite → Express        browser → app container
                    │                         │
                    └──► agent-canvas ◄──────┘
                              │
                       mounted projects
```

The main implementation seams are `client/pages/Hub.tsx` (new tasks), `client/pages/Conversation.tsx` (the work view), `server/openhands/setup.ts` (BFF policy), `server/openhands/upstream.ts` (authenticated agent calls), and `server/openhands/manager/` (orchestration).

I would split the central BFF router earlier in a second build. Keeping everything together accelerated the first slices, but the module became too large for easy ownership.
