---
title: "Downsides, decision guide, and lessons"
description: "The maintenance, safety, performance, and complexity costs—and when the architecture is worth them."
part: "Decide"
---

# Downsides, decision guide, and lessons

Owning the control plane means owning its failures. The trade-offs are substantial, and several favor using an upstream product directly.

## It is another product to maintain

The app includes React, Express, Docker, optional Postgres, browser streaming, mobile behavior, CI, packaging, and release automation. It is also pinned to a known `agent-canvas` version.

An OpenHands upgrade means checking every endpoint, event shape, and lifecycle assumption the BFF uses. Direct users of Claude Code, OpenCode, or the stock OpenHands interface receive upstream changes without maintaining that compatibility layer.

## The current safety model is too permissive

Normal and manager conversations currently use OpenHands' `NeverConfirm` policy. Tool calls execute without a user approval prompt.

Containerization helps, but it is not a complete boundary:

- the configured projects root is mounted into the container;
- a shared-folder conversation can reach sibling projects under that root;
- model and Git credentials may be available to the runtime;
- the container has network access;
- repository and issue text can contain prompt injection.

Claude Code and OpenCode both provide richer user-facing permission controls today. A confirmation-policy selector and tighter per-conversation mounts are important follow-ups for this IDE.

> **Operating rule:** treat it as a trusted, local, single-user tool. Do not expose it directly to the public internet.

## Isolation is practical, not absolute

Worktrees stop ordinary edit collisions, but every conversation shares one agent container, process, resource pool, and credential set. Several agents can compete on builds, browser installs, model rate limits, disk, or the agent server's event loop.

True multi-tenancy would require per-user or per-conversation runtimes and credentials. That is an architecture change, not an environment variable.

## Long conversations become slow and expensive

Agent loops repeatedly send growing context. Large command output, diffs, and long histories increase latency and model cost. Retries can produce long silent gaps even when the container is mostly idle.

Streaming, condensation settings, activity indicators, and session handoffs improve the experience, but they do not remove the underlying economics. Sometimes the right optimization is a fresh conversation with a compact handoff.

## More autonomy increases review distance

Parallel workers multiply model spend, branch state, and review obligations. Individually reasonable changes may not compose into a coherent result.

A draft pull request—not an agent's “done” message—remains the review boundary. Manager orchestration makes work easier to distribute; it does not make verification optional.

## Local state needs housekeeping

Conversation history, command events, cloned workspaces, dependencies, build output, and caches accumulate. The UI shows disk use, but the local package does not yet have a complete janitor.

Cleanup has to distinguish among:

```text
real host projects         never delete
conversation history       durable source of truth
session workspaces         re-creatable, but may hold unpushed work
command-event history      useful audit, safe to prune by policy
```

## The custom UI will lag somewhere

A focused interface is valuable because it omits things. The same fact is a limitation: a new upstream capability may exist in the stock interface before this BFF and UI understand it.

Keeping the stock OpenHands canvas reachable is not an accident. It is the compatibility escape hatch.

## Should you build this layer?

```text
Do you mainly need one agent in one repository?
  ├─ yes ─► use Claude Code or OpenCode directly; keep the stack small
  └─ no
      │
      ▼
Do you repeatedly need custom workflow, views, or orchestration?
  ├─ no ──► use upstream clients plus lightweight scripts/plugins
  └─ yes
      │
      ▼
Will you own a full-stack app and its security boundary?
  ├─ no ──► stay with maintained upstream products
  └─ yes ─► a custom OpenHands control plane may be worth it
```

Good reasons to build the layer:

- you supervise many asynchronous tasks;
- your workflow has stable, organization-specific states or artifact rules;
- local execution and data ownership matter;
- you want to connect runs to custom forges, tools, previews, or notifications;
- you enjoy treating the agent interface as a programmable product.

Poor reasons:

- wanting only a prettier chat window;
- avoiding the terminal for its own sake;
- assuming that more simultaneous agents automatically produce better software.

## What I learned

1. **The agent loop is only half the product.** Recovery, visibility, workspaces, and review surfaces determine whether it fits into real work.
2. **Durable events are a powerful foundation.** They let the UI reconnect, replay, audit, and derive status without owning the agent's internal state.
3. **Put probabilistic decisions behind deterministic mechanics.** Let a model plan and steer; let code validate commands, cap concurrency, and record truth.
4. **Workspace design is product design.** “Which directory can this agent change?” deserves more attention than the prompt box.
5. **Dogfooding reveals lifecycle problems.** Short demos rarely expose stale streams, giant histories, notification fatigue, disk growth, or branch collisions.
6. **Custom is not automatically better.** It is better only where the custom layer encodes a workflow worth maintaining.

## Further reading

- [OpenHands documentation](https://docs.openhands.dev/)
- [OpenHands Agent Server guide](https://docs.openhands.dev/sdk/guides/agent-server/overview)
- [Claude Code overview](https://code.claude.com/docs/en/overview)
- [Claude Code security and permissions](https://code.claude.com/docs/en/security)
- [OpenCode documentation](https://opencode.ai/docs/)
- [OpenCode permissions](https://opencode.ai/docs/permissions/)
- [The source repository](https://github.com/leoncheng57/custom-dca-ide-with-openhands) (currently private)
