---
title: "Running Parallel Coding Agents with a Manager and Workers"
description: "Orchestrate one manager session and several autonomous workers across Git worktrees, with configurable autonomy and draft-PR review gates."
updatedAt: "2026-08-13"
publishedAt: "2026-08-12"
audience: "Engineers who already use a coding agent and want several tasks moving at once without losing review control."
tags:
  - AI
  - workflow
  - git
---

# Running Parallel Coding Agents with a Manager and Workers

This guide describes a repeatable way to run several coding agents at the same time: one long-lived **manager** session that plans and coordinates, and several **worker** sessions that implement in isolation.

It is written as a procedure you can follow, not a trip report. The examples use [OpenCode](https://opencode.ai) and [cmux](https://cmux.dev), but the pattern only requires an agent CLI that can resume a session, plus Git worktrees. A later chapter lists substitutes for every cmux-specific convenience.

Two worked examples run through the guide: a batch of five feature issues delivered in parallel, and a security-hardening batch driven by a manager review.

## What you get

- Several tasks progressing at once, each in a visible session you can inspect.
- A single place (the manager) that holds the dependency graph and review queue.
- Per-task control over how much autonomy each worker has.
- Work that survives closed terminals, because sessions are resumable.
- Merge authority that stays with you.

## What this is not

- Not a way to skip review. Every change still lands through a pull request you approve.
- Not a fit for one ambiguous task. If the work cannot be split, a single supervised session is better.
- Not free. Each worker consumes disk, CPU, ports, and CI capacity.

## Prerequisites

- A Git repository you can branch from.
- An agent CLI that supports non-interactive runs and session resume. This guide uses `opencode run` and `opencode run --continue`.
- Enough disk and memory for one dependency install per worker.
- A terminal setup that keeps several sessions visible. cmux workspaces are used here; tmux windows work too.

## Concepts

A **manager** is an interactive agent session that never writes feature code. It decomposes work, writes worker contracts, launches workers, monitors them, reviews handoffs, and coordinates branch order.

A **worker** is an agent session scoped to exactly one task. It owns a branch, a worktree, a port, and a conversation. It implements, tests, commits, and hands back a reviewable artifact.

A **contract** is the prompt file a worker is launched with. It is the control plane: ownership, gates, autonomy level, escalation rules, and the expected handoff all live there.

![One manager session coordinates five visible worker sessions. Each worker has an isolated worktree and cmux workspace, then hands a draft pull request and test evidence back through the manager to a human merge gate.](/guides/manager-worker-agents/orchestration-map.svg "The manager owns planning and coordination; workers own isolated implementation; the human owns merge.")

## The isolation model

Give every worker four boundaries. Skipping any one of them is the usual cause of parallel work going wrong.

| Boundary | Mechanism | Prevents |
| --- | --- | --- |
| History | One branch per task | Interleaved commits |
| Files | One Git worktree per task | Concurrent edits to the same checkout |
| Runtime | One dev-server port per task | Port collisions and confusing previews |
| Context | One agent session per task | Mixed conversations and lost task memory |

## How to read this guide

Chapters 1 through 3 are the core procedure. Chapter 4 explains when to prefer this over subagents. Chapter 5 is a worked case study of parallel remediation after a review. Chapters 6 and 7 cover failure modes and the reusable templates.
