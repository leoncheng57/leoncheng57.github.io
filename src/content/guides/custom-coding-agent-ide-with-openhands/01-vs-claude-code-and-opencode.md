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

Owning that top box is the whole trade. It buys one portfolio view across projects, conversations, workers, cost, and health; a worktree policy applied at task creation rather than remembered; diffs, command audit, preview, and pull-request state in the same window; programmable manager commands with wave gates; phone supervision while execution stays on my machine; and one server-side model and credential policy. It costs me everything in the next chapter.

| Dimension | Custom OpenHands IDE | Claude Code | OpenCode |
| --- | --- | --- | --- |
| Best value | Own the workflow itself | Polished first-party product | Open, provider-flexible product |
| Multi-task view | Custom conversation + run board | Native session surfaces | Native sessions and clients |
| Workspaces | Local folder, auto-worktree, or clone | Native project workflow | Native project workflow |
| Review | Files, diffs, audit, preview, PR/MR panel | Strong terminal/IDE surfaces | Strong terminal/TUI surfaces |
| Permissions | Plan/Build modes, but Build is the default | Mature permission modes | Configurable allow/ask/deny |
| Maintenance | I own the full stack | Vendor maintained | Project maintained |

Claude Code is the easier choice for a polished Anthropic-centered experience and mature permissions. OpenCode is the easier choice for open-source, broad model-provider support, and maintained clients without building another app. For one focused task in one repository, I reach for either of them, not for this.

So the honest decision is narrow:

```text
One agent in one repo? ── yes ─► use Claude Code or OpenCode directly
          │ no
          ▼
Repeated custom workflow? ─ no ─► use upstream clients + small scripts
          │ yes
          ▼
Willing to own security + full stack? ─ yes ─► custom control plane
```

Two "no"s out of three end outside this repository, and that is the correct answer for most people. The rest of this Guide is what the third path actually involves.
