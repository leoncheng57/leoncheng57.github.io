---
title: "Downsides and lessons"
description: "The maintenance, safety, performance, and complexity costs of owning the layer above the agent."
part: "Decide"
---

# Downsides and lessons

Owning the control plane means owning its failures.

- **Maintenance:** React, Express, Docker, optional Postgres, streaming, CI, and packaging all need care. Upgrading the pinned agent image means rechecking the BFF's upstream API assumptions.
- **Safety:** Plan mode gates writes behind an explicit approval, but Build mode—plain `NeverConfirm`—is still the default for a new conversation and the only mode manager workers get. The container can reach mounted projects, network, and configured credentials. Treat this as a trusted, local, single-user tool—not a public service.
- **Isolation:** worktrees prevent edit collisions, but workers still share one agent process, resource pool, and credential set.
- **Latency and cost:** long histories repeatedly send growing context. Streaming and condensation improve the experience, not the underlying economics.
- **Review distance:** more workers create more spend, branches, and integration risk. The draft pull request remains the review boundary.
- **Disk:** conversation state, command events, clones, dependencies, and build output accumulate. Cleanup must never confuse real host projects with re-creatable session workspaces.
- **Upstream lag:** the custom UI will sometimes trail stock OpenHands features; the stock canvas remains the escape hatch.

That list is the real answer to the decision tree in the opening chapter: the third branch is only worth taking if these costs buy back more time than they consume.

The lessons I would carry forward:

1. The agent loop is only half the product; recovery and review surfaces matter.
2. Durable events make reconnects and audit possible.
3. Let models decide; let code validate, cap, and record.
4. Workspace design deserves more attention than the prompt box.
5. Custom is better only where it encodes a workflow worth maintaining.

Further reading: [OpenHands](https://docs.openhands.dev/), [Claude Code security](https://code.claude.com/docs/en/security), and [OpenCode permissions](https://opencode.ai/docs/permissions/).
