---
title: "Agentic Chaining: Small Opinionated Agents in a Line"
description: "Why stringing together small, specialized agents — each as deterministic as the task allows — beats one large do-everything agent."
publishedAt: "2026-06-05"
tags:
  - AI
  - agents
  - workflow
  - mental-models
  - engineering
---

# Agentic Chaining: Small Opinionated Agents in a Line

![Agentic Chaining — small, opinionated agents in sequence](/blog/agentic-chaining/hero-diagram.svg)

## The problem with one big agent

The pitch for large general-purpose agents is seductive: give it all your tools, all your context, and let it figure things out. In practice, this falls apart in three predictable ways.

**Cost.** A single agent session that touches five different systems burns through tokens like it is doing all five jobs at once — because it is. Every tool call carries the full conversation context. The bill compounds.

**Hallucination.** The more responsibilities you give one agent, the more opportunities it has to confidently make things up. A general-purpose agent investigating an incident might fabricate a deployment timeline because it has too many things to track and not enough guardrails on any single one.

**Debugging.** When the output is wrong, where do you look? The agent had access to everything and did everything in one long session. Good luck tracing which step went sideways.

## "But what about the bitter lesson?"

The natural objection here is the [bitter lesson](https://en.wikipedia.org/wiki/Bitter_lesson): historically, general methods that scale with compute have always beaten specialized, hand-crafted approaches. Chess, Go, vision, speech — every time researchers encoded domain knowledge, brute-force scaling eventually crushed it. So why not just give a general-purpose agent more compute and better models and let it figure things out?

Because agent orchestration is not model training. The bitter lesson applies to what happens *inside* a model — how it learns representations, how it improves with scale. It does not apply to how you wire a production system together. Generalized AI is genuinely great at LLM-style reasoning and text generation. But being a full engineer replacement — managing incidents end-to-end, coordinating across systems, making judgment calls under pressure — is a different problem. The model is one component. The system around it is everything else: reliability, debuggability, cost control, human oversight, and the ability to trace what went wrong when something breaks.

Assistive chaining is the current best of both worlds. You get the power of general-purpose models where reasoning is needed, and the predictability of deterministic systems everywhere else. My bet is that this pattern persists even as models improve, because the bottleneck is not model capability — it is system reliability. Better models make each node better, but they do not eliminate the need to decompose the workflow. AI is good at a lot, not everything.

There is a better architecture. Instead of one agent that does everything, you chain together small agents that each do one thing well.

## Why small agents work

A single-purpose agent is a fundamentally different thing from a general-purpose one. It has a narrow scope, a small tool set, and a clear contract: given this input, produce that output.

This makes it **cheap** — the context window stays small because the agent only sees what it needs. It makes it **reliable** — there are fewer ways for it to go wrong when it only has one job. And it makes it **replaceable** — if one agent is underperforming, you swap it out without touching the rest of the chain.

Small agents are also easy to spin up. You can prototype one in an afternoon, wire it into an existing workflow, and see if it earns its keep. If it does not, you pull it out. The blast radius is tiny.

The interesting thing is what happens when you start putting them together.

## The deterministic–agentified spectrum

Not every node in a chain needs a large language model. In fact, most should not have one.

Every task in a workflow sits somewhere on a spectrum. On one end: **deterministic** — rule-based, threshold-driven, no reasoning required. A monitoring tool firing when a metric crosses a line. A ticket being created from a template. A deployment being rolled back. These are the tasks where an LLM adds cost and risk but no value.

On the other end: **agentified** — the task requires reasoning, synthesis, or natural language understanding. Reading through a dozen log streams and producing a coherent diagnosis. Interpreting a runbook in the context of a novel failure. Answering an engineer's follow-up question in natural language during a firefight.

Most tasks in most chains sit closer to the deterministic end. The discipline is simple: **default to deterministic. Use an LLM only where the task genuinely requires reasoning or synthesis.** The goal is to push each node as far toward deterministic as the problem allows.

This is what makes agentic chaining different from "just microservices" or "just a pipeline." The chain is not a sequence of LLM calls. It is a sequence of specialized steps where the LLM only shows up at the nodes that earn it.

## Agentic chaining in practice: incident response

Here is what this looks like in a real system. Consider an observability platform where the goal is to handle the full incident lifecycle — from an alert firing to the system being healthier than it was before.

![Agentic Chaining — Incident Response Lifecycle](/blog/agentic-chaining/ops-lifecycle.svg)

Six stages, chained in sequence. Each one is typed by where it falls on the deterministic–agentified spectrum.

### 1. Detect — deterministic

Detection is boring on purpose. A monitoring tool fires when a hard threshold is breached or a service degrades against its SLO. No LLM, no reasoning — just math. If CPU exceeds 95% for five minutes, fire the alert. This is a node where adding intelligence would be adding risk.

### 2. Investigate — both, human-in-the-loop

Once the alert fires, the chain needs to figure out what is actually going on. This is where the first LLM appears. The node makes **deterministic** connections — pulling data from dashboards, logs, traces, and recent deployments — but uses **agentified** capabilities to synthesize that context into a coherent diagnostic report. It reads through runbooks, correlates timelines, and packages everything an engineer needs to make a decision.

The data collection is mechanical. The synthesis is where the LLM earns its spot. But the engineer is still in the loop — reviewing the investigation output, sanity-checking the timeline, and deciding whether the diagnosis makes sense before it moves downstream.

### 3. Triage — deterministic, human-in-the-loop

A human on-call engineer reviews the automated investigation package. The system's role here is purely structural: it presents the diagnosis and provides rigid parameters for the human to act on — escalate or not, assign a severity level, define responder roles, open a communication channel.

This is the node where human judgment lives. The chain does not try to replace it. It sets the human up with everything they need and then gets out of the way.

### 4. Mitigate — both, human-in-the-loop

The team acts on the triage decision. This phase combines **deterministic** execution — rolling back a deployment, toggling a feature flag, scaling a service — with **agentified** support. An AI chat is available for dynamic, natural-language follow-up troubleshooting during the firefight. The engineer can ask "what else changed in the last hour?" and get a synthesized answer instead of digging through three dashboards.

Known fixes run mechanically. The LLM handles the unknown. But a human is driving the whole time — choosing which remediation to apply, confirming before destructive actions, and making the call on whether the fix actually worked.

### 5. Review — both, human-in-the-loop

Once the immediate threat is contained, the learning phase kicks in. An agent drafts the post-mortem — pulling incident data, timelines, and resolution steps into a structured document. Metrics are aggregated into weekly ops reviews, surfacing recurring issues, patterns across recent incidents, and SLO trends. The **deterministic** side handles data aggregation and templating. The **agentified** side drafts the narrative — the "what happened and why" section that used to take an engineer an hour to write. But a human reviews every draft, adds context the system cannot see, and signs off before it goes out.

### 6. Improve — both, human-in-the-loop

Insights from the review are turned into concrete, trackable work. Tickets are created and tracked through standard project management systems — that part is **deterministic**. But agents can also help with the fixes themselves: small, well-scoped code changes like adding a missing timeout, fixing a retry policy, or updating a config value. For larger structural fixes, agents are less reliable and the work stays with engineers. Either way, a human reviews every change before it merges. A human also prioritizes what gets worked on, assigns ownership, and decides what is actually worth fixing versus what is noise.

### The pattern

Look at the distribution: only Detect runs fully autonomously. Every other stage has a human in the loop — reviewing, deciding, guiding, or signing off. And the LLM shows up at four of six nodes (Investigate, Mitigate, Review, Improve), but always alongside deterministic steps that keep the work grounded. The agent never acts alone on anything that matters.

That is the pattern. Not "agents everywhere," but agents only where they belong, humans at every handoff that matters, and each node pushed as far toward deterministic as the task allows.

## The pattern generalizes

Incident response is one instance of this shape. The same architecture applies to document creation pipelines, coding workflows, database analysis, and anywhere else you can decompose a workflow into sequential, specialized steps. The specifics change. The structure — small opinionated nodes, each as deterministic as the task allows, chained in sequence — stays the same.

## What about a name?

I have been calling this "agentic chaining," which is descriptive but not exactly catchy. The pattern needs a better name. Here are some candidates I have been kicking around:

- **Conga line** — fun, visual, captures the sequential handoff. Might not survive a serious engineering conversation.
- **Agentic string theory** — clever, but probably too clever. Also the physics metaphor does not actually map to anything.
- **Agentic chaining** — the current working name. Descriptive. Fine. Not exciting.
- **SME assembly line** — captures the specialization angle ("subject matter expert" agents). A bit industrial.
- **Stringy McStringFace** — obviously the correct answer.
