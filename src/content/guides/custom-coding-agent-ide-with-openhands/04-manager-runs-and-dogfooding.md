---
title: "Manager runs and the self-development loop"
description: "How deterministic orchestration coordinates normal OpenHands workers—and how the IDE improves itself."
part: "Operate"
---

# Manager runs and the self-development loop

The optional manager-runs feature adds a second loop above ordinary conversations. A manager conversation plans and makes decisions; deterministic application code launches and monitors workers.

```text
                         ┌─ worker 1 ─► branch ─► draft PR
 you ◄──► manager ◄──► executor ─ worker 2 ─► branch ─► draft PR
                   ▲     + monitor └─ worker 3 ─► branch ─► draft PR
                   │          │
                   └── derived state + validated results
```

The manager does not receive magical in-memory handles to workers. It emits a small command vocabulary. The server validates each command, starts ordinary OpenHands conversations, polls their actual state, and records the run in Postgres.

## Probabilistic decisions, deterministic mechanics

The split is deliberate:

| The manager model decides | Regular code enforces |
| --- | --- |
| How to split the work | Valid command schema |
| When a worker needs a nudge | Repository and model allowlists |
| Whether to inspect a transcript | Worker caps and wave gates |
| What summary to give the user | Durable run, worker, and activity records |
| When the plan is complete | Completion requirements and real PR/MR state |

A worker's phase is derived from evidence such as conversation status, pushed branches, and open pull requests. The system does not treat “I opened a PR” in model text as authoritative.

Manager runs are optional because they add a database and a large amount of state-machine behavior. Without `PGHOST`, the feature fails closed and the rest of the IDE works without Postgres.

## Workers are normal conversations

That is a useful invariant. A worker can be opened in the same conversation interface as any other task. It has the same transcript, files, changes, commands, preview, lifecycle controls, and follow-up messages.

The run board is an aggregate view, not a second execution system:

```text
run board
  ├── manager conversation
  ├── worker conversations
  ├── derived phases
  ├── activity log
  └── PR/MR and CI state
```

This keeps the orchestration layer inspectable. If a worker is confused, I can read its actual transcript or steer it directly instead of trusting a summary from another model.

## Parallelism is not free progress

The server caps a wave at eight workers because every conversation shares one agent container and credential set. More workers mean:

- more simultaneous model spend;
- more branches and pull requests to review;
- more builds competing for CPU, memory, and disk;
- more chances for individually reasonable changes not to compose cleanly.

A one-manager/one-worker run is often valuable even without parallelism. The manager can stay focused on clarification and review while the worker keeps implementation context. That creates asynchronous delegation without pretending the human review obligation disappeared.

## The IDE can work on itself

The local-folder mode creates a tight dogfooding loop:

```text
use the IDE
    │
    ▼
notice friction in a real agent run
    │
    ▼
start an isolated session on the IDE repository
    │
    ▼
agent implements + tests + opens a PR
    │
    ▼
ship the improvement ──────────────► use the IDE again
```

That loop drove practical features: collision warnings, default worktrees, bottom-anchored transcripts, visible running activity, stream hardening, notification controls, model switching, long-context settings, mobile layout, and private-network access.

The self-development loop has one sharp edge. A shared-folder session edits the same files the live development server is serving, so a server change can restart the BFF under the conversation. Durable OpenHands events make recovery possible, but branch-based work should still happen in an isolated worktree.

## What manager runs are good for

Use them when:

- tasks have separable ownership boundaries;
- each worker can deliver a reviewable branch or pull request;
- the manager has explicit wave and completion rules;
- the review capacity exists to inspect parallel output.

Avoid them when the work is tightly coupled, the task is still ambiguous, or the main motivation is simply “more agents must be faster.”
