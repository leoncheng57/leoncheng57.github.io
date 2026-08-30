---
title: "Early Learnings While Building My Own Desktop Coding Agent (DCA)"
description: "Five decisions from building my own desktop coding agent, because the interesting ones are exactly the ones a product has to make for everybody: what gets delegated, what earns an interruption, what a phone is good for, what a citation does when you click it, and where the agent runs."
publishedAt: "2026-08-30"
estimateTimeToRead: 8
tags:
  - workflow
  - agents
  - mobile
---

# Early Learnings While Building My Own Desktop Coding Agent (DCA)

> **This is early, and not the real write-up.** The repository is public but it is moving fast, and I would rather show the thing working than pitch it. A proper write-up, with an interactive simulation of the workflows below, is coming once it is ready. These are just the decisions that have already changed how I work.

Most [desktop coding agents](/blog/ai-coding-agent-desktop-app-comparison-april-2026) are good products that I cannot change. What the model picker offers, when a notification fires, what happens when a run finishes, what a file reference does when I click it: all decided by someone else, and sensible defaults for most people. I kept wanting different answers than the ones I was given.

I tried the alternatives first. Claude Desktop, the Codex app, Cursor's agent mode. Each one is well built, and each one is still someone else's five decisions, not mine.

So I started building my own on top of `opencode serve`. A browser UI, a small server beside it, and the agent running on my machine with my tools.

The screenshots below are the real interface running against a mock backend, so nothing in them is a real repository of mine.

## TL;DR

- Delegate a side question when the answer is bounded and I do not need to watch it arrive.
- Interrupt me when a run is blocked, not when it is finished.
- From a phone, steer and unblock. Do not try to author.
- A cited `file:line` belongs where I am already reading, not in a second application.
- Keep execution on the machine that already has the credentials, the tools, and the uncommitted work.

## Scoping a side question worth delegating

The previous post left an open question: how small does a question have to be before delegating it costs more than answering it myself?

I have a working answer now, and it is not about size. It is about whether I need to watch.

A question is worth delegating when the answer is bounded, mostly read-only, and useful to me whole. "Which components import this hook" is a good delegation. So is "summarize what this migration changed" and "find every place we set this header". Each has an end state I can recognize when it arrives, and none of them need my judgment partway through.

A question is not worth delegating when I would have to supervise the middle of it. Anything where the second step depends on my reaction to the first is cheaper to just do. The delegation cost is not the tokens. It is writing a prompt precise enough to survive without me.

Two details make this work in practice.

**Give the digression its own session.** The point is not parallelism. It is that the question leaves my main thread without leaving a residue in it. A side question answered inline is still a topic change in the transcript I have to read past later.

**Use a cheaper model for it.** Bounded lookups do not need the expensive model. Reserve that for work where the reasoning is the product.

![A session with four delegated tasks, each tagged either Background or Foreground with its agent and model, beside a child-sessions panel showing running, launched, failed and completed counts and a prompt to move blocking sub-agents into the background.](/blog/practical-dca-workflows/subagents-panel.png "Foreground sub-agents block the session they were launched from. The panel offers to move them to the background so the parent stays answerable.")

The distinction the interface ended up needing was foreground against background, not parent against child. A foreground sub-agent blocks the session that launched it, which is occasionally what I want and usually not.

Sometimes a bounded lookup is really a persistent worker wearing a disguise. I wrote up that distinction in [the workers versus subagents chapter](/guides/manager-worker-parallel-agents/workers-vs-subagents) of the parallel agents guide.

## Deciding what earns an interruption

The plumbing for this is not interesting and I have already covered it in [my cmux setup](/blog/my-cmux-setup-for-parallel-ai-coding). The policy is the part worth arguing about.

The mistake I made first was treating "notify" as one switch. It is at least two. There is a passive signal, which I will see whenever I next look. And there is an interrupting signal, which takes my attention now whether or not I was ready.

Sorting events by which one they deserve produces a table that has stayed stable for months:

| Event | Passive signal | Interrupts me |
| --- | --- | --- |
| Turn complete | Yes | No |
| Permission requested | Yes | Yes |
| Plan needs review | Yes | Yes |
| Question asked | Yes | Yes |

The rule underneath it: a finished run can wait, and a blocked one cannot. A completed turn costs nothing by sitting there for ten minutes. A run stalled on a permission prompt is burning the whole reason I delegated it.

![The project hub with a Needs attention banner pinned above the session lists, showing one running session that requires input, while idle sessions sit below it in a recently active list.](/blog/practical-dca-workflows/needs-attention-hub.png "The passive half: a Needs attention list I read when I choose to, rather than a notification that decides for me.")

The passive signal needed somewhere to live, which turned into a "needs attention" list at the top of the hub. It answers the question I actually have when I come back to the desk, which is not "what happened" but "which one of these is waiting on me".

This is also why "notify on everything" fails in a specific way rather than a general one. It is not that the volume is annoying. It is that completions teach me to ignore interruptions. Then I ignore the blocking ones too.

One more rule worth having: auto-approved actions should be silent. If I already decided the agent may run tests without asking, a notification telling me it ran tests is me re-reviewing a decision I deliberately stopped making.

## What a phone is actually good for

I can drive a session from my phone over a private tailnet. The honest version of what that buys me is narrower than it sounds. I wrote up the setup separately in the [remote control guide](/guides/opencode-remote-control).

What works: answering a permission prompt, replying to a question that is blocking a run, reading a final summary, and queueing the next instruction. All of these are short. All of them are unblocking rather than authoring.

![The same session on a phone-width screen: a banner saying the run did not finish, a bash needs approval prompt with Allow once, Always and Reject buttons, and a blocking question asking which environment to deploy to.](/blog/practical-dca-workflows/phone-unblock.png "Everything a phone is good for is on this screen: approve, answer, resume. Nothing here asks me to write anything.")

What does not work: anything that needs me to hold a lot on screen at once. I am not going to plan an architecture from a phone. Until recently I would have said the same about reviewing a diff of any size. The [supervising from a phone chapter](/guides/custom-coding-agent-ide-with-openhands/supervising-from-a-phone) puts a large diff firmly in the "better at a desk" column, and that was true when I wrote it.

What makes the phone worth setting up is that a blocked run is the expensive state. A two-minute reply from a supermarket queue can restart something that would otherwise sit blocked until evening. That is most of the value. It is the difference between supervising a run and babysitting one.

## Sticky code review

This is the one I have changed my mind about most recently.

When an agent explains what it did, the useful version of that explanation cites specific places: this function in that file, these lines. The citation is the evidence. Without it I am taking the summary on trust, and a summary is exactly the artifact most likely to be confidently wrong.

The problem is what it costs to check one. A cited reference used to mean leaving the conversation, finding the file in an editor, locating the range, reading it, then coming back and rebuilding where I was. That is the same context switch the whole previous post was about. Except here I am doing it to myself, several times per review.

So the fix is to make following a citation not a departure. A file reference opens in a reader beside the conversation, scrolled to the cited range with those lines highlighted. I read it, I close it, I am still in the same paragraph of the same explanation.

![An agent message where src/index.ts:12, src/index.ts:8-11 and docs/guide.md#L1-L3 are rendered as clickable controls, while a missing path, a traversal path, a dotfile, a generated file, an external URL and a prose mention of the same filename are all left as plain text.](/blog/practical-dca-workflows/file-references.png "Only real, in-workspace paths become controls. A missing file, a traversal attempt, a dotfile, an external URL and a prose mention of the same name all stay inert.")

Getting this right turned out to be mostly about what *not* to linkify. A path that does not exist, one that escapes the workspace, a dotfile, a generated artifact, a URL that merely looks like a path: every one of those is a control that would waste a click or leak something. The rule I landed on is that a reference becomes a control only when it resolves to a real file inside the project.

Two things I did not expect from this.

**I check more citations.** When following a reference cost a context switch, I checked the ones I already doubted. Now I check the ones I merely have not thought about, which is where the surprises actually are.

**It changes what I ask for.** Because citations became cheap to verify, it became worth insisting on them. A standing instruction to cite `file:line` is only useful if the citations get read.

The thing to be careful about is scope. This is a reader, not an editor. The moment I want to change something I have left review and started working, and that deserves a real editor and a real session. Keeping the reader read-only is what keeps it fast, and what stops "let me just check that reference" from turning into an hour.

That is also the honest limit on the phone claim above. Sticky review makes a cited range reviewable on a small screen, because a cited range is small by construction. It does not make a four hundred line diff reviewable on a phone. Those are different problems and only one of them is solved.

## Why it runs on my machine

The last decision is the one that made the other four possible.

The agent runs as a process on my laptop. The browser is only a window onto it, and holds no credentials of its own. That sounds like an implementation detail and is actually the whole point: it means the agent reaches the things that are already on this machine. My MCP servers. My SSH keys and logged-in CLIs. The Docker daemon. The repository as it exists right now, including the parts I have not pushed.

A hosted product cannot give me that, and not because anyone built it badly. It cannot be given. The moment execution moves to someone else's machine, every local thing has to be re-supplied, re-authenticated, and re-approved, and most of it never is.

The cost is that I own the safety. The browser never gets credentials, tool access is bounded to a canonicalised workspace root, and permissions stay off by default rather than on. Those are constraints I now have to maintain myself, which is a real tax and the honest downside of the whole approach.

## What ties these together

Every one of these started as something I could not change in a tool I was already using.

That is the actual reason the project exists. Not that the existing agents are bad, because they are not. It is that the interesting decisions are exactly the ones a product has to make once, for everybody: what interrupts you, what a citation does when you click it, whether a delegated task blocks the thing that spawned it. Reasonable defaults for most people are not the same as the right answer for how I work, and there was no setting for most of these.

Building my own has been slower than using a good one. What I get back is that when something in the loop annoys me, changing it is a task rather than a feature request.

I do not think any of this is finished. But it is the version I would set up again on a new machine tomorrow.
