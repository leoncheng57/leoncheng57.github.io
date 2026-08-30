---
title: "Early Learnings While Building My Own Desktop Coding Agent (DCA)"
description: "Early workflow and customization lessons from building my own desktop coding agent: mobile supervision, delegation, interruptions, evidence, Playbooks, and local execution."
publishedAt: "2026-08-30"
estimateTimeToRead: 11
tags:
  - workflow
  - agents
  - mobile
---

# Early Learnings While Building My Own Desktop Coding Agent (DCA)

> **This is early, and not the real write-up.** The repository is public but it is moving fast, and I would rather show the thing working than pitch it. A proper write-up, with an interactive simulation of the workflows below, is coming once it is ready. These are just the decisions that have already changed how I work.

Most [desktop coding agents](/blog/ai-coding-agent-desktop-app-comparison-april-2026) are good products that I cannot change. What the model picker offers, when a notification fires, what happens when a run finishes, what a file reference does when I click it: all decided by someone else, and sensible defaults for most people. I kept wanting different answers than the ones I was given.

I tried the alternatives first. Claude Desktop, the Codex app, Cursor's agent mode. Each one is well built, and each one is still someone else's set of decisions, not mine.

So I started building my own on top of `opencode serve`. A browser UI, a small server beside it, and the agent running on my machine with my tools.

The screenshots below are the real interface running against a mock backend, so nothing in them is a real repository of mine.

## TL;DR

- From a phone, steer and unblock rather than author. Installing the responsive app as a PWA makes that narrow job feel natural.
- Delegate a bounded side question when I do not need to watch the answer arrive.
- Interrupt me when a run is blocked, not when it is finished.
- A cited `file:line` belongs where I am already reading, not in a second application.
- Keep the run log and related pull request evidence beside the work, so status does not disappear into the transcript.
- Keep reminders, reusable skills, and guided workflows separate. They solve different context and coordination problems.

## What a phone is actually good for

I can drive a session from my phone over a private tailnet. The honest version of what that buys me is narrower than it sounds. I wrote up the setup separately in the [remote control guide](/guides/opencode-remote-control).

What works: answering a permission prompt, replying to a question that is blocking a run, reading a final summary, and queueing the next instruction. All of these are short. All of them are unblocking rather than authoring.

![The same session on a phone-width screen: a banner saying the run did not finish, a bash needs approval prompt with Allow once, Always and Reject buttons, and a blocking question asking which environment to deploy to.](/blog/practical-dca-workflows/phone-unblock.png "Everything a phone is good for is on this screen: approve, answer, resume. Nothing here asks me to write anything.")

What does not work: anything that needs me to hold a lot on screen at once. I am not going to plan an architecture from a phone. Until recently I would have said the same about reviewing a diff of any size. The [supervising from a phone chapter](/guides/custom-coding-agent-ide-with-openhands/supervising-from-a-phone) puts a large diff firmly in the "better at a desk" column, and that was true when I wrote it.

Installing the site as a PWA is a particularly good fit for this limited job. It launches from the home screen, gets a full-screen app feel, and stays separate from the pile of normal browser tabs. There is no App Store release to install or keep in sync. It is still the same responsive browser app, just presented in a way that makes a quick approval or reply feel like opening a tool rather than finding an old tab.

What makes the phone worth setting up is that a blocked run is the expensive state. A two-minute reply from a supermarket queue can restart something that would otherwise sit blocked until evening. That is most of the value. It is the difference between supervising a run and babysitting one.

## Scoping a side question worth delegating

The [previous post](/blog/the-cost-of-waiting-on-agents) left an open question: how small does a question have to be before delegating it costs more than answering it myself?

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

## Keeping the run log and pull request beside the work

A conversation summary is a claim about what happened. Even a good one is compressed, and sometimes the most useful detail is exactly what compression removes. The run log records what the agent actually did: files read, commands run, edits made, failures returned, and when each action happened.

That makes it an activity trail rather than another version of the answer. I can filter it to reads, edits, commands, or failures, then jump from an entry back to the exact action in the transcript. When a summary is incomplete, or an old session has already been compacted, I do not have to ask the agent to reconstruct its own history.

![A completed DCA session with the Run log tab open beside the conversation, showing filters for all activity, edits, commands, reads and failures, plus timestamped rows for a file read, a two-file edit, and a failed web request.](/blog/practical-dca-workflows/run-log.png "The run log records the agent's actual activity and links each entry back to the corresponding transcript action.")

The related pull request belongs in the same category. Once a session has opened a PR or MR, its link, state, checks, description, review comments, and approval status should remain visible beside the active work. Otherwise I end up scrolling through the transcript to find the link, prompting the agent to repeat it, or leaving the app just to learn whether review has moved.

![A DCA review drawer beside a completed session, showing an open mock pull request with checks status, expanded review notes, a discussion comment, an approval, and a failed test job.](/blog/practical-dca-workflows/related-pull-request.png "Related pull requests keep review status, checks, and comments beside the session instead of burying them in its transcript.")

Neither surface replaces reviewing the code or checking the underlying evidence. They make that evidence and status cheap to retrieve. That is a smaller claim, and a more useful one.

## Playbooks are three different things

I initially treated every piece of repeatable agent behavior as roughly the same kind of prompt. That is convenient until there are enough of them to manage. Reminders, skills, and workflows have different jobs.

**Reminders keep operating context visible at the right moment.** A reminder is a small instruction attached to a message or situation where it matters. It might restate a safety boundary or a local convention before a run. It is not a reusable capability, and loading it everywhere would turn a timely nudge into permanent prompt noise.

**Skills and commands package reusable instructions or capabilities.** I invoke them intentionally when a task needs a known procedure. They can have zero or very low at-rest context because the full instructions load only when needed. That makes a skill suitable for something I want to reuse without paying for it, or asking the model to notice it, in every unrelated conversation.

**Workflows guide recurring multi-step actions.** They can collect and validate inputs, show the sequence that will run, and preview what will be sent before anything starts. That is useful for recurring coordination where the shape of the action matters, not just the wording of a prompt snippet. The flow stays inspectable instead of being hidden inside one large instruction.

![The DCA Playbooks catalogue at 1280 by 900 pixels, with a work-in-progress warning, counts for commands, workflows and at-rest tokens, filters for each category, and the first reusable command cards.](/blog/practical-dca-workflows/playbooks-catalog.png "The Playbooks catalogue separates intentionally invoked commands from guided workflows and reports their at-rest context cost. Its UI is still work in progress.")

The screenshot says it plainly: the Playbooks UI is still work in progress. The separation is the part I already trust. These three mechanisms have different lifecycles, scope, and review needs. A reminder changes with the situation, a skill changes with a reusable practice, and a workflow changes with a coordinated process. Combining all of them into one giant prompt makes each harder to find, trust, and change.

## What ties these together

Every one of these started as something I could not change in a tool I was already using.

That is the actual reason the project exists. Not that the existing agents are bad, because they are not. It is that the interesting decisions are exactly the ones a product has to make once, for everybody: what interrupts you, what a citation does when you click it, whether a delegated task blocks the thing that spawned it, and how recurring instructions enter the conversation. Reasonable defaults for most people are not the same as the right answer for how I work, and there was no setting for most of these.

Building my own has been slower than using a good one. What I get back is that when something in the loop annoys me, changing it is a task rather than a feature request.

### One implementation choice underneath this

The agent runs as a process on my laptop. The browser is only a window onto it, and holds no credentials of its own. That gives the agent access to the things already on this machine: my MCP servers, SSH keys and logged-in CLIs, the Docker daemon, and the repository as it exists right now, including work I have not pushed.

A hosted product cannot inherit that environment without every local thing being re-supplied, re-authenticated, and re-approved. The cost of local execution is that I own the safety. The browser never gets credentials, tool access is bounded to a canonicalised workspace root, and permissions stay off by default. Maintaining those constraints is a real tax and the honest downside of the approach.

I do not think any of this is finished. But it is the version I would set up again on a new machine tomorrow.
