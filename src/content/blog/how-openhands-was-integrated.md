---
title: "Integrating OpenHands into an Internal Dev Portal"
description: "How I took an OSS coding agent from a laptop experiment to a deployed, custom-UI service — and what the infrastructure taught me along the way."
publishedAt: "2026-08-15"
tags:
  - AI
  - agents
  - engineering
---

# Integrating OpenHands into an Internal Dev Portal

![From laptop experiment to deployed service — the OpenHands integration ladder](/blog/how-openhands-was-integrated/hero-diagram.svg)

I recently integrated [OpenHands](https://docs.openhands.dev) — the
open-source autonomous coding agent — into an internal developer portal at
work. It went from a laptop experiment to a deployed service with its own
UI, and the project settled into a shape I'd now reuse for any OSS agent:
evaluate locally, deploy a shared instance, wrap it with your own frontend,
then let real usage drive the polish.

```text
Phase 1          Phase 2           Phase 3          Phase 4          Phase 5
laptop eval  →   shared deploy  →  native UI/BFF →  capacity &    →  workflow
(~$3/run)        (StatefulSet)     (key stays       cleanup          polish
                                    server-side)    (200Gi, janitor)
```

This post walks through the phases, because the *shape* of the integration
turned out to be more interesting than any individual feature.

## Table of contents

- [The starting point](#the-starting-point)
- [Phase 1: Local evaluation](#phase-1-local-evaluation)
- [Phase 2: A shared, always-on deployment](#phase-2-a-shared-always-on-deployment)
- [Phase 3: A native UI and a BFF](#phase-3-a-native-ui-and-a-bff)
- [Phase 4: The infrastructure kept score](#phase-4-the-infrastructure-kept-score)
- [Phase 5: Workflow polish](#phase-5-workflow-polish)
- [Takeaways](#takeaways)

## The starting point

The host system is an internal developer portal: a React frontend and an
Express backend in one monorepo, where each internal tool is a small
self-contained app. I already had an async ticket-to-MR agent (file a
ticket, get a merge request back) and local git worktrees for parallel
work. OpenHands came in as a third modality: an **interactive, sandboxed**
agent you can watch and steer mid-run — a complement to the other two, not
a replacement.

## Phase 1: Local evaluation

I started with a runbook and a bootstrap script, not product code.

The script starts the OpenHands app container locally (UI and API on
`:3000`), mounting the Docker socket so it can spawn per-conversation
sandbox containers. Usefully, everything the UI does is also a REST call,
so the entire setup is scriptable:

- LLM configuration via `POST /api/v1/settings` — model from an env var,
  defaulting to a Claude model
- My GitLab PAT via `POST /api/v1/secrets/git-providers`, so the agent
  can clone, push, and open MRs

The gotchas each cost real time, so I wrote them down with their symptoms:

1. **Don't install OpenHands natively on macOS.** litellm ships no macOS
   wheels, and the source build wants a newer rustc than Homebrew
   provides. Docker is the reliable path.
2. **A stale `base_url` silently breaks Anthropic.** A leftover default of
   `https://api.openai.com` in the LLM settings makes every call fail with
   an empty exception — and the real 404 only shows up in the *sandbox
   container's* logs, not the app's. My bootstrap script explicitly nulls
   the field.
3. **Don't mount local checkouts into the sandbox.** Worktrees have a
   `.git` pointer file that breaks in the container, and macOS-built
   `node_modules` binaries won't run on Linux. Let the agent clone fresh
   via the GitLab integration instead.
4. **OSS OpenHands has no notifications** (Slack is a paid-tier feature).
   So I wrote one: a small Node script that subscribes to each
   conversation's agent-server WebSocket and posts to Slack on
   finished / error / stuck / awaiting-input transitions.

The phase ended with a measured evaluation: a fully autonomous run —
clone, branch, docs edit, run a check script, conventional commit, push,
draft MR — in about seven minutes for $2.81. That number is what justified
everything after.

## Phase 2: A shared, always-on deployment

The local setup has a structural flaw: the agent loop lives on my laptop,
so runs pause when it sleeps. Phase 2 moved OpenHands to a dev Kubernetes
cluster as a StatefulSet with a persistent volume, behind an oauth2-proxy.

```text
                 ┌──────────────────────────────────────────────┐
                 │ StatefulSet: openhands (1 replica)           │
 browser ──────► │                                              │
   │             │  ┌──────────────┐ ┌────────┐ ┌───────────┐  │
   ▼             │  │ agent-canvas │ │ notify │ │  janitor  │  │
 oauth2-proxy ─► │  │ (UI + agent  │ │ (Slack │ │ (workspace│  │
 (email          │  │  server)     │ │ sidecar│ │  expiry)  │  │
  allowlist)     │  └──────┬───────┘ └───┬────┘ └─────┬─────┘  │
                 │         └──────┬──────┴────────────┘        │
                 │                ▼                            │
                 │  PVC ── /home/openhands/.openhands          │
                 │      └─ /home/openhands/workspace/sessions/ │
                 └──────────────────────────────────────────────┘
```

Three design decisions shaped it:

- **Ship through the path of least resistance.** The entire deployment
  lives in the one values file that is auto-approved in the deployment
  repo — no shared chart changes, no RBAC changes, no network-policy
  changes, no human review gate. Constraint-driven architecture.
- **All-in-one image, no Docker socket.** Instead of the local setup's
  per-conversation sandbox containers, the deployed shape runs the agent
  server in-process. That keeps the pod clean under a restricted Pod
  Security Standard: non-root, no docker.sock, no ServiceAccount token,
  all capabilities dropped.
- **Single-tenant, and honest about it.** OSS OpenHands has no auth or
  tenancy. The oauth2-proxy email allowlist *is* the tenancy boundary:
  every allowlisted user shares one pod, one filesystem, and one GitLab
  identity. I wrote this down rather than pretending otherwise.

The Slack notifier came along as a sidecar — mounted from a ConfigMap and
reusing the agent image for its Node runtime, so no extra image pulls.
Conversations became durable: state and workspaces persist across pod
restarts, and closing my laptop no longer stops a run.

Deploy day still had its firefights, all instructive:

- The all-in-one image exposes a **different API surface** than the
  classic app (`/api/conversations/search` with an `X-Session-API-Key`
  header), so the notifier needed rework.
- Users with long identity-provider group lists got a **blank page after
  login**: the session cookie blew past 4KB and the forwarded header drew
  a 431 from the upstream. Fix: keep tokens and groups out of the cookie
  (`session-cookie-minimal`).
- Credentials got productionized: a **stable agent-server API key** from
  the secret store instead of the auto-generated on-disk one, a git
  askpass helper so **tokens never appear in remote URLs** or shell
  history, and a set of read-only MCP servers bootstrapped idempotently
  by the sidecar. Setting the stable key promptly invalidated the on-disk
  key the sidecar was still using — one more fix.

## Phase 3: A native UI and a BFF

The biggest phase: rather than only iframing the upstream UI, I gave the
portal its own frontend for the deployed instance, backed by a
backend-for-frontend layer.

```text
 browser ──► auth proxy ──► portal BFF ──────────► agent-server
             (allowlist)    │ fail-closed email      (in-pod)
                            │ allowlist, again
                            │ injects X-Session-API-Key
                            └─ the key never reaches the browser
```

The BFF exists for one main reason: **the agent-server API key never
reaches the browser.** The browser talks only to authenticated portal
routes; the key stays server-side. Every route except a status endpoint
fails closed behind an email allowlist mirroring the proxy's — same
tenancy boundary, enforced twice.

The BFF grew to roughly twenty-five endpoints: conversation CRUD, message
sending, event/transcript pagination, a workspace file viewer, git diff
and commit views, read-only terminal history, and a "suggested issues"
feed pulling open unassigned GitLab issues to hand the agent.

Three details from this phase are worth calling out:

**Per-conversation workspaces.** Initially every conversation shared one
working tree on the persistent volume — so concurrent agents collided.
The fix mints the conversation UUID in the BFF, hands it to OpenHands as
the conversation ID, and derives a durable per-session directory from it.
The path-construction code is deliberately paranoid: strict UUID
validation, and an explicit proof that the derived path cannot escape the
sessions root. Upstream-reported working directories are *never* trusted
blindly either — they're re-validated against the workspace root before
being used as a filesystem scope, failing closed on anything suspicious.

**A feature got deleted.** A "Plan mode" (agent proposes before acting)
and live mode-switching shipped, proved unreliable in practice, and were
removed. The willingness to delete is rarer than the willingness to ship.

**Design docs before capabilities.** Feasibility and design docs for
browser support, an interactive terminal, and a task-verification
workflow all landed in this phase. The terminal doc is the interesting
one — it deliberately *rejects* adding a generic command-execution
endpoint, keeping the terminal read-only and scoping any future
interactivity carefully. The security posture was written down before the
feature existed.

## Phase 4: The infrastructure kept score

Once people actually used it, the cluster started sending feedback, and
each response was driven by measured numbers rather than guesses:

- **Compute.** The initial 2 CPU / 4Gi limits throttled and OOM-killed
  heavier tasks — the agent clones repos and runs `npm install` / build /
  test. Raised to 8 CPU / 16Gi limits.
- **Disk.** Per-session workspaces cost roughly 2GB each — the git clone
  itself is only ~115MB; the bulk is `node_modules` and build output. The
  20Gi volume hit 84% with just eight sessions, while the pod used under
  1GiB of its 16Gi memory allowance: disk had become the binding
  constraint. I expanded it to 200Gi — which, since
  `volumeClaimTemplates` are immutable, meant patching the live PVC and
  recreating the StatefulSet with `--cascade=orphan`.
- **The sharpest edge:** conversation transcripts and metadata live on the
  *same* volume as the session workspaces. One runaway `node_modules`
  could break persistence for every conversation, not just its own.
- **A janitor sidecar.** Session workspaces had no expiry, so I added one
  that reclaims workspaces idle for two hours, checking every five
  minutes. The design detail that matters: it only exempts conversations
  the agent-server reports as *actively running*, with idleness measured
  as max(directory mtime, newest conversation event) so someone reading
  results for hours doesn't lose their workspace mid-conversation. A
  neighbouring cleanup job that exempted anything a user "might resume"
  had reclaimed exactly nothing — a cautionary tale encoded directly in
  the janitor's design. The dry-run flag defaults to off for the same
  reason: a permanently dry janitor is just the do-nothing reaper again.

## Phase 5: Workflow polish

The rest was quality-of-life, informed by actual use:

- **Per-message model switching** — change models mid-conversation
  instead of restarting, plus newer models in the picker.
- **A local CLI** for driving deployed conversations from a terminal.
- **A disk-usage bar** for the shared volume. The implementation detail
  matters: it's a *fixed* `df` command with a bounded cache and request
  deduplication — explicitly not the generic exec endpoint the design doc
  forbade.
- **Transcript fixes** — timestamps on rows, and correctly rendering the
  final agent response in long conversations (a pagination edge case).
- **Pinned repositories** in the repo picker, so the most-used targets
  surface first.

## Takeaways

1. **Docs-first cadence.** Every phase began or ended with a runbook or
   design doc. The gotchas that cost hours are written down with their
   symptoms, so the next person greps the error message and finds the
   answer.
2. **A clean maturity ladder.** Local eval with a measured cost → shared
   deployment with honest tenancy tradeoffs → own UI via a BFF → capacity
   and cleanup → workflow features. Each rung justified the next; the
   $3-per-task evaluation came *before* any infrastructure spend.
3. **Security posture lives in the code.** Fail-closed allowlists, path
   escape proofs, bounded caches, upstream values treated as untrusted,
   tokens kept out of URLs, and a refusal to ship arbitrary command
   execution — mostly documented as comments right where the decision is
   enforced.
4. **Capacity decisions from measurements, not vibes.** 84% full, ~2GB
   per session, under 1GiB of 16Gi memory used — the numbers said disk
   was the constraint, so disk is what changed.
5. **Deletion is a feature.** An unreliable mode was removed shortly
   after shipping, and the janitor exists because cleanup that never
   deletes anything is indistinguishable from no cleanup at all.

The most transferable lesson: when adopting an OSS agent for team use,
the agent itself is the easy part. The real work is tenancy, credential
boundaries, durable workspaces, capacity, and the discipline to write
down what you decided *not* to build.
