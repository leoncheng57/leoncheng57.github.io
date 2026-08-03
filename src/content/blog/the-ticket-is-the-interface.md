---
title: "The Ticket Is the Interface: A Better Way to Work With AI"
description: "Use an engineering ticket as shared project state for planning, AI execution, human review, and safe production gates."
publishedAt: "2026-08-03"
tags:
  - workflow
  - AI
  - coding-agents
  - teamwork
  - project-management
---

# The Ticket Is the Interface: A Better Way to Work With AI

My best AI coding sessions do not revolve around the chat. They revolve around the ticket.

I use the ticket as the plan, progress tracker, and handoff between me and the agent. The agent explores the codebase, prepares draft MRs, runs tests, and keeps the ticket current. I make the risky calls: secrets, cutovers, deployments, and final merges.

The chat can disappear. The ticket should still tell the whole story.

## TL;DR

- Treat the ticket as shared project state, not the chat transcript.
- Plan with the agent before opening a pile of MRs.
- Let the agent prepare reversible work. Keep production actions human-controlled.
- Put ownership at the start of every open task: `[MR !123]`, `[MANUAL]`, or `[BLOCKER]`.

## Two phases of collaboration

![A two-phase human and AI workflow showing a planning loop around a shared ticket, followed by execution, review, and human-controlled release gates.](/blog/ticket-interface/three-phase-workflow.svg "The engineering ticket remains the shared source of truth through planning, execution, review, and release.")

### 1. Shape the work

I ask the agent to explore the repository before proposing changes. Then we go back and forth on scope, risk, MR boundaries, and manual gates. This usually takes more than one prompt, and that is the point. A bad decomposition can produce five valid MRs that add up to an unsafe rollout.

### 2. Execute, review, and steer

Once the plan looks credible, the agent can implement, test, open draft MRs, and record evidence. Independent changes can run in parallel. The ticket keeps their dependencies and actual state visible.

Review is another loop, not a final stamp. I leave comments; the agent edits, reruns tests, and updates the ticket. If review exposes a bad plan, we go back to Phase 1 instead of cramming the discovery into the existing MRs.

Merge, deployment, and real-environment validation remain explicit human gates.

## The ticket is shared project state

Chat is useful for steering, but bad at holding project state. Dependencies, test results, blockers, and production steps get buried. Teammates cannot scan them, and the next agent session may not see them.

I keep the ticket simple:

- **Goal** - the outcome in plain language.
- **Target state** - what the finished system should look like.
- **Already shipped** - facts that should not be rediscovered.
- **Gates** - what must happen before merge, deployment, cutover, and cleanup.
- **Merge sequencing** - what can land independently and what must wait.
- **References** - relevant code, docs, runbooks, and related tickets.

The description holds the current plan. Comments hold history. Draft MRs hold implementation. CI holds automated evidence. Manual steps stay open until a person actually completes them.

## Example: a WIP GitLab issue

A useful WIP issue does not need to be long. It needs to expose state, ownership, and sequence.

```markdown
# Migrate the alert worker to the isolated runtime

Status: WIP

## Goal
Move production alert processing without losing updates, ratings,
operational controls, or rollback capability.

## Checklist
- [x] Existing behavior documented
- [ ] [MR !123] Add durable state and retry-safe writes
- [ ] [MR !124] Route primary work through the isolated runtime
- [ ] [DEPLOYMENT MR !456] Prepare production ingress and runtime values
- [ ] [MANUAL VAULT] Add the production signing secret
- [ ] [BLOCKER / MR NEEDED] Provide Kubernetes diagnostics in the worker
- [ ] [MANUAL VALIDATION] Verify one approved alert end to end
- [ ] [MR !125] + [FOLLOW-UP] Remove the legacy path after observation

## Merge sequencing
1. State and runtime changes can be reviewed in parallel.
2. Deployment must wait for the secret and app configuration.
3. Cleanup remains Draft until rollback is no longer required.

## Evidence
- Focused tests: passing
- Full suite: passing
- Deployment templates: rendered
- Production validation: not started
```

A reviewer can scan the left edge and immediately see what is implemented, what needs a human, and what has no solution yet.

## Three operating rules

### 1. Put ownership first

A prefix tells the reviewer who can act:

| Prefix | Meaning |
| --- | --- |
| `[MR !123]` | The draft completes this item |
| `[MANUAL]` | A person must act |
| `[VALIDATION]` | Real-environment evidence is required |
| `[BLOCKER]` | No safe implementation exists yet |

### 2. A checkbox represents truth, not effort

An MR may complete "implement direct access." It cannot complete "validate direct access in production." Split mixed tasks and leave the unfinished part open.

### 3. Draft MRs are preparation boundaries

The agent prepares code, tests, config, docs, and draft MRs. A person controls merges, secrets, deployments, cutovers, and acceptance of real-world evidence.

## Conclusion

The biggest improvement was not a better model or a longer prompt. It was making the work inspectable.

The agent moves quickly because it can own reversible preparation. I keep control because the ticket shows what is ready, what remains manual, and what is blocked.

The chat is temporary. The work is not.
