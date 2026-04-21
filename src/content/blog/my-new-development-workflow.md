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
             │    (screenshots, click-throughs)     │
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

## Snippets as the unit of AI-assisted development

This is the part of the workflow that changed the most, and it deserves its own section.

### The shift

AI-assisted development has quietly changed what "doing the work" looks like. The artifact you produce during a feature is no longer just the final diff — it's the decision chain, the prompts, the rejected designs, the verification evidence, the things you almost did and backed out of. That context used to live in a developer's head and leak out gradually through commit messages and PR descriptions. With an agent in the loop, that context is now *generated* as a side-effect of doing the work, and it's generated in volume.

The question becomes: where does it live?

The wrong answer is "in chat history." Chat is ephemeral, unaddressable, and invisible to anyone — or any agent — not already in the conversation. The next session starts cold.

The right answer is: **put it somewhere with a URL.**

### Snippets are the breakthrough

A gist or GitLab snippet is the smallest thing that solves this. It's:

- **Linkable.** One URL. Drop it in a Jira ticket, an MR description, another agent's prompt. Done.
- **Writable from anywhere.** You, a teammate, or an agent can paste into it.
- **Durable.** It outlives the chat session it was born in.
- **Cheap.** No repo, no branch, no review, no ceremony. Create it in ten seconds.
- **Scoped.** One snippet per concern. A plan is one snippet. A bug repro is another. A transcript of a useful agent conversation is another.

None of this is new technology. What's new is the *workflow pressure* that makes it load-bearing. When your agent can ingest a URL and be immediately productive, a snippet stops being a scratchpad and starts being the handoff format.

### What belongs in a snippet

- **Plans and design docs** before they're worth committing to a repo.
- **Prompts that worked** — the exact wording that got the agent to do the thing.
- **Repro steps, failing queries, log excerpts** that you'll want to paste back at the agent tomorrow.
- **Screenshots** — before/after UI states, bug repros, verification evidence. The Playwright MCP server makes this nearly free: ask the agent to navigate the app, capture the relevant view, and attach the image to the snippet. Visual context that used to require a human in the loop can now be orchestrated end-to-end by the agent.
- **Transcripts worth keeping** — the specific agent conversation that unlocked a tricky piece of the problem.
- **Decision logs** — "we considered X, picked Y because Z."
- **Open questions** you need to resolve before writing code.

### Live-edit notes are fine

These live-edit notes can be a running list and do not have to be perfect yet. The whole point of a snippet is that the cost of editing it later is zero, so there is no reason to stall on making the first version good. Paste, iterate, link.

## Other tidbits

A couple of smaller lessons I have picked up while running this flow day to day.

### Images in GitLab MR comments

In GitLab, when you post images as MR comments, they take up way too much space and make the MR hard to read. This is a UX problem. You can solve this, for example, by forcing images into tables in Markdown so that the images take up less space and can still be zoomed into. It is a small thing, but on a screenshot-heavy review it makes the difference between a readable thread and a scroll marathon.

### Playwright MCP setup is per-repo work

In order to set up screenshots, you may need something like Playwright MCP. However, depending on your repository, it may be complicated to even run — for example if it has to be launched through Docker, or if the dev server has unusual startup requirements. So all of that needs to go into your agent instructions per repository in order to function reliably.

An example snippet of what good agent instructions for screenshot capture can look like lives here: [git.deepl.dev/-/snippets/553](https://git.deepl.dev/-/snippets/553).

The broader point is that your agent's reliability is only as good as the per-repo context you give it. Generic instructions produce generic results. A few paragraphs pinned into `AGENTS.md` (or the equivalent for your tool) is usually the difference between an agent that can take a screenshot and one that silently gives up.

## Closing thought

None of the individual pieces here are revolutionary. Branches, MRs, snippets, checklists, screenshots — we have had all of these for years. What changed is that an AI agent in the loop makes the glue between them matter more than the pieces themselves. The workflow *is* the product now. Good agents plus a sloppy workflow still produce sloppy output. A clean workflow plus even mediocre agents produces surprisingly good work.

So the investment is worth it. Figure out your version of this flow, pin it somewhere linkable, and keep editing it.
