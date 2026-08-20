---
title: "Why build a control plane?"
description: "The gap between an agent that can code and a system I can operate all day."
part: "Design"
---

# Why build a control plane?

Coding agents are already good at the inner loop: inspect a repository, edit files, run commands, and explain the result. The missing piece for me was the **outer operating loop**.

A long-running agent creates product questions that a prompt box does not answer:

```text
 start task ──► watch progress ──► inspect evidence ──► steer
     ▲                                                   │
     └──── review branch / PR ◄── verify ◄── finish ◄────┘
```

Once several tasks run at once, that loop also needs project ownership, branch isolation, status, notifications, and cleanup. I did not want those decisions spread across terminal tabs, shell scripts, and memory.

## The boundary that made the project tractable

The first choice was what **not** to build. OpenHands already provides:

- a durable conversation and event model;
- an agent loop that talks to model providers;
- workspace tools for files, shell commands, and Git;
- a headless HTTP API;
- an `agent-canvas` container that packages the runtime.

So I did not create another agent framework or wrap a CLI in a terminal widget. I treated the agent server as a backend dependency and put my opinions in a backend-for-frontend (BFF).

```text
 browser       product policy                 agent execution
┌─────────┐   ┌──────────────────────────┐   ┌────────────────────┐
│ React UI│──►│ Express BFF              │──►│ OpenHands server   │
│         │◄──│ auth · paths · models    │◄──│ events · tools     │
│         │   │ previews · forge clients │   │ workspaces · LLM   │
└─────────┘   └──────────────────────────┘   └────────────────────┘
```

That boundary produces three useful properties:

1. **The browser never holds the OpenHands session API key.** The BFF reads and injects it server-side.
2. **The interface is replaceable.** React can change without changing the agent loop.
3. **Workflow rules are ordinary application code.** Workspace modes, model allowlists, preview commands, and manager commands can be tested and reviewed.

## What the custom layer owns

The BFF is not a transparent proxy. It is the policy boundary for:

| Concern | Custom behavior |
| --- | --- |
| Conversation creation | Validates prompts, model choice, images, repository URLs, and workspace mode |
| Workspaces | Chooses a local folder, detached worktree, or fresh clone directory |
| Events | Replays durable history and bridges live token deltas to the browser |
| Inspection | Exposes bounded file, diff, commit, command-history, and disk endpoints |
| Live preview | Maps an allowlisted dev server to a conversation-scoped browser path |
| Credentials | Keeps model, GitHub, GitLab, and agent-server credentials off the client |
| Orchestration | Validates manager commands and tracks workers in optional Postgres state |

The React application then turns those capabilities into project, conversation, changes, terminal-audit, tools-health, notification, and manager-run surfaces.

## Design principles

A few rules kept the custom layer coherent:

- **Local-first and single-user.** It is a personal tool, not a pretend multi-tenant SaaS.
- **Projects before prompts.** The home screen starts from the repository I want to change.
- **Inspectability before autonomy.** Status, diffs, command output, and previews came before more agents.
- **Deterministic mechanics around probabilistic decisions.** Models can plan; code validates commands and records truth.
- **An escape hatch stays available.** The stock OpenHands canvas remains reachable when the custom UI does not expose a new upstream feature yet.

The point is not that every coding-agent user needs a custom IDE. The point is that OpenHands exposes a clean enough server boundary to make one feasible.
