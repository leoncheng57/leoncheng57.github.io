---
title: "Integrating OpenHands into an Internal Dev Portal"
description: "How I took an OSS coding agent from a laptop experiment to a deployed, custom-UI service — the architecture, security, ops, and UX decisions that made it work."
publishedAt: "2026-08-17"
tags:
  - AI
  - agents
  - engineering
---

# Integrating OpenHands into an Internal Dev Portal

OpenHands is one of the more exciting things to come out of the
open-source AI tooling wave: a fully autonomous coding agent — it clones a
repo, writes code, runs tests, and opens a merge request on its own — that
you can run yourself, MIT-licensed, no vendor in the loop. When I first
tried [OpenHands](https://docs.openhands.dev), a complete autonomous task
(clone → branch → edit → verify → commit → push → draft MR) took about
seven minutes and cost $2.81. That was enough to convince me it deserved
more than a laptop experiment.

So I set out to build it into the internal developer portal at work as a
proper always-on service — with its own UI, durable server-side sessions,
and Slack notifications. This post is the story of that build, and the
shape it settled into is one I'd now reuse for any OSS agent: evaluate
locally, deploy a shared instance, wrap it with your own frontend, then
let real usage drive the hardening.

Rather than a chronological tour, the post is organized by theme — the
architecture, security, ops, and UX decisions are each more useful on
their own than interleaved. A concise [timeline](#historical-phases) at
the end records the order things actually happened in, mistakes included.

## Table of contents

- [The starting point](#the-starting-point)
- [Architecture](#architecture)
- [Security](#security)
- [Ops](#ops)
- [UX](#ux)
- [Quick build shortcuts](#quick-build-shortcuts)
- [Betting on open source](#betting-on-open-source)
- [Historical phases](#historical-phases)
- [Future](#future)
- [Takeaways](#takeaways)

## The starting point

The host system is an internal developer portal: a React frontend and an
Express backend in one monorepo, where each internal tool is a small
self-contained app. I already had an async ticket-to-MR agent (file a
ticket, get a merge request back) and local git worktrees for parallel
work. OpenHands came in as a third modality: an **interactive, sandboxed**
agent you can watch and steer mid-run — a complement to the other two, not
a replacement.

Before building anything, I evaluated it locally. A bootstrap script
starts the OpenHands app container (UI and API on `:3000`), mounting the
Docker socket so it can spawn per-conversation sandbox containers.
Usefully, everything the UI does is also a REST call, so the entire setup
is scriptable: LLM configuration via `POST /api/v1/settings`, my GitLab
PAT via `POST /api/v1/secrets/git-providers` so the agent can clone, push,
and open MRs.

The evaluation that justified everything after: a fully autonomous run —
clone, branch, docs edit, run a check script, conventional commit, push,
draft MR — in about seven minutes for $2.81.

## Architecture

The full system, end to end:

```text
 browser ──► oauth2-proxy ──► React pages ──► Express BFF
             (email            (native UI     │ allowlist again,
              allowlist)        + embed)      │ key injection, caches
                                              ▼
                     ┌─ agent pod ─────────────┐        ┌──────────┐
                     │ agent-canvas + sidecars │ ─────► │  GitLab  │ clone /
                     │ PVC: state + workspaces │        └──────────┘ push / MR
                     └───────┬──────────┬──────┘        ┌──────────┐
                             │          └─────────────► │  Slack   │ notify
                             ▼                          └──────────┘
                     ┌──────────────┐                   ┌──────────┐
                     │ LLM provider │                   │ MCP srvs │ read-only
                     └──────────────┘                   └──────────┘
```

The system exists in two shapes.

**Local** (per engineer): the app container spawns one sandbox container
per conversation via the mounted Docker socket. Fine for evaluation, but
the agent loop lives on my laptop — runs pause when it sleeps.

**Deployed** (shared): a single StatefulSet on a dev Kubernetes cluster
running the all-in-one image, where the agent server runs in-process — no
Docker socket, no per-conversation containers. Two sidecars (a Slack
notifier and a workspace janitor) share the pod, and everything durable
lives on one PVC:

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

On the portal side, OpenHands is one more self-contained app in the
monorepo: a set of React pages and an Express router. The router is a
backend-for-frontend — the only thing browsers ever talk to:

```text
 browser ──► auth proxy ──► portal BFF ──────────► agent-server
             (allowlist)    │ fail-closed email      (in-pod)
                            │ allowlist, again
                            │ injects X-Session-API-Key
                            └─ the key never reaches the browser
```

The BFF grew to roughly twenty-five endpoints, grouped by concern:

| Concern | Endpoints |
| --- | --- |
| Conversations | create / list / get / delete, messages, confirmation responses, pause & resume |
| Transcript | paginated events, final agent response |
| Workspace | file tree & content, per-conversation file scope, disk usage |
| Git | repos, changes, commits, diffs |
| Terminal | read-only command history & output |
| Workflow | suggested GitLab issues, repo picker, notification settings |

A full session lifecycle through those pieces — start, interrupt,
finish, merge:

```text
 user                    portal UI       BFF             agent         GitLab
  │ "fix the flaky        │               │                │              │
  │  login test"          │               │                │              │
  ├──────────────────────►│ POST /conversations            │              │
  │                       ├──────────────►│ mint UUID,     │              │
  │                       │               │ sessions/<uuid>│              │
  │                       │               ├───────────────►│ clone ──────►│
  │                       │◄── poll 3s ───┤◄── events ─────┤ work…        │
  │ "wait — use the       │               │                │              │
  │  staging config" ────►│ pause ───────►│───────────────►│ (halted)     │
  │ "ok continue" ───────►│ msg + resume ►│───────────────►│ work…        │
  │                       │               │                ├ push draft ─►│
  │                       │               │                ├ open MR ────►│
  │                       │◄─ final response ◄─────────────┤              │
  │ review & merge MR ───────────────────────────────────────────────────►│
  │ "done, close it" ────►│ delete ──────►│───────────────►│              │
  │                       │               │   … ~2h later: the janitor    │
  │                       │               │   reclaims the idle workspace │
```

Two architectural decisions carried the most weight:

**Per-conversation workspaces.** Initially every conversation shared one
working tree on the persistent volume — so concurrent agents collided.
The fix mints the conversation UUID in the BFF, hands it to OpenHands as
the conversation ID, and derives a durable per-session directory
(`sessions/<uuid>`) from it.

**Bounded everything.** The upstream agent-server rejects event pages
larger than 100, so transcript reads paginate. The repo list is cached
for five minutes; the conversation→working-dir scope cache has a TTL and
a hard cap of 256 entries with oldest-first eviction; the disk-usage
probe is cached and deduplicated so any number of polling browsers cause
at most ~2 probes a minute. Nothing grows without bound just because a
browser polls it.

## Security

Everything here fails closed.

- **Double-enforced tenancy.** The oauth2-proxy email allowlist is the
  tenancy boundary, and the BFF enforces the same allowlist again on
  every route except a status endpoint. Two layers, same list.
- **The API key never reaches the browser.** The agent-server key is
  injected server-side by the BFF; browsers only ever hold their own
  session cookie.
- **Path paranoia.** Session directories are derived from strictly
  validated UUIDs, with an explicit proof that the derived path cannot
  escape the sessions root. The conversation's upstream-reported
  `working_dir` is *never* trusted blindly — it's re-validated against
  the workspace root (no traversal, no backslash or NUL trickery, already
  canonical) before being used as a filesystem scope, and anything
  suspicious gets a 400 rather than a widened scope.
- **Narrow inputs.** The repo field only accepts URLs on the two git
  hosts the injected bot token can actually reach; prompts are capped at
  20,000 characters; terminal history reads are capped per poll.
- **Secrets stay out of band.** The workspace file viewer is hardened
  against secret exfiltration; git credentials flow through a
  `GIT_ASKPASS` helper so tokens never appear in remote URLs or shell
  history; commits use a bot identity.
- **A hardened pod.** Restricted Pod Security Standard: non-root, no
  Docker socket, no ServiceAccount token mounted, all capabilities
  dropped.
- **No arbitrary execution.** A design doc for interactive terminal
  support deliberately *rejected* adding a generic command-execution
  endpoint before any such feature existed. The one shell-adjacent
  feature that shipped — a disk-usage probe — is a fixed `df` command
  with no user input in its path.
- **Single-tenant, and honest about it.** OSS OpenHands has no auth or
  tenancy: every allowlisted user shares one pod, one filesystem, and one
  GitLab identity. I wrote this down rather than pretending otherwise.

## Ops

The deployment ships through GitOps — the manifests live in the one
values file that is auto-approved in the deployment repo, and a sync
picks them up. Health is three probes against `/alive` (startup,
liveness, readiness).

The runbook records the gotchas that each cost real time:

1. **Don't install OpenHands natively on macOS.** litellm ships no macOS
   wheels, and the source build wants a newer rustc than Homebrew
   provides. Docker is the reliable path.
2. **A stale `base_url` silently breaks Anthropic.** A leftover default
   of `https://api.openai.com` makes every call fail with an empty
   exception — and the real 404 only shows up in the *sandbox
   container's* logs. My bootstrap script explicitly nulls the field.
3. **Don't mount local checkouts into the sandbox.** Worktrees have a
   `.git` pointer file that breaks in the container, and macOS-built
   `node_modules` binaries won't run on Linux.
4. **OSS OpenHands has no notifications** (Slack is a paid-tier
   feature). So I wrote one: a small Node script that subscribes to each
   conversation's agent-server WebSocket and posts to Slack on
   finished / error / stuck / awaiting-input transitions.

Deploy day had its own firefights: the all-in-one image exposes a
**different API surface** than the classic app (`/api/conversations/search`
with an `X-Session-API-Key` header), so the notifier needed rework; users
with long identity-provider group lists got a **blank page after login**
because the session cookie blew past 4KB and drew a 431 upstream (fix:
`session-cookie-minimal`); and setting a **stable agent-server API key**
invalidated the auto-generated on-disk key the sidecar was still using —
one more fix.

Then real usage started sending capacity feedback, and each response was
driven by measured numbers rather than guesses:

| Resource | Before | After | Trigger |
| --- | --- | --- | --- |
| CPU / memory limits | 2 CPU / 4Gi | 8 CPU / 16Gi | throttling and OOM kills during `npm install` / build / test |
| Workspace volume | 20Gi | 200Gi | 84% full with just eight sessions (~2GB each — the clone is ~115MB; the bulk is `node_modules`) |

The volume resize had a wrinkle: `volumeClaimTemplates` are immutable, so
growing the disk meant patching the live PVC and recreating the
StatefulSet with `--cascade=orphan`.

The sharpest operational edge: conversation transcripts and metadata live
on the *same* volume as the session workspaces. One runaway
`node_modules` could break persistence for every conversation, not just
its own. That's why a **janitor sidecar** now reclaims workspaces idle
for two hours, checking every five minutes. Its design details matter:

- It only exempts conversations the agent-server reports as *actively
  running* — a neighbouring cleanup job that exempted anything a user
  "might resume" had reclaimed exactly nothing.
- Idleness is max(directory mtime, newest conversation event), so
  someone reading results for hours doesn't lose their workspace
  mid-conversation.
- The TTL is clamped to a minimum of five minutes in code, so a typo in
  an env var can't turn the janitor into an immediate
  delete-everything loop.
- The dry-run flag defaults to off, deliberately: a permanently dry
  janitor is just the do-nothing reaper again.

## UX

The property that mattered most for a *remote* coding agent framework:
**conversations are pausable and resumable, and they survive everything.**
The agent loop runs server-side, state and workspaces persist on the PVC
across pod restarts and image upgrades, and runs can be paused, resumed,
and forked. I can kick off a task, close the laptop, get the Slack ping,
and pick the conversation back up from where it stands — the exact thing
the local setup couldn't do. Most of the UI leans on this one property.

What a typical session actually feels like:

![A session from the person's point of view — clarify, walk away, get pinged, review, merge](/blog/how-openhands-was-integrated/session-journey.svg)

The portal offers two front doors: an embed of the full upstream UI (file
browser, VS Code, settings — everything, for free) and a **native
conversation UI** for the day-to-day loop:

```text
 ┌─ conversations ──┬─ conversation ──────────────────────┬─ inspect ─────---┐
 │                  │ repo picker ▾          model chip ▾ │ Files            │
 │ 🟢 fix login bug │─────────────────────────────────────│   src/auth/…     │
 │    running…      │ agent: cloned repo…          14:02  │   package.json   │
 │                  │ agent: running tests…        14:07  │                  │
 │ ✅ update docs   │ you:   also update the docs  14:11  │ Changes          │
 │    finished      │ agent: final response ✓      14:19  │   +42 −7 (3 f)   │
 │                  │                                     │                  │
 │ ⏸️ retry flaky   │                                     │ Terminal (ro)    │
 │    paused        │                                     │   $ npm test …   │
 │                  │                                     │                  │
 │ ✅ bump deps     │                                     │ Tasks            │
 │    finished      │                                     │   [x] clone      │
 │                  │                                     │   [x] tests      │
 │ [+ new session]  │─────────────────────────────────────│   [ ] docs       │
 │                  │ prompt…    [pause] [resume]  ▓▓░ 61%│ Skills           │
 └──────────────────┴─────────────────────────────────────┴───────────────---┘
```

The native UI accumulated:

- A chat-style transcript with timestamps, a wrap toggle, and correct
  rendering of the final agent response in long conversations (a
  pagination edge case).
- The agent's task list and activated skills rendered inline, so you can
  see *how* it's approaching the work, not just the output.
- A searchable repo picker with staged selection and pinned
  repositories, so the most-used targets surface first.
- A model chip showing what's running, plus **per-message model
  switching** — change models mid-conversation instead of restarting.
- Conversation-scoped **Files** and **Changes** tabs, resolved from the
  conversation's actual working directory.
- A live disk-usage bar for the shared volume, so users can see when the
  workspace is filling up before it becomes everyone's problem.
- A suggested-issues feed of open, unassigned GitLab issues — a "what
  should I hand the agent next?" prompt.

One UX lesson came from deletion: a "Plan mode" (agent proposes before
acting) and live mode-switching shipped, proved unreliable in practice,
and were removed. A control that only sometimes works is worse than no
control.

## Quick build shortcuts

The whole thing shipped fast because of a handful of deliberate
shortcuts:

- **The auto-approved config path.** The entire deployment lives in the
  one values file that needs no human review — no shared chart, RBAC, or
  network-policy changes anywhere.
- **The all-in-one image.** No sandbox orchestration, no Docker socket,
  no per-conversation container lifecycle to manage.
- **Sidecars reuse the agent image.** The notifier and janitor need a
  Node runtime; the agent image already has one. Zero extra images to
  build or pull.
- **Scripts mount from ConfigMaps.** Changing the notifier or janitor is
  a values-file edit and a sync — no image build, no registry.
- **Iframe the upstream UI.** The full OpenHands frontend (file browser,
  VS Code, settings) came for free as an embed while the native UI grew
  incrementally beside it.
- **Everything over REST.** Settings, secrets, conversations — all
  scriptable, so the local bootstrap, the deployment's MCP registration,
  and the BFF all drive the same API.
- **Accept single-tenancy.** Building real multi-user tenancy would have
  meant enterprise features or per-user instances. An email allowlist
  and a written-down tradeoff shipped instead.
- **Poll, don't stream.** The native UI polls every 3 seconds instead of
  managing WebSocket state. The bounded caches in the BFF make this
  cheap; boring beats clever here.

## Betting on open source

Part of why I picked OpenHands is that it's open source: free to run,
MIT-licensed, and improving underneath me whether I do anything or not.
The numbers back that up (as of August 2026): the main repo has **~84k
stars, ~11k forks, and 500+ contributors**, with 100+ commits merged in
the past month. It launched in March 2024 and shipped three minor
releases in a single week while I was deploying — I pinned one version
and it was superseded within days.

The risk I'm carrying is that the community may not be large enough
*where it counts*. The headline repo is huge, but the newer agent-server
stack my deployment actually builds on is under a year old and sits
around **1k stars** — a much thinner slice of that community. And the
features I had to build myself (notifications, tenancy) are exactly the
ones reserved for the paid tiers, which is a reasonable business model
but means the OSS surface I depend on gets the least commercial
attention. If the project's momentum ever concentrates fully on the
hosted product, I own more of this stack than I'd like.

## Historical phases

The themes above were built in this order:

```text
 local eval   →   shared deploy   →   native UI/BFF  →  capacity &   →  polish
 (~$3/run)        (StatefulSet)       (key stays        cleanup         (models,
                                       server-side)     (200Gi,          CLI,
                                                         janitor)        UX)
```

1. **Local evaluation** — bootstrap script, runbook, Slack notifier, the
   $2.81 measured run.
2. **Shared deployment** — StatefulSet + oauth2-proxy. *Mistakes:* the
   notifier targeted the wrong API surface; oversized session cookies
   431'd at the upstream; introducing the stable API key silently broke
   the sidecar's file-based auth.
3. **Native UI + BFF.** *Mistake:* every conversation initially shared
   one working tree — concurrent agents collided. Per-conversation
   workspaces should have existed from day one. Also shipped, then
   deleted, an unreliable Plan mode.
4. **Capacity & cleanup.** *Mistake:* resources and disk were both
   undersized and fixed reactively — compute after OOM kills, disk at
   84% full, and the janitor only after the volume had once hit 94% and
   been cleared by hand.
5. **Polish** — per-message model switching, a local CLI for driving
   deployed conversations, transcript fixes, pinned repos.

## Future

Things I want to build next, roughly in order of pull:

- **A Slack bot that carries the conversation.** The Slack notifier is
  one-way today: it pings, you walk to a laptop. A custom bot that relays
  full conversations into Slack threads would make the agent genuinely
  steerable from a phone — reply in the thread, the agent gets the
  message. The nuances are real, though: mapping thread replies to
  conversation state needs careful command design (free text vs.
  explicit commands, who in a shared channel is allowed to steer which
  session), and company phone-access policies limit what can be exposed
  to a mobile Slack client in the first place.
- **Browser and terminal in the sidebar.** The feasibility docs already
  exist; the read-only terminal history shipped. The next step is a live
  (but still carefully scoped) terminal view and a browser pane beside
  the transcript, so watching the agent test a web page doesn't require
  the full upstream embed.
- **Cost tracking per user.** One shared LLM key means one shared bill.
  Attributing token spend per conversation and per user would make the
  $2.81-per-task math visible continuously instead of only during
  evaluations — and make it obvious when a runaway session is burning
  money.
- **Smarter caching for repeated repos.** Most conversations clone the
  same handful of repositories, and each clone plus `npm install` costs
  ~2GB and real minutes. A shared read-through cache — reference clones
  or a warm object store the per-session workspaces derive from — would
  cut both startup latency and the disk pressure that motivated the
  200Gi volume and the janitor in the first place.

## Takeaways

1. **Docs-first cadence.** Every stage began or ended with a runbook or
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
