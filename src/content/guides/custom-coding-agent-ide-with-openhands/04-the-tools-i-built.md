---
title: "The tools I built"
description: "A catalogue of what the control plane actually adds on top of a stock agent — one line and one sketch each."
part: "Build"
---

# The tools I built

None of this is the agent loop; OpenHands does that. These are the surfaces built around it, and together they are the reason the app is worth running at all.

**Plan mode.** Start read-only. The agent researches and proposes; the first write parks the run until I approve, and approving flips the same conversation to Build without restarting it.

```text
read → read → write? ──► waiting_for_confirmation ──► approve ──► build
```

**Turn reminders.** Standing instructions appended to every message I send, so rules like "cite file:line" survive a long transcript instead of decaying as history is condensed.

```text
my message ──┐
             ├─► agent   (suffix rides beside the text, never rewrites it)
reminders ───┘
```

**Manager runs.** One conversation plans waves of work and launches parallel workers, each on its own branch. Judgement lives in the model; wave caps, validation, and phase tracking live in ordinary code.

```text
manager ──► wave 1 ──► worker · worker · worker ──► draft PRs
```

**Skill toggles.** One list of every skill the agent can load, with an on/off that sticks — including the auto-loaded ones, which otherwise cannot be turned off at all.

```text
installed ─┐
public   ──┼─► effective set ─── deny-list ──► agent
user     ──┘
```

**Settings that actually reach a run.** The stock server does not merge your saved profile into a new conversation. The backend forwards it explicitly, through an allow-list so masked secrets never get copied.

```text
saved profile ──► allow-list ──► every new conversation
```

**Context tuning.** How early history gets summarised is exposed as a setting, because the default only triggers on event count and long sessions crawl.

```text
history grows ──► threshold ──► condense ──► cheaper turns
```

**Live preview proxy.** The agent starts a dev server inside the container; I open it same-origin at a conversation-scoped URL, with no port published per task.

```text
agent's dev server :2xxxx ──► BFF proxy ──► /conversations/<id>/preview
```

**Project grid and worktrees.** The home screen is my real folders, not a blank prompt, and a task defaults to its own detached worktree so parallel agents cannot collide.

```text
main checkout ─┬─ session A → feat/a
               ├─ session B → fix/b
               └─ session C → docs/c
```

**Command palette.** Cmd/Ctrl+K over pages, docs, and every conversation. Hand-rolled, no new dependency.

```text
⌘K ──► rank(title-prefix > word-prefix > substring) ──► jump
```

**Three notification channels.** Finished, error, stuck, and needs-input, delivered as a phone push, a chime, or a desktop banner that deep-links back into the conversation.

```text
run event ──┬─► push (phone)
            ├─► chime (tab)
            └─► banner (OS)
```

**Phone access.** One flag on the dev script detects the tailnet name and opens the same app to a phone; execution never leaves the laptop.

```text
phone ──tailnet──► same BFF ──► agent on my machine
```

**One-command install.** The packaged build puts the UI, the backend, and the agent container behind a single browser port, so Docker is the only prerequisite. Still beta.

```text
install.sh ──► app container + agent container ──► one port
```

Behind those sit the smaller things that only matter once you live in the app: a read-only command audit with a `.sh` export, live token streaming with bounded reconnects, a pull-request panel with pipeline state, disk usage, per-tab identity so a wall of sessions stays readable, and a watcher that re-attaches conversations orphaned by a restart.

Put together, one pass through the app looks like this:

![A screen recording of the custom OpenHands IDE running in a desktop browser.](component:desktop-tour)
