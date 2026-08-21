---
title: "Building a Custom Coding-Agent IDE with OpenHands"
description: "How I turned OpenHands' headless agent server into a local browser control plane with isolated workspaces, previews, notifications, and manager/worker runs."
updatedAt: "2026-08-20"
publishedAt: "2026-08-20"
beta: true
audience: "For developers deciding whether to use a coding agent as-is or build a workflow-specific control plane around one."
tags:
  - openhands
  - agents
  - architecture
---

# Building a Custom Coding-Agent IDE with OpenHands

I wanted one browser view for long-running coding work: conversations, branches, diffs, commands, previews, pull requests, and parallel workers. The result is [Customizable DCA](https://github.com/leoncheng57/Customizable-DCA-OpenHands), a local-first React and Express control plane around the headless [OpenHands agent server](https://docs.openhands.dev/sdk/guides/agent-server/overview).

![A guided walkthrough of the custom OpenHands IDE: picking a project, the plan-mode approval gate, the diff and preview panels, and the draft pull request.](component:openhands-ide-walkthrough)

## Start it

Clone it, configure `.env` as the README describes, then:

```bash
git clone https://github.com/leoncheng57/Customizable-DCA-OpenHands
cd Customizable-DCA-OpenHands
bash scripts/dev.sh          # add --tailscale for phone access
```

Open `http://localhost:5173`. The command starts the headless agent in Docker, the Express API, and the Vite UI. `--tailscale` detects the machine's tailnet name and allows private phone access.

## The system in one picture

```text
 browser: projects · chat · diffs · previews · manager runs
                              │
                              ▼
 Express BFF: credentials · policy · API shaping · SSE
                              │
                              ▼
 OpenHands agent server: conversations · tools · workspaces · LLM
                              │
                              ▼
                 repos · shells · dev servers
```

> **OpenHands is the execution engine; this repository is the control plane.**

The Guide opens with the question worth asking first — why not just use Claude Code or OpenCode? — then covers how the boundary was built and what it costs to maintain. The source is [MIT-licensed on GitHub](https://github.com/leoncheng57/Customizable-DCA-OpenHands), so everything described here can be read, run, or forked.
