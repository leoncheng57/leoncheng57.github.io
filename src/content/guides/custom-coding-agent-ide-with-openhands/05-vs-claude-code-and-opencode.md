---
title: "Why not just use Claude Code or OpenCode?"
description: "Where the custom control plane is better for my workflow—and where the stock tools are better."
part: "Compare"
---

# Why not just use Claude Code or OpenCode?

First, an important correction to an easy straw man: these are not “just terminal agents.” [Claude Code](https://code.claude.com/docs/en/overview) is available in terminal, IDE, desktop, and browser surfaces. [OpenCode](https://opencode.ai/docs/) has a terminal interface, desktop app, IDE integrations, a client/server model, and broad provider support.

Both are capable coding tools. The difference is **where I want the product boundary to sit**.

With a stock tool, I adopt its session model, interface, permission system, extension points, and release cadence. With this repository, I own a workflow-specific React and Express control plane while OpenHands supplies the agent runtime underneath it.

## Where the custom IDE is better for my workflow

### 1. Portfolio view instead of one active session

Projects, conversations, manager runs, worker phases, costs, integration health, and disk use live in one browser application. That matters when tasks are asynchronous and I need to decide which one deserves attention.

### 2. Workflow-native review surfaces

Files, diffs, commit history, command audit, live preview, and pull-request status are first-class pages connected to the conversation. They are not conventions I have to reconstruct across terminal tabs.

### 3. Workspace policy at task creation

Clicking a local project can automatically create a detached worktree and start the agent there. The product, not a remembered setup command, enforces the normal path.

### 4. Programmable orchestration

Manager commands, wave gates, concurrency caps, worker-state derivation, and completion criteria are application code I can change and test. The exact workflow is the feature.

### 5. Remote supervision without remote execution

The stack can stay on my machine while another browser or phone checks status and sends a follow-up over a private network. Execution, repositories, and durable state remain local.

### 6. Central policy for models and forges

The BFF owns model allowlists, provider configuration, repository URL rules, GitHub/GitLab shaping, and credential flow. That creates one policy surface for every conversation.

## Side by side

This compares product shape, not model intelligence. All three can use strong models, and the upstream products evolve quickly.

| Dimension | Custom OpenHands IDE | Claude Code by itself | OpenCode by itself |
| --- | --- | --- | --- |
| Primary value | Workflow-specific local control plane | Polished first-party coding-agent product | Open, provider-flexible coding-agent product |
| Interface ownership | My React UI and Express BFF | Anthropic's maintained surfaces and settings | OpenCode's maintained clients, server, config, and plugins |
| Multi-task overview | Built-in conversation list and manager-run board | Native session surfaces; custom workflow stays external | Native sessions and clients; custom workflow stays external |
| Workspace policy | Local folders, automatic worktrees, or fresh clones | Native project/session workflow | Native project/session workflow |
| Orchestration | Custom manager plus deterministic worker monitor | Native agent/team capabilities where available | Native agents and subagents where available |
| Review experience | Integrated files, diffs, command audit, preview, and PR/MR panel | Strong terminal/IDE workflow; exact surface varies | Strong terminal/TUI workflow; exact surface varies |
| Models | Explicit server-side allowlist | Best-integrated with Anthropic models; some surfaces support third-party providers | Broad provider and model support is a core strength |
| Permission controls | Currently too permissive; no user-facing policy control | Mature permission modes and policy settings | Configurable allow/ask/deny permissions |
| Maintenance | I own the fork and upstream API contract | Vendor maintains the product | Project maintains the core product; extensions still need upkeep |
| Best fit | I want to build and own the workflow itself | I want a mature tool with minimal assembly | I want an open, flexible agent without building a whole IDE |

## Where Claude Code is the better choice

Claude Code is the easier answer when I want:

- a polished, supported experience without maintaining a full-stack wrapper;
- Anthropic's newest agent and model features as soon as its product exposes them;
- a mature permission architecture rather than my current always-run default;
- deep integration through its maintained terminal, IDE, desktop, or browser surfaces.

## Where OpenCode is the better choice

OpenCode is the easier answer when I want:

- an open-source coding agent without building a separate control plane;
- broad model-provider choice as a first-class feature;
- a fast terminal-centered workflow plus maintained desktop and IDE clients;
- agents, plugins, permissions, and client/server operation through its existing configuration model.

## The honest conclusion

The custom app wins only where the extra layer encodes a repeated need. If I am doing one focused change in one repository, opening Claude Code or OpenCode directly is usually simpler.

The custom IDE becomes worthwhile when I am operating several long-running tasks, need project and worktree policy to be automatic, or want to evolve the interface around problems I have actually measured.
