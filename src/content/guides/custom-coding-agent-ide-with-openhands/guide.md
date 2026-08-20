---
title: "Building a Custom Coding-Agent IDE with OpenHands"
description: "How I turned OpenHands' headless agent server into a local browser control plane with isolated workspaces, live previews, notifications, pull-request context, and manager/worker runs."
updatedAt: "2026-08-20"
publishedAt: "2026-08-20"
audience: "For developers deciding whether to use a coding agent as-is or build a workflow-specific control plane around one."
tags:
  - openhands
  - agents
  - architecture
---

# Building a Custom Coding-Agent IDE with OpenHands

I wanted more than a coding-agent chat window. I wanted one place to answer the operational questions that appear once agents become part of the workday:

- Which tasks are running, blocked, or waiting for me?
- Which project, worktree, and branch does each conversation own?
- What changed, what did the commands print, and is the preview healthy?
- Can I steer a task from another browser—or from my phone—without finding its terminal?
- Can one manager split a project into parallel workers and track their pull requests?

The result is [`custom-dca-ide-with-openhands`](https://github.com/leoncheng57/custom-dca-ide-with-openhands): a local-first React and Express application around the headless [OpenHands agent server](https://docs.openhands.dev/sdk/guides/agent-server/overview).

```text
                      my workflow and interface
┌─────────────────────────────────────────────────────────────────┐
│ projects · conversations · diffs · command audit · previews    │
│ notifications · PR/MR status · manager/worker runs             │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Express BFF
                               │ credentials + policy + API shaping
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OpenHands agent server                       │
│ conversations · events · LLM loop · tools · workspaces         │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
                  git repos · shells · files · dev servers
```

> **The design in one sentence:** OpenHands is the execution engine; the custom repository is the control plane.

## What this Guide covers

This is a build story and architecture Guide, not an installation manual. It explains:

1. why I built a browser control plane instead of another agent loop;
2. how the React, Express, Docker, workspace, and event layers fit together;
3. how isolated worktrees, streaming, previews, and manager runs work;
4. where this is better *for my workflow* than using Claude Code or OpenCode by themselves;
5. the safety, maintenance, performance, and complexity costs that come with owning the layer.

## The short version

The custom IDE is most useful when I am supervising several asynchronous tasks or encoding a repeatable workflow into the product. It is less useful for one focused change in one repository, where opening a mature coding tool directly is simpler.

The source repository is private while publication and licensing are reviewed. This Guide documents the architecture and lessons; repository links currently require collaborator access.
