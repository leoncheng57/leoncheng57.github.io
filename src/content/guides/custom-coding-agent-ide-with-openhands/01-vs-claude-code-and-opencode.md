---
title: "Why not just use Claude Code or OpenCode?"
description: "Where the custom control plane is better for my workflow—and where stock tools are better."
part: "Compare"
---

# Why not just use Claude Code or OpenCode?

[Claude Code](https://code.claude.com/docs/en/overview) and [OpenCode](https://opencode.ai/docs/) are capable products, not “just terminals.” The difference is where the seam falls. With them I adopt an upstream session model and interface; here I own the layer above the agent.

```text
        stock tool                    custom control plane
  ┌───────────────────────┐        ┌───────────────────────┐
  │ vendor: UI + sessions │        │  me: UI + sessions    │  ← I own this
  │        + policy       │        │      + policy         │
  ├───────────────────────┤        ├───────────────────────┤
  │ vendor: agent loop    │        │ OpenHands: agent loop │  ← same engine
  └───────────────────────┘        └───────────────────────┘
     one task, one repo              a portfolio of tasks
```

Owning that top box is the whole trade. It buys:

- **Portfolio view:** one place showing every project, conversation, worker, cost, and health signal.
- **Workspace policy:** a worktree applied at task creation rather than remembered.
- **Review in one window:** diffs, command audit, preview, and pull-request state beside the transcript.
- **Orchestration:** programmable manager commands with wave gates.
- **Remote supervision:** a phone can steer a run while execution stays on my machine.
- **One policy surface:** server-side model and credential rules, set once.

It costs me everything in **Downsides and lessons**.

| Dimension | Custom OpenHands IDE | Claude Code | OpenCode |
| --- | --- | --- | --- |
| Best value | Own the workflow itself | Polished first-party product | Open, provider-flexible product |
| Multi-task view | Custom conversation + run board | Native session surfaces | Native sessions and clients |
| Workspaces | Local folder, auto-worktree, or clone | Native project workflow | Native project workflow |
| Review | Files, diffs, audit, preview, PR/MR panel | Strong terminal/IDE surfaces | Strong terminal/TUI surfaces |
| Permissions | Plan/Build modes, but Build is the default | Mature permission modes | Configurable allow/ask/deny |
| Maintenance | I own the full stack | Vendor maintained | Project maintained |
