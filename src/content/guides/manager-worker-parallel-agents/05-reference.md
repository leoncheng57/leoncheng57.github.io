---
title: "Reference: contract template and checklists"
description: "Copy-paste worker contract, launch checklist, and review checklist."
part: "Reference"
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
- Worktree: <path>. Dev port: <port>.
- Commit/push after: <checkpoint>. Rebase rule: <rule>.

Evidence
- Run: <lint/tests/build>. Capture: <screenshots>.
- Report: PR, commits, checks, risks, remaining work.

Handoff
- Open a draft PR against <base>.
- Ask the manager to review <commits/scope/workload>.
- Apply manager feedback in this same session.
```

## Launch checklist

- [ ] Tasks split into waves, dependencies and PR bases decided
- [ ] One branch, worktree, port, session per task
- [ ] Contract written with ownership and escalation
- [ ] Autonomy chosen per task, matched by permissions
- [ ] Launch acknowledgment verified per worker

## Review checklist

- [ ] Draft PR opened before ready-for-review
- [ ] Commits separated, diff matches scope, evidence matches gates
- [ ] Dependent branches rebased onto current base
- [ ] Feedback routed into the owning session
- [ ] Human merge; worktrees removed after verification

## High-risk work checklist

- [ ] Manager review independent of CI status
- [ ] Findings triaged by severity, split by subsystem theme
- [ ] Explicit go/no-go gate defined and written down
- [ ] First live run staged from read-only to a small batch
- [ ] New findings queued as follow-up workers, not scope creep

## Related reading

- [Worktrees, Remote Coding Agents, and Choosing the Right Kind of Isolation](/blog/worktrees-vs-remote-coding-agents)
- [My cmux Setup for Parallel AI Coding](/blog/my-cmux-setup-for-parallel-ai-coding)
