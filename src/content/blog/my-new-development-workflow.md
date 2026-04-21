---
title: "My New Development Workflow"
description: "A per-task development flow built around AI agents, snippets as the handoff format, and clear review steps."
publishedAt: "2026-04-21"
tags:
  - workflow
  - AI
  - coding-agents
  - developer-tools
  - code-review
---

# My New Development Workflow

Working with AI coding agents every day has quietly reshaped how I actually move through a piece of work. The old mental model — "open a ticket, write code, open a PR" — still exists, but the steps between those bookends look very different when an agent is in the loop.

This is the flow I keep landing on. I have tried to generalize it, but it will never fully generalize. You can move steps around as long as the output still lands in the same place: high-quality code, clear documentation, and a well-optimized balance of planning and implementing with the AI.

One shift worth naming up front: **I now design and implement per task, not just per project.** The unit of "think before you code" used to be the whole project. Now it is every meaningful task inside that project, because the cost of a quick design pass has collapsed.

## Flow diagram

At a glance, the whole thing looks like this:

```
             ┌──────────────────────────────────────┐
             │ 1. New branch/worktree + empty MR    │
             └───────────────────┬──────────────────┘
                                 │
                                 ▼
             ┌──────────────────────────────────────┐
             │ 2. Notes                             │◀─┐
   ┌────────▶│    • Jira/Notion notes               │  │
   │         │    • Plan → push snippet/gist        │  │
   │         │    • If long-lived: save to MR/repo  │  │
   │         └───────────────────┬──────────────────┘  │
   │ revise                      │                     │
   │ plan                        ▼                     │
   │         ┌──────────────────────────────────────┐  │
   └─────────│ 3. Implement + review commits        │  │
             │    • AI milestones/tasks             │  │
             │    • Modify plan as you go           │  │
             │    • Reorganize commits              │  │
             └───────────────────┬──────────────────┘  │
                                 │                     │ iterate
                                 ▼                     │
             ┌──────────────────────────────────────┐  │
             │ 4. Review flow: humans + AI + CI/CD  │──┘
             └───────────────────┬──────────────────┘
                                 │
                                 ▼
             ┌──────────────────────────────────────┐
             │ 5. Manual verification checklist     │
             └───────────────────┬──────────────────┘
                                 │
                                 ▼
             ┌──────────────────────────────────────┐
             │ 6. Done                              │
             └──────────────────────────────────────┘
```

## The flow

1. **Create a new branch/worktree and push an empty MR.**

   The empty MR is the anchor. It gives me a place to drop links, screenshots, and notes as I go, and it gives reviewers (human or agent) a stable URL to watch.

2. **Notes.**

   1. Add notes in Jira or Notion.
   2. Go through the implementation planning phase and push a **snippet/gist** to review on.
   3. If you need this spec to maintain your project in perpetuity, then save it to the MR and save it in the repo itself.

3. **Implement AI milestones/tasks and review the commits.**

   Run the plan with the agent, modifying it as needed as you go — plans are cheap now, so the point is to keep the spec and the code in sync, not to preserve the original plan as a trophy. Once the code is in, review the commits and reorganize them if needed. I wrote a separate piece on the cleanup step, because it is its own small skill: [How to Reorganize Merge Request Commits](https://leoncheng.dev/blog/reorganizing-mr-commits). A clean commit history makes review dramatically easier, and agents are now good enough at this step that it is worth doing every time.

4. **Review flow using humans and AI review comments and CI/CD.**

   Let the pipelines and review bots do their first pass. Triage their comments before pulling a human in. By the time a teammate opens the MR, most of the obvious stuff is already addressed.

5. **Go through a checklist of manual verification steps.**

   Screenshots, click-throughs, log checks — the things that automation still cannot fully close the loop on. Attach the evidence to the MR so future-me (and reviewers) do not have to take my word for it.

6. **Done!**

## The design file

The step that changed the most in this flow is the design file — the living document that captures what you're doing, why, and what the agent needs to know. With an agent in the loop, the context around a feature (plans, prompts, repros, screenshots, decisions, open questions) gets generated in volume as a side-effect of the work. That context needs a home, and chat history isn't it — chat is ephemeral and invisible to the next session.

The format doesn't matter much. A GitLab snippet or GitHub gist, a Jira ticket, a Notion page, a Markdown file in the repo — any of these work. What matters is that the design file is **linkable** (one URL you can drop into the MR, a ticket, or another agent's prompt), **writable** (you, a teammate, or an agent can update it), and **durable** (it outlives the chat session it was born in).

Pick whichever one fits the task. Snippets and gists are cheapest for throwaway plans and repros. Jira or Notion fits when the design needs to live alongside product context. A Markdown file in the repo is right when the spec needs to be maintained in perpetuity with the code.

Don't overthink the first version. The whole point is that editing it later is free.

## Other tidbits

### Images in GitLab MR comments

In GitLab, when you post images as MR comments, they take up way too much space and make the MR hard to read. This is a UX problem. You can solve this, for example, by forcing images into tables in Markdown so that the images take up less space and can still be zoomed into. It is a small thing, but on a screenshot-heavy review it makes the difference between a readable thread and a scroll marathon.

### Playwright MCP setup is per-repo work

In order to set up screenshots, you may need something like Playwright MCP. However, depending on your repository, it may be complicated to even run — for example if it has to be launched through Docker, or if the dev server has unusual startup requirements. So all of that needs to go into your agent instructions per repository in order to function reliably.

An example snippet of what good agent instructions for screenshot capture can look like lives here: [git.deepl.dev/-/snippets/553](https://git.deepl.dev/-/snippets/553).

The broader point is that your agent's reliability is only as good as the per-repo context you give it. Generic instructions produce generic results. A few paragraphs pinned into `AGENTS.md` (or the equivalent for your tool) is usually the difference between an agent that can take a screenshot and one that silently gives up.

## Closing thought

None of the individual pieces here are revolutionary. Branches, MRs, snippets, checklists, screenshots — we have had all of these for years. What changed is that an AI agent in the loop makes the glue between them matter more than the pieces themselves. The workflow *is* the product now. Good agents plus a sloppy workflow still produce sloppy output. A clean workflow plus even mediocre agents produces surprisingly good work.

So the investment is worth it. Figure out your version of this flow, pin it somewhere linkable, and keep editing it.
