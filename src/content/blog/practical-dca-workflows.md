---
title: "Practical DCA Workflows"
description: "The tactical half of a post about agent latency: how I scope a question worth delegating, which events earn an interruption, what a phone is actually good for, and why a cited file reference should open where I am already reading."
publishedAt: "2026-08-30"
estimateTimeToRead: 7
tags:
  - workflow
  - agents
  - mobile
---

# Practical DCA Workflows

I wrote recently about [the cost of waiting on agents](/blog/the-cost-of-waiting-on-agents). The argument there was that latency is not expensive because of the lost minutes. It is expensive because waiting produces frustration, frustration produces an unplanned context switch, and the switch has to be paid back later as context reconstruction.

That post named the problem and stopped. This one is the tactical half: four things I actually do, and the reasoning behind each.

All of it happens in what I started calling a [desktop coding agent](/blog/ai-coding-agent-desktop-app-comparison-april-2026), or DCA, back when I was comparing them. The specific product matters less than the four decisions.

## TL;DR

- Delegate a side question when the answer is bounded and I do not need to watch it arrive.
- Interrupt me when a run is blocked, not when it is finished.
- From a phone, steer and unblock. Do not try to author.
- A cited `file:line` belongs where I am already reading, not in a second application.

## Scoping a side question worth delegating

The previous post left an open question: how small does a question have to be before delegating it costs more than answering it myself?

I have a working answer now, and it is not about size. It is about whether I need to watch.

A question is worth delegating when the answer is bounded, mostly read-only, and useful to me whole. "Which components import this hook" is a good delegation. So is "summarize what this migration changed" and "find every place we set this header". Each has an end state I can recognize when it arrives, and none of them need my judgment partway through.

A question is not worth delegating when I would have to supervise the middle of it. Anything where the second step depends on my reaction to the first is cheaper to just do. The delegation cost is not the tokens. It is writing a prompt precise enough to survive without me.

Two details make this work in practice.

**Give the digression its own session.** The point is not parallelism. It is that the question leaves my main thread without leaving a residue in it. A side question answered inline is still a topic change in the transcript I have to read past later.

**Use a cheaper model for it.** Bounded lookups do not need the expensive model. Reserve that for work where the reasoning is the product.

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

This is also why "notify on everything" fails in a specific way rather than a general one. It is not that the volume is annoying. It is that completions teach me to ignore interruptions. Then I ignore the blocking ones too.

One more rule worth having: auto-approved actions should be silent. If I already decided the agent may run tests without asking, a notification telling me it ran tests is me re-reviewing a decision I deliberately stopped making.

## What a phone is actually good for

I can drive a session from my phone over a private tailnet. The honest version of what that buys me is narrower than it sounds. I wrote up the setup separately in the [remote control guide](/guides/opencode-remote-control).

What works: answering a permission prompt, replying to a question that is blocking a run, reading a final summary, and queueing the next instruction. All of these are short. All of them are unblocking rather than authoring.

What does not work: anything that needs me to hold a lot on screen at once. I am not going to plan an architecture from a phone. Until recently I would have said the same about reviewing a diff of any size. The [supervising from a phone chapter](/guides/custom-coding-agent-ide-with-openhands/supervising-from-a-phone) puts a large diff firmly in the "better at a desk" column, and that was true when I wrote it.

What makes the phone worth setting up is that a blocked run is the expensive state. A two-minute reply from a supermarket queue can restart something that would otherwise sit blocked until evening. That is most of the value. It is the difference between supervising a run and babysitting one.

## Sticky code review

This is the one I have changed my mind about most recently.

When an agent explains what it did, the useful version of that explanation cites specific places: this function in that file, these lines. The citation is the evidence. Without it I am taking the summary on trust, and a summary is exactly the artifact most likely to be confidently wrong.

The problem is what it costs to check one. A cited reference used to mean leaving the conversation, finding the file in an editor, locating the range, reading it, then coming back and rebuilding where I was. That is the same context switch the whole previous post was about. Except here I am doing it to myself, several times per review.

So the fix is to make following a citation not a departure. A file reference opens in a reader beside the conversation, scrolled to the cited range with those lines highlighted. I read it, I close it, I am still in the same paragraph of the same explanation.

Two things I did not expect from this.

**I check more citations.** When following a reference cost a context switch, I checked the ones I already doubted. Now I check the ones I merely have not thought about, which is where the surprises actually are.

**It changes what I ask for.** Because citations became cheap to verify, it became worth insisting on them. A standing instruction to cite `file:line` is only useful if the citations get read.

The thing to be careful about is scope. This is a reader, not an editor. The moment I want to change something I have left review and started working, and that deserves a real editor and a real session. Keeping the reader read-only is what keeps it fast, and what stops "let me just check that reference" from turning into an hour.

That is also the honest limit on the phone claim above. Sticky review makes a cited range reviewable on a small screen, because a cited range is small by construction. It does not make a four hundred line diff reviewable on a phone. Those are different problems and only one of them is solved.

## What ties these together

None of these are about making the agent faster. Three of the four are about not being interrupted, and the fourth is about making a necessary interruption cheap.

That is the pattern I did not see until I wrote them down next to each other. The tempo problem is not really latency. It is that the default arrangement of the work asks me to pay attention at moments the work chose, instead of moments I chose. Each of these moves one of those moments back under my control.

I do not think any of this is finished. But it is the version I would set up again on a new machine tomorrow.
