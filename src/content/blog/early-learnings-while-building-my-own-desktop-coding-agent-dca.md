---
title: "Early Learnings While Building My Own Desktop Coding Agent (DCA)"
description: "Early customization lessons from building my own desktop coding agent: mobile supervision, sub-agents, deliberate notifications, sticky review, audit trails, and playbooks beside chat."
publishedAt: "2026-08-30"
estimateTimeToRead: 13
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
- Customize each sub-agent's model and whether it runs in the foreground, background, or as a manually prompted Managed Child.
- Create a deliberate notification system that alerts me only when something is blocked or ready for my attention.
- Make every cited `file:line` open an in-app file viewer with the relevant changes highlighted, without leaving what I am already reading.
- Keep the run log and related pull request evidence beside the work, so status does not disappear into the transcript.
- Keep reminders, workflows, and other playbooks beside the chat input so recurring patterns are faster to find and run.

## What a phone is actually good for

I can drive a session from my phone over a private tailnet. The honest version of what that buys me is narrower than it sounds. I wrote up the setup separately in the [remote control guide](/guides/opencode-remote-control).

What works is returning to a small list of sessions that need attention, opening one, reading enough context to make a short decision, then getting out again. The home screen makes that first step explicit rather than asking me to remember which agent was waiting.

Inside a session, the useful actions are similarly narrow: read the latest turn, steer the next one, switch between Plan and Build, change the model, attach a reminder, or start a known workflow. The mobile UI is not pretending that a phone is a spacious workstation. It makes short supervision possible without reducing the conversation and composer to a desktop layout squeezed into 390 pixels.

![The mobile home attention queue and a clean mobile conversation with its composer shown side by side.](component:mobile-screenshot-pair)

Installing the site as a PWA is a particularly good fit for this limited job. It launches from the home screen, uses the whole screen, and stays separate from the pile of normal browser tabs. There is no App Store release to install or keep in sync: it is still the same responsive browser app, with the same sessions, delivered in a form that makes checking a blocked run feel like opening a tool instead of recovering an old tab.

What makes the phone worth setting up is that a blocked run is the expensive state. A two-minute reply from a supermarket queue can restart something that would otherwise sit blocked until evening. That is most of the value. It is the difference between supervising a run and babysitting one.

## Customizing how sub-agents run

The useful thing about sub-agents in this setup is not simply that there can be more than one. It is that each one can have a different job, agent, model, and relationship to the parent session.

A quick lookup can run on a faster, cheaper model. A deeper investigation can use a more capable model without moving the whole parent conversation onto it. The choice belongs to the delegated task rather than becoming a global setting I have to keep changing back.

Foreground and background answer a separate question. A foreground sub-agent blocks the parent when its result is required before the parent can continue. A background sub-agent leaves the parent available while the work continues. The child-sessions panel shows both, and it can move a blocking agent into the background when I realize the parent does not actually need to wait.

![A session with delegated tasks tagged Background or Foreground and labelled with their agent and model, beside a child-sessions panel showing running, launched, failed, and completed children plus a control for moving blocking sub-agents into the background.](/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca/subagents-panel.png "Model choice and foreground or background execution are properties of each sub-agent; a blocking child can be moved to the background when the parent should stay available.")

Sub-agent notifications also need their own policy. Ordinary child activity and completion are recorded, but not delivered as notifications; otherwise one parent turn can multiply into a stream of low-value interruptions. A permission request is the exception because a child stalled on permission needs a human just as much as a stalled root session does. If auto-permissions can answer it, that event can still be handled and suppressed silently. This is narrower than the notification policy for root sessions, not a replacement for it.

I can also launch a **Managed Child** manually. It gets its own promptable conversation, agent, model, and creation-time policy. That is useful when a side investigation or behavior check is likely to need follow-up questions rather than one answer handed back to the parent. The important distinction is not just how the child started; it is whether I want a one-shot result or another conversation I can continue steering independently.

## Deciding what earns an interruption

The plumbing for this is not interesting and I have already covered it in [my cmux setup](/blog/my-cmux-setup-for-parallel-ai-coding). The policy is the part worth arguing about.

The mistake I made first was treating "notify" as one switch. What I wanted was a deliberate notification system that alerts me only when something is blocked or ready for my attention, while still keeping a passive record of everything the policy chose not to deliver.

![A dark flowchart beginning with an OpenCode event, checking whether it is a supported notification kind, suppressing non-permission child-session noise and auto-approved permissions while recording both, checking configured channels, and either recording only or recording and delivering through desktop, ntfy, or web push.](/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca/notification-decision-flow.svg "Every supported event is recorded. Delivery happens only after sub-agent noise, auto-permissions, and channel preferences have been evaluated.")

The rule underneath it: a finished run can wait, and a blocked one cannot. A completed turn costs nothing by sitting there for ten minutes. A run stalled on a permission prompt is burning the whole reason I delegated it.

The key detail in that flow is that suppressed does not mean forgotten. Supported events are recorded before the delivery decision is applied. The notification popover is therefore an auditable inbox: active permission requests, questions, and ready sessions stay visible, while auto-approved events and ordinary sub-agent noise start folded away. I can unfold either category when I need to understand what happened without letting it train me to ignore the bell.

![A compact dark notification popover with three active rows for a permission, a question, and an idle session, while checked filters report one hidden auto-approved event and one hidden sub-agent event.](/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca/notification-popover.png "The popover keeps active work visible and suppressed categories auditable. Auto-approved and sub-agent records are folded away by default, not discarded.")

This is also why "notify on everything" fails in a specific way rather than a general one. It is not that the volume is annoying. It is that completions teach me to ignore interruptions. Then I ignore the blocking ones too.

One more rule worth having: auto-approved actions should be silent. If I already decided the agent may run tests without asking, a notification telling me it ran tests is me re-reviewing a decision I deliberately stopped making.

## Sticky code review

This is the one I have changed my mind about most recently.

When an agent explains what it did, the useful version of that explanation cites specific places: this function in that file, these lines. The citation is the evidence. Without it I am taking the summary on trust, and a summary is exactly the artifact most likely to be confidently wrong.

The problem is what it costs to check one. A cited reference used to mean leaving the conversation, finding the file in an editor, locating the range, reading it, then coming back and rebuilding where I was. That is the same context switch the whole previous post was about. Except here I am doing it to myself, several times per review.

So the fix is to make following a citation not a departure. A file reference opens in a reader beside the conversation, scrolled to the cited range with those lines highlighted. I read it, I close it, I am still in the same paragraph of the same explanation.

![A dark DCA conversation on the left with clickable file citations, beside an in-app workspace file viewer on the right opened to src/index.ts and highlighting the four cited lines from 8 through 11.](/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca/file-references.png "Clicking src/index.ts:8-11 keeps the transcript in place and opens a read-only sidebar with all four cited lines highlighted.")

Getting this right turned out to be mostly about what *not* to linkify. A path that does not exist, one that escapes the workspace, a dotfile, a generated artifact, a URL that merely looks like a path: every one of those is a control that would waste a click or leak something. The rule I landed on is that a reference becomes a control only when it resolves to a real file inside the project.

Two things I did not expect from this.

**I check more citations.** When following a reference cost a context switch, I checked the ones I already doubted. Now I check the ones I merely have not thought about, which is where the surprises actually are.

**It changes what I ask for.** Because citations became cheap to verify, it became worth insisting on them. A standing instruction to cite `file:line` is only useful if the citations get read.

The thing to be careful about is scope. This is a reader, not an editor. The moment I want to change something I have left review and started working, and that deserves a real editor and a real session. Keeping the reader read-only is what keeps it fast, and what stops "let me just check that reference" from turning into an hour.

That is also the honest limit on the phone claim above. Sticky review makes a cited range reviewable on a small screen, because a cited range is small by construction. It does not make a four hundred line diff reviewable on a phone. Those are different problems and only one of them is solved.

## Keeping the run log and pull request beside the work

A conversation summary is a claim about what happened. Even a good one is compressed, and sometimes the most useful detail is exactly what compression removes. The run log records what the agent actually did: files read, commands run, edits made, failures returned, and when each action happened.

That makes it an activity trail rather than another version of the answer. I can filter it to reads, edits, commands, or failures, then jump from an entry back to the exact action in the transcript. When a summary is incomplete, or an old session has already been compacted, I do not have to ask the agent to reconstruct its own history.

![A completed DCA session in dark mode with the Run log open beside the conversation, showing filters for all activity, edits, commands, reads, and failures plus rows for a file read, a two-file edit, and a failed web request.](/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca/run-log.png "In dark mode, the run log keeps a filterable record of the agent's actual activity beside the transcript and links each entry back to its action.")

I plan to improve this surface. I am somewhat inspired by the detail in DeepSeek Harness's transcript and trajectory view: turns and steps, request metadata and messages, paired tool calls and results, compaction, child lineage, timing, usage, failures, and what replaced an earlier surface. The current Run log does not match that depth. It is a useful activity trail today, and that trajectory is a good reference for the richer audit detail I would like it to accumulate over time.

The related pull request belongs in the same category. Once a session has opened a PR or MR, its link, state, checks, description, review comments, and approval status should remain visible beside the active work. Otherwise I end up scrolling through the transcript to find the link, prompting the agent to repeat it, or leaving the app just to learn whether review has moved.

![A completed DCA session dimmed behind a dark Reviews drawer showing an open mock pull request, checks status, expanded description, discussion comment, approval, and test job.](/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca/related-pull-request.png "The dark Reviews drawer keeps the related pull request's status, checks, description, and comments beside the session instead of burying them in its transcript.")

Neither surface replaces reviewing the code or checking the underlying evidence. They make that evidence and status cheap to retrieve. That is a smaller claim, and a more useful one.

## Reminders and workflows beside the chat

I initially treated every piece of repeatable agent behavior as roughly the same kind of prompt. The two mechanisms I now reach for here have different jobs.

**Reminders keep operating context visible at the right moment.** A reminder is a small instruction attached to a message or situation where it matters. It might restate a safety boundary or a local convention before a run. It is not a reusable capability, and loading it everywhere would turn a timely nudge into permanent prompt noise.

The picker sits beside the composer, and one reminder applies to the next message only. `Cite File Lines` is a concrete example: attach it when the next answer should point back to verifiable source locations, then let it clear after that message is sent.

![A compact dark reminder picker filtered to Cite File Lines, with its details control and a footer explaining that one reminder applies to the next message only.](/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca/reminder-picker.png "The reminder picker stays beside the composer and scopes Cite File Lines to the next message only.")

**Workflows guide recurring multi-step actions.** They can collect and validate inputs, show the sequence that will run, and preview what will be sent before anything starts. That is useful for recurring coordination where the shape of the action matters, not just the wording of a prompt snippet. The flow stays inspectable instead of being hidden inside one large instruction.

Both live beside the chat input, because that is where I notice that a situation needs context or a recurring action needs structure. Hiding them in a separate catalogue would make the reusable behavior harder to find at the moment it is useful.

```text
                               beside the chat input

  situation needs context                         recurring action needs structure
            |                                                   |
            v                                                   v
      +-----------+                                      +--------------+
      | reminder  |                                      | workflow     |
      | short rule|                                      | guided steps |
      +-----------+                                      +--------------+
            |                                                   |
            +---------------------> next prompt <---------------+
                                  visible first
```

The diagram is deliberately simple: both mechanisms shape the next prompt, and both stay visible before anything is sent. Their scope and lifecycles are still different. A reminder changes with the situation; a workflow changes with the recurring process. Combining them into one giant prompt would make each harder to find, inspect, trust, and change.

## What ties these together

Every one of these started as something I could not change in a tool I was already using.

That is the actual reason the project exists. Not that the existing agents are bad, because they are not. It is that the interesting decisions are exactly the ones a product has to make once, for everybody: what interrupts you, what a citation does when you click it, whether a delegated task blocks the thing that spawned it, and how recurring instructions enter the conversation. Reasonable defaults for most people are not the same as the right answer for how I work, and there was no setting for most of these.

Building my own has been slower than using a good one. What I get back is that when something in the loop annoys me, changing it is a task rather than a feature request.

### One implementation choice underneath this

The agent runs as a process on my laptop. The browser is only a window onto it, and holds no credentials of its own. That gives the agent access to the things already on this machine: my MCP servers, SSH keys and logged-in CLIs, the Docker daemon, and the repository as it exists right now, including work I have not pushed.

A hosted product cannot inherit that environment without every local thing being re-supplied, re-authenticated, and re-approved. The cost of local execution is that I own the safety. The browser never gets credentials, tool access is bounded to a canonicalised workspace root, and permissions stay off by default. Maintaining those constraints is a real tax and the honest downside of the approach.

I do not think any of this is finished. But it is the version I would set up again on a new machine tomorrow.
