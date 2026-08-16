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

![A session, from idea to merged MR](component:session-storyboard)

OpenHands is one of the more exciting things to come out of the
open-source AI tooling wave: a fully autonomous coding agent — it clones a
repo, writes code, runs tests, and opens a merge request on its own — that
you can run yourself, MIT-licensed, no vendor in the loop. When I first
tried [OpenHands](https://docs.openhands.dev), a complete autonomous task
(clone → branch → edit → verify → commit → push → draft MR) took about
seven minutes and cost $2.81. That was enough to convince me it deserved
more than a laptop experiment.

OpenHands is a specific coding modality: an **interactive, sandboxed**
agent that I can watch, interrupt, clarify, and steer while it works.

This article is about how I built a custom tool that uses OpenHands for
cloud-run, interruptible agents.

## Table of contents

- [Architecture](#architecture)
- [Security](#security)
- [Ops](#ops)
- [UX](#ux)
- [Shortcuts Taken](#shortcuts-taken---hacky-today-build-fast-break-things)
- [Betting on open source](#betting-on-open-source)
- [Historical Timeline Phases](#historical-timeline-phases)
- [Future](#future)

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
Docker socket, no per-conversation containers. It runs 24/7 and does not
stop when I close my laptop, which is a key advantage of the remote setup.
Two sidecars (a Slack notifier and a workspace janitor) share the pod, and
everything durable lives on one PVC:

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

The native UI is a set of React pages backed by an Express
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
finish, merge — is a human-in-the-loop (HITL) agent workflow:

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

### Workspace isolation and bounded reads

**Per-conversation workspaces.** Initially every conversation shared one
working tree on the persistent volume — so concurrent agents collided.
The fix mints the conversation UUID in the BFF, hands it to OpenHands as
the conversation ID, and derives a durable per-session directory
(`sessions/<uuid>`) from it.

```text
 /home/openhands/
 ├── .openhands/                    conversations + metadata
 └── workspace/
     └── sessions/
         ├── <conversation-uuid-a>/ repo clone + build output
         ├── <conversation-uuid-b>/ repo clone + build output
         └── <conversation-uuid-c>/ repo clone + build output

 one PVC
 ├── persistent state shared by the service
 └── isolated working tree per conversation
```

**Bounded everything.** Nothing grows without bound just because a
browser polls it:

- Transcript reads paginate because the upstream agent-server rejects
  event pages larger than 100.
- The repo list is cached for five minutes.
- The conversation→working-dir scope cache has a TTL and a hard cap of
  256 entries with oldest-first eviction.
- The disk-usage probe is cached and deduplicated, so any number of
  polling browsers cause at most ~2 probes a minute.

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

### Capacity tuning

Real usage started sending capacity feedback, and each response was
driven by measured numbers rather than guesses:

| Resource | Before | Trigger | After |
| --- | --- | --- | --- |
| CPU / memory limits | 2 CPU / 4Gi | throttling and OOM kills during `npm install` / build / test | 8 CPU / 16Gi |
| Workspace volume | 20Gi | 84% full with just eight sessions (~2GB each — the clone is ~115MB; the bulk is `node_modules`) | 200Gi |

The volume resize had a wrinkle: `volumeClaimTemplates` are immutable, so
growing the disk meant patching the live PVC and recreating the
StatefulSet with `--cascade=orphan`.

### Janitor sidecar disk cleanup

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
## UX

The property that mattered most for a *remote* coding agent framework:
**conversations are pausable and resumable, and they survive everything.**
The agent loop runs server-side, state and workspaces persist on the PVC
across pod restarts and image upgrades, and runs can be paused, resumed,
and forked. I can kick off a task, close the laptop, get the Slack ping,
and pick the conversation back up from where it stands — the exact thing
the local setup couldn't do. Most of the UI leans on this one property.

What a typical HITL session feels like:

```text
 Person                 OpenHands              Slack              GitLab
   │ start + clarify       │                     │                   │
   ├──────────────────────►│                     │                   │
   │◄──── questions ──────►│                     │                   │
   │ "go"                  │                     │                   │
   ├──────────────────────►│ long server-side run│                   │
   │                       ├────────────────────►│ task summary      │
   │◄───────────────────────────────────────────┤ phone ping        │
   │ decide: steer again?  │                     │                   │
   ├──────── yes ─────────►│ continue work       │                   │
   │                       ├────────────────────────────────────────►│ draft MR
   │ review + verify + merge────────────────────────────────────────►│
   ├──────────────────────►│ close session       │                   │
   │                       │ janitor cleans workspace after ~2h idle │
```

The portal offers two front doors: an embed of the full upstream UI (file
browser, VS Code, settings — everything, for free) and a **native
conversation UI** for the day-to-day loop:

```text
 ┌─ conversations ────────┬─ conversation ───────────────────────────────┬─ inspect ──────────────┐
 │                        │ repo picker ▾                   model chip ▾ │ Files                  │
 │ 🟢 fix login bug       │──────────────────────────────────────────────│   src/auth/…           │
 │    running…            │ agent: cloned repo…                    14:02 │   package.json         │
 │                        │ agent: running tests…                  14:07 │                        │
 │ ✅ update docs         │ you:   also update the docs            14:11 │ Changes                │
 │    finished            │ agent: final response ✓                14:19 │   +42 −7 (3 files)     │
 │                        │                                              │                        │
 │ ⏸️ retry flaky         │                                              │ Terminal (read-only)   │
 │    paused              │                                              │   $ npm test …         │
 │                        │                                              │                        │
 │ ✅ bump deps           │                                              │ Tasks                  │
 │    finished            │                                              │   [x] clone            │
 │                        │                                              │   [x] tests            │
 │ [+ new session]        │──────────────────────────────────────────────│   [ ] docs             │
 │                        │ prompt…       [pause] [resume]  disk ▓▓░ 61% │ Skills                 │
 └────────────────────────┴──────────────────────────────────────────────┴────────────────────────┘
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

## Shortcuts Taken - hacky today, build fast, break things

The whole thing shipped fast because of a handful of deliberate
shortcuts:

- **The all-in-one image.** No sandbox orchestration, no Docker socket,
  no per-conversation container lifecycle to manage.
- **Sidecars reuse the agent image.** The notifier and janitor need a
  Node runtime; the agent image already has one. Zero extra images to
  build or pull.
- **Scripts mount from ConfigMaps.** Changing the notifier or janitor is
  a values-file edit and a sync — no image build, no registry.
- **Everything over REST.** Settings, secrets, conversations — all
  scriptable, so the local bootstrap, the deployment's MCP registration,
  and the BFF all drive the same API.
- **Accept single-tenancy.** Building real multi-user tenancy would have
  meant enterprise features or per-user instances. An email allowlist
  and a written-down tradeoff shipped instead.
- **Poll, don't stream.** The native UI polls every 3 seconds instead of
  managing WebSocket state. The bounded caches in the BFF make this
  cheap; boring beats clever here.

### OpenHands Canvas UI as Backup

The full OpenHands frontend (file browser, VS Code, settings) came for
free as an embed while the native UI grew incrementally beside it. It is
still available as a backup when the narrower native UI does not expose a
capability yet.

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

### Relevant OpenHands docs and repos

- [OpenHands documentation](https://docs.openhands.dev/)
- [Agent Canvas overview](https://docs.openhands.dev/openhands/usage/agent-canvas/overview)
- [OpenHands main OSS repository](https://github.com/OpenHands/OpenHands)
- [OpenHands software-agent SDK](https://github.com/OpenHands/software-agent-sdk)
- [Browser-use guide](https://docs.openhands.dev/sdk/guides/agent-browser-use)

## Historical Timeline Phases

The themes above were built in this order:

```text
 local eval   →   shared deploy   →   native UI/BFF  →  capacity &   →  polish
 (~$3/run)        (StatefulSet)       (key stays        cleanup         (models,
                                       server-side)     (200Gi,          CLI,
                                                         janitor)        UX)
```

1. **Local evaluation** — bootstrap script, runbook, Slack notifier, the
   $2.81 measured run.
2. **Shared deployment** — StatefulSet + oauth2-proxy.
   - **Mistake:** the notifier targeted the wrong API surface.
   - **Mistake:** oversized session cookies 431'd at the upstream.
   - **Mistake:** introducing the stable API key silently broke the
     sidecar's file-based auth.
3. **Native UI + BFF.**
   - **Mistake:** every conversation initially shared one working tree,
     so concurrent agents collided. Per-conversation workspaces should
     have existed from day one.
   - **Mistake:** I shipped, then deleted, an unreliable Plan mode.
4. **Capacity & cleanup.**
   - **Mistake:** compute was undersized and fixed after OOM kills.
   - **Mistake:** disk was resized reactively at 84% full, and the
     janitor arrived only after the volume had once hit 94% and been
     cleared by hand.
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
- **Keep improving the fundamentals.** I am still working on usability,
  efficiency, logging, and security improvements.

![OpenHands session lifecycle](component:session-storyboard)
