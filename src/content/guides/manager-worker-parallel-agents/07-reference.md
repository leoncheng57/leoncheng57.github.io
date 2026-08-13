---
title: "Reference: contract template and checklists"
description: "Copy-paste worker contract, launch checklist, and review checklist."
---

# Reference: contract template and checklists

## Worker contract template

```text
Goal
- Deliver <issue> on branch <branch> from base <base>.

Ownership
- You own: <files/components>.
- Do not modify: <boundaries>.

Autonomy
- Mode: <supervised | checkpointed | draft PR | outcome-only>.
- Escalate only for: <conditions>.
- Never merge or run destructive Git commands.

Execution
- Worktree: <path>.
- Dev port: <port>.
- Commit and push after: <checkpoint>.
- Rebase rule: <rule for moving bases>.

Evidence
- Run: <lint/tests/build>.
- Capture: <screenshots/manual checks>.
- Report: PR, commits, checks, residual risks, remaining work.

Handoff
- Open a draft PR against <base>.
- Ask the manager to review <commits/scope/workload>.
- Apply manager feedback in this same session.
```

## Launch checklist

- [ ] Tasks split, dependencies ordered, stack bases chosen
- [ ] Integration order decided for batches that share a subsystem
- [ ] One branch, worktree, port, and session per task
- [ ] Contract written per worker, including ownership and escalation
- [ ] Autonomy level chosen per task and matched by permissions
- [ ] Launch command leaves the session resumable
- [ ] Launch acknowledgment verified for every worker

## Review checklist

- [ ] Draft PR opened before ready-for-review
- [ ] Commits logically separated
- [ ] Diff still matches the assigned scope
- [ ] Evidence matches the predeclared gates
- [ ] Dependent branches rebased onto the current base
- [ ] Feedback routed into the owning session
- [ ] Merge performed by a human
- [ ] Worktrees removed only after verification

## High-risk work checklist

Use in addition to the above whenever the result will touch real data or production systems.

- [ ] Manager review completed independently of CI status
- [ ] Findings triaged by severity, counts recorded
- [ ] Remediation split by subsystem theme
- [ ] Explicit go/no-go gate defined and written down
- [ ] First live run staged from read-only to a small batch
- [ ] Newly discovered work queued as follow-up workers

## Related reading

- [Worktrees, Remote Coding Agents, and Choosing the Right Kind of Isolation](/blog/worktrees-vs-remote-coding-agents)
- [My cmux Setup for Parallel AI Coding](/blog/my-cmux-setup-for-parallel-ai-coding)
