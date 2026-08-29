---
title: "The Cost of Waiting on Agents"
description: "Agent latency turns waiting into frustration, and frustration into context switching. A look at where that happens, what it costs, and the practices I am still experimenting with."
publishedAt: "2026-08-29"
estimateTimeToRead: 7
tags:
  - workflow
  - agents
  - mental-models
---

# The Cost of Waiting on Agents

Agent sessions changed the tempo of my work. A single instruction can take thirty seconds, or five minutes, or longer. That is fine in isolation. The problem is what I do with those minutes, and what those minutes do to me.

This post is not a finished answer. It is a set of frustrations I noticed in my own workflow, a few practices that have helped, and several questions I have not resolved.

## Where the waiting shows up

The same feeling turns up in a handful of different places.

**Waiting on a long run when I am ready to move.** I ask an agent to implement something reasonably large. I have already thought about the next step. The work is queued in my head and there is nowhere to put it.

**Waiting on research I need before I can decide anything.** I ask a question that requires reading several files. The answer determines what I do next, so I cannot start the next thing. I sit there watching tool calls.

**Waiting between questions in plan mode.** This is the one I fall into most often, and the one I like least. I ask a question. It takes more than a few seconds. Rather than wait, I ask a second question about a different topic in the same session. The first answer arrives and I ask a follow-up. Then the second answer arrives and I ask a follow-up to that. Now I am interleaving two conversations in one thread, switching topics every turn.

**Waiting on a subagent that turns out to need me.** I delegate something, mentally close the tab, and come back to a question I could have answered immediately if I had noticed it.

**Waiting on the parts that were always slow.** Builds, test suites, CI. These predate agents, but they now sit alongside agent latency and add to the same pile.

## The part that costs more than the time

The lost minutes are not the expensive part.

What actually happens is that the waiting produces frustration, and the frustration attaches itself to the task. The work stops feeling like the thing I wanted to do and starts feeling like the thing that is making me wait. That is a bad association to build, especially on work I chose.

Frustration then pushes me to do something else. Not deliberately, and usually not something useful. I check messages, open an unrelated repository, or start a second task I have no intention of finishing this hour. It feels like staying productive. It is mostly an escape from the discomfort of being blocked.

Then the answer comes back, and I have to rebuild the context I abandoned. I reread my own question to remember why I asked it. Sometimes the answer no longer makes sense because I have forgotten the shape of the problem it was solving.

Repeat that a few dozen times a day and the effect is not a slower day. It is a day where I never held a single thought for very long, ended tired, and cannot point to what tired me out. That pattern, sustained, is how work stops being enjoyable.

## What has helped so far

None of these solve it. They reduce how often I hit the worst version of it.

### Push the long work into a background child agent

The most useful change has been separating the slow thread from the interactive one. I hand the heavy work to a background child agent — the refactor, the migration, the multi-file change — and keep the parent session free.

The parent session is then available for exactly the thing I used to do badly: quick questions. I can ask something small, get an answer, and ask the next thing, without either blocking the real work or polluting the main context with a digression.

The important part is not the parallelism. It is that I stop competing with myself for one conversation.

### Choose a faster model for the thread I am talking to

If the parent session exists to answer quick questions, it should be fast. A smaller, faster model is usually enough for "where is this defined", "does this file already do X", "what did we call that flag".

The heavier model earns its latency on the background work, where I am not watching it. This only works if the agent lets you switch models per session, which is worth checking before you build a habit around it.

### Make it safe to look away

Delegation only helps if I actually stop watching. That requires trusting that something will pull me back — a notification when a session finishes, and a different one when it needs input. I wrote about how I set this up in [my cmux setup](/blog/my-cmux-setup-for-parallel-ai-coding).

Without that, I hover. Hovering is the same as waiting, with extra steps.

### Keep each task in its own context

When I do switch, switching to a workspace that already holds the right repository, the right browser tabs, and the right session is much cheaper than switching to a blank terminal and reconstructing everything from memory.

This does not remove the switch. It lowers the price of it.

## The one I have not solved

The interleaved plan-mode conversation is still an open problem for me.

I know it is not ideal. Two topics in one thread means the context is shared, the model is answering question B with question A still in view, and I am the only one keeping track of which follow-up belongs to which branch. It is noticeably worse than two clean threads would be.

But the alternative I default to is sitting still and getting annoyed, and that has its own cost. So I keep doing it, aware that it is a compromise rather than a technique.

Splitting those into separate sessions should be the answer. In practice it often is not, because the two questions are related enough that I want them to share context, and the overhead of setting up a second session is high enough that I skip it while impatient. That gap feels like a tooling problem more than a discipline problem.

## Still figuring out

A few things I do not have good answers for yet:

- When is interleaving actually fine? Some pairs of topics seem to coexist without much cost, and I cannot yet articulate what makes those different.
- How small does a question have to be before delegating it costs more than answering it myself?
- How do I tell the difference, in the moment, between a useful context switch and an escape from frustration? They feel identical while they are happening.
- What is the right number of concurrent threads before the coordination overhead exceeds the benefit? For me it is somewhere around three, but that is a guess.

## Where this leaves me

The reframe that helped most was noticing that impatience is a signal, not a character flaw. When I feel it, something about the shape of the work is wrong: I have blocked myself on a thread that did not need to block me, or I am watching something I could have delegated.

I do not have a clean system for this. I have a habit of noticing the frustration earlier, a few practices that reduce how often it shows up, and a list of open questions I expect to keep revising.
