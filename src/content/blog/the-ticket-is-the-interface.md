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

AI coding tools are often presented as better autocomplete or as autonomous engineers. Neither framing quite captures the workflow I find most useful.

The best collaboration I have had with an AI did not begin and end with a prompt. It used a real engineering ticket as shared memory, a planning document, a progress tracker, and a boundary between automated work and human decisions. The AI explored the codebase, prepared draft merge requests, ran tests, updated the ticket, and labeled everything that still required a person.

The ticket became the interface between us.

## TL;DR

- Use the ticket as durable project state, not the chat transcript.
- Spend time in an active planning loop with the AI before initiating most merge requests.
- Let the AI execute reversible work: code, tests, draft MRs, documentation, and issue updates.
- Keep irreversible work human-controlled: secrets, admin actions, cutovers, deployments, and final merges.
- Prefix open tasks with visible ownership such as `[MR !123]`, `[MANUAL]`, `[VALIDATION]`, or `[BLOCKER]`.
- Revisit the plan whenever MR review reveals that the original decomposition was wrong.

## Three phases of collaboration

![A three-phase human and AI workflow showing a planning loop around a shared ticket, parallel AI execution, a review loop, and human-controlled release gates.](/blog/ticket-interface/three-phase-workflow.svg "The engineering ticket remains the shared source of truth through planning, execution, review, and release.")

### 1. Shape the work

The first phase is an active loop between the human, the AI, and the WIP issue. The AI explores the repository and documentation. The human clarifies intent, constraints, and risk. Together they refine the target state, decide which tasks belong in separate MRs, and identify manual gates.

This phase should take longer than a single planning prompt. Good decomposition prevents five technically valid MRs from combining into an unsafe rollout.

### 2. Execute

Once the shape is stable, the AI can work more independently. It implements code, adds tests, prepares draft MRs, records CI evidence, and updates the issue. Several bounded changes may proceed in parallel.

The issue remains central. It records what is ready, what depends on something else, and what has not actually happened yet.

### 3. Review and steer

Human review produces another loop. The AI edits MRs, reruns tests, and updates the ticket. More importantly, review may reveal that the plan itself was wrong. In that case the workflow returns to Phase 1 rather than forcing every discovery into the existing MR structure.

Only when the work is ready should it pass through manual gates into merge, deployment, and environmental validation.

## The ticket is shared project state

Chat is useful for steering. It is a poor long-term project tracker.

Important facts become scattered across messages: what shipped, which change depends on another, which tests passed, what is intentionally blocked, and which actions require production access. Other engineers cannot easily review that state, and a future AI session may not have it.

A good ticket externalizes the state. I have found this structure useful:

- **Goal** - the outcome in plain language.
- **Target state** - what the finished system should look like.
- **Already shipped** - facts that should not be rediscovered.
- **Gates** - behavior, runtime readiness, production preparation, cutover, and cleanup.
- **Merge sequencing** - what can land independently and what must wait.
- **References** - relevant code, docs, runbooks, and related tickets.

The issue description holds the current model. Comments form an activity log. Draft MRs hold reviewable implementation. CI provides automated evidence. Manual steps stay visible.

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

## What changed as we used the workflow

In one recent project, I asked an AI to prepare several draft MRs for a production migration. The boundaries were explicit: prepare and test the work, keep the issue updated, but do not merge, deploy, write production secrets, or activate traffic.

The AI read the architecture documentation before editing. It inspected existing behavior, created focused commits, ran targeted and full test suites, rendered deployment templates, opened drafts, and recorded dependencies and safety notes.

Afterward, I noticed that many issue checkboxes were still open. That was correct. A checkbox saying "validate production behavior" should not close because a unit test passed. A task saying "add a production secret" should not close because the application now expects it. Draft code is not the same as an achieved outcome.

I then asked for each applicable checkbox to reference the MR that would complete it. Finally, I moved ownership to the front of every task. That small formatting change made the ticket dramatically easier to scan.

## Three operating rules

### 1. Put ownership before the task

A long checklist becomes difficult when the reader must parse every sentence before learning who can act on it.

| Prefix | Meaning |
| --- | --- |
| `[MR !123]` | Merging this draft should complete the item |
| `[DEPLOYMENT MR !456]` | The implementation is in deployment configuration |
| `[MANUAL VALIDATION]` | Evidence must come from a real environment |
| `[MANUAL VAULT]` | A secret-store operation is required |
| `[BLOCKER / MR NEEDED]` | No safe implementation exists yet |
| `[MR !789] + [FOLLOW-UP]` | The draft handles only part of the outcome |

The prefix is a compact execution contract. It also stops the AI from treating every open task as code work.

### 2. A checkbox represents truth, not effort

The normal progression is:

```text
planned -> drafted -> reviewed -> merged -> deployed -> validated -> observed
```

These are different states. The wording of the checkbox determines when it becomes true.

If a task says "implement direct access," merging an MR may complete it. If it says "validate direct access in production," a merge cannot complete it. If it combines configuration and latency targets, the MR may satisfy only the first half.

A useful rule is:

> Link an MR to a checkbox only when merging it will make the whole statement true. Otherwise label the remaining manual, validation, or follow-up work.

### 3. Draft MRs are preparation boundaries

Draft MRs give the AI a concrete output while preserving human control. They can contain implementation, tests, dependencies, rollout assumptions, blockers, and explicit "do not merge" conditions.

A draft deployment MR can prepare an exact cutover without activating it. A cleanup MR can remain stacked behind the cutover until the observation period is healthy.

The AI should generally own reversible preparation. Humans should control irreversible transitions.

| AI can usually prepare | Human should usually control |
| --- | --- |
| Code, tests, docs, and draft MRs | Final merge and production deployment |
| Issue updates and dependency mapping | Secret writes and admin actions |
| Rendered manifests and verification plans | Cutover timing and rollback decisions |
| Follow-up edits from review | Acceptance of real-world evidence |

## A five-step playbook

### 1. Write the issue for execution

Capture the goal, target state, constraints, gates, sequencing, and references. Separate implementation from production operations.

### 2. Define authority boundaries

Tell the AI what it may complete and what it must only prepare. For example:

```text
Prepare draft MRs and update the issue.
Do not merge, deploy, modify production secrets, or perform admin actions.
Run tests and include verification evidence.
```

### 3. Stay in the planning loop until the decomposition is credible

Let the AI explore first. Challenge assumptions, split unsafe combinations, and identify blockers before implementation fans out.

### 4. Let the AI execute end to end

Within the approved boundary, it should implement, test, review its diff, commit, push, open drafts, and update the issue. This can happen in a local worktree or a remote isolated container; the ticket remains the shared handoff surface.

### 5. Review, revise, and gate

Use MR review to improve both code and plan. If review changes the architecture or rollout assumptions, return to Phase 1. When the drafts are ready, perform the manual steps in sequence and record evidence back in the issue.

## Guardrails

Three failure modes are worth watching:

- **The AI updates comments but not the checklist.** Comments preserve history; the description must still reflect current state.
- **Draft is mistaken for safe to merge.** A draft may contain activation values. Put warnings in the title and at the top of the MR.
- **Tests are mistaken for environmental validation.** Unit tests, rendered manifests, staging evidence, and production observation are different claims.

## Conclusion

The biggest improvement was not a better model or a longer prompt. It was making the collaboration inspectable.

The AI could move quickly because it had permission to execute reversible work. I retained control because the issue showed what was prepared, what remained manual, what was blocked, and when the plan needed revisiting.

The chat can disappear. The work should still make sense.
