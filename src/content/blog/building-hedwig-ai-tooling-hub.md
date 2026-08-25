---
title: "Building Hedwig: From One AI Workflow to an Internal Platform"
description: "How I led the evolution of a DeepL incident assistant into a shared platform for internal AI applications."
publishedAt: "2026-08-25"
estimateTimeToRead: 14
tags:
  - AI
  - agents
  - developer-tools
draft: false
---

# Building Hedwig: From One AI Workflow to an Internal Platform

At DeepL, I led the development of an internal AI application platform I will call **Hedwig**. The name is a pseudonym. I am using it to explain the engineering decisions without turning an internal repository, set of environments, or operating model into public documentation.

Hedwig did not begin as a platform project. It began in March 2026 as a focused on-call investigation assistant. It could receive an operational event, gather relevant context through constrained tools, stream its progress, and produce a structured report for an engineer to review.

That narrow starting point mattered. It gave us a real workflow, real users, and a concrete way to learn where AI helped and where deterministic software was still the better answer.

Over the following months, teams across engineering, operations, data, product, and design contributed applications and platform improvements. The recurring work was not the prompt. It was authentication, persistence, authorization, observability, agent execution, integrations, deployment, and UI patterns. That is what turned one useful application into Hedwig: a shared internal surface for building and operating several kinds of AI-assisted tools.

This is a build retrospective, not a claim that every company should build its own AI platform. The strongest reason to build one is not that a chat interface looks easy to reproduce. It is that the work depends on internal context, controlled actions, repeatable workflows, and infrastructure that teams would otherwise rebuild separately.

## What Hedwig became

Hedwig was a modular internal application platform. A single deployment hosted self-contained applications that shared the expensive plumbing:

- Authentication, configuration, logging, health checks, and real-time updates.
- Agent registration, tool selection, persistence, and feedback loops.
- Integrations with internal engineering and business systems through narrow, typed interfaces.
- A shared design system and release path.
- Interactive, background, and isolated-workspace execution modes.

The important part is what Hedwig did **not** try to be. It was not one universal agent that could do everything. It was a place where teams could build focused applications without independently solving the surrounding platform problems every time.

That distinction kept becoming more useful as the number of workflows grew. An operational assistant, a planning tool, a dashboard generator, a Slack-facing helper, and a coding workflow do not have the same user experience or success criteria. They can still benefit from the same identity model, observability, deployment process, agent controls, and UI primitives.

## Historical Timeline

The timeline below is based on the project's versioned source history. It deliberately uses the Hedwig pseudonym, omits internal links and repository names, and distinguishes between implementation, release, deployment, adoption, and ownership. Those are different events and should not be collapsed into a single "launched" date.

| Date | Stage | Milestone | Evidence |
| --- | --- | --- | --- |
| March 11, 2026 | Built | The first investigation engine, queue, server, and basic UI were implemented. | Initial source commit `fa920e1e` |
| March 16, 2026 | Released | The release path added version tags, image builds, automatic development deployment, and manual production promotion. | Release `v0.1.0`, commit `1124a7c3` |
| March 18, 2026 | Released | The original on-call application first shipped with a visible product identity and a containerized development workflow. | Release `v0.13.0`, implementation `7a25576d` |
| March 20, 2026 | Deployed | A source revision was explicitly recorded as deployed to the development environment. | Release `v0.15.1`, commit `9a146f55` |
| April 23, 2026 | Expanded | Persistent storage gained a production-oriented database option alongside the local development path. | Release `v0.63.0`, implementation `ce92b504` |
| May 20, 2026 | Observed | A checked-in usage snapshot showed broad awareness of the original application, while also showing that hands-on use was concentrated. | Dated internal analytics report |
| May 21, 2026 | Reframed | The UI changed from a single product into Hedwig, with the original assistant retained as its first application. | Release `v0.136.0`, commit `b36e0327` |
| May 21, 2026 | Expanded | The first clearly separate vertical application was added, proving the shell could support more than its original domain. | Release `v0.141.0`, implementation `eb88cf55` |
| May 21-26, 2026 | Platformized | Registry-driven client navigation and a server-side application manifest replaced manual application wiring. | Releases `v0.145.0` and `v0.158.0`, commits `3b43e8e6` and `982d1177` |
| June 2-5, 2026 | Expanded | Planning and coding-agent applications joined the platform, including the first isolated workspace workflow. | Releases `v0.188.0` and `v0.202.0`, commits `94395de7` and `aff56718` |
| June 30, 2026 | Generalized | A shared workspace-agent manager made isolated execution a platform capability rather than application-specific plumbing. | Release `v1.95.0`, commit `ae508f50` |
| July 10-12, 2026 | Extended | A reusable Slack-agent framework shipped, followed by a dark launch that moved a second workload onto isolated workspace execution. | Releases `v1.177.0` and `v1.181.0`, commits `089f34d5` and `40d92511` |
| July 27, 2026 | Delegated | Application-level code ownership was expanded so the platform did not depend on one central maintainer for every change. | Release `v1.257.0`, commit `8bd4c2dd` |
| August 8-12, 2026 | Added | An interactive coding-agent experience entered beta with durable server-side workspaces, live previews, and a native interface. | Releases `v1.317.0` and `v1.329.0`, commits `b43219fe` and `d41207af` |

There are two deliberate cautions in this table. First, a release proves that code reached the release process; it does not by itself prove a production rollout. Second, an adoption snapshot is evidence of use at a point in time, not proof of long-term value. Those distinctions became important when deciding what to keep investing in.

## The pivot from application to platform

The original on-call workflow needed a surprisingly large amount of supporting software. An agent needed a defined job, bounded tools, a way to report progress, a durable record of what happened, feedback, and a safe path to hand work back to a person.

The next application needed many of those same things. So did the one after that.

The natural response would have been a collection of independent services. We went in a different direction: a deliberately modular monolith with three layers.

| Layer | Responsibility |
| --- | --- |
| Core | Server lifecycle, authentication, configuration, logging, metrics, health checks, and real-time transport. |
| Platform | Agent runtimes, tool registration, integrations, persistence, feature controls, shared UI, and team configuration. |
| Applications | Co-located server and client slices for one user-facing workflow. |

The dependency rule was simple: applications could depend on core and platform, but not on one another. That was not architectural purity for its own sake. It kept reuse intentional. A new application inherited the platform capabilities it needed instead of importing another application's accidental assumptions.

A modular monolith was the right tradeoff for this stage. It made integration cheap, kept the operational surface manageable, and let teams iterate quickly. The cost was shared deployment risk and more coordination as the platform grew. The answer was not to claim that the boundaries were perfect. It was to make them visible with application manifests, ownership rules, scoped data, and review gates.

## Build the environment, not just the prompt

The most reusable Hedwig feature was not a model wrapper. It was the environment around the model.

Each agent declared its execution mode, selected tools, prompt builder, output contract, and budget. The platform supported three broad modes:

1. **Interactive agents** for a person asking questions and steering a conversation.
2. **Background task agents** for bounded work that could run asynchronously and return a structured result.
3. **Workspace agents** for longer-lived tasks that needed an isolated environment, logs, files, terminal access, previews, and follow-up work.

This made it possible to meet a workflow where it actually lived. Some jobs were better as a web application. Some were better in a collaboration tool. Some needed a durable workspace that could be watched and corrected while it ran.

The design principle was that models supplied interpretation, exploration, and synthesis. Deterministic code owned routing, validation, permissions, formatting, persistence, state transitions, and side effects.

That division is easy to state and hard to preserve. Every time we let prose stand in for an output contract, a downstream system had to guess what the agent meant. Every time we relied on prompt text as an authorization boundary, we created a policy that could not be reliably enforced. Structured tool calls and validated output added constraints, but they also made systems easier to test, observe, and safely connect to real workflows.

## Playgrounds, products, and the cost of experimentation

The platform made it cheap to trial an idea. That was useful, but it was not automatically a virtue.

Experiments had a clearer path when they were visibly separate from maintained applications. A playground could test whether a workflow was worth building without first needing a full product commitment. If it demonstrated repeat use and a clear owner, it could graduate into a maintained application. If it did not, it could be removed without leaving an orphaned service, release path, or design language behind.

This was one reason shared infrastructure paid off. A contributor could work on a narrowly defined application without first building login, deployment, observability, agent invocation, or the basic interface shell. The platform lowered the cost of trying an idea, while the application boundaries made it possible to stop trying one.

## What did not work

The useful history is not just the list of features that survived.

We repeatedly learned that broad access was not the same as capability. Tool access became more explicit and agent-specific rather than giving every agent every integration. That improved both safety and debuggability.

We learned that polling was a poor default for long-running work. It made progress feel unreliable and created lifecycle problems at exactly the point where a user most needed confidence. Event streaming was more complex, but it made asynchronous work understandable.

We learned that fully agent-generated artifacts were often too hard to trust or maintain. In several cases, the better product was a deterministic builder that used AI only for the analysis where judgment was valuable.

We learned to delete features. An experiment that receives little repeat use should not be preserved just because it was difficult to build. Removing low-value surfaces is part of keeping a platform coherent.

We also learned that concurrency changes the problem. More parallel agent work can move the bottleneck to review, queues, infrastructure capacity, and coordination. Isolated workspaces helped, but they also required cancellation, limits, cleanup, stuck-run detection, and careful credential boundaries.

## Adoption was uneven, and that was useful information

The original assistant gained broad awareness, but the data also showed that its most intensive usage was concentrated. That is a healthier finding than a vague claim that an internal tool was "adopted."

Pageviews, sessions, and agent runs are signals, not outcomes. They can be dominated by testing, training, or one highly engaged maintainer. Better questions were:

- Did people return without being prompted?
- Did the output lead to an accepted decision, ticket, pull request, or completed task?
- Could a workflow be repeated by someone other than the original builder?
- Did the system reduce the time or coordination needed for a real job?

Those questions also helped separate the platform from its applications. Hedwig could make an application easier to build and operate; that did not prove the application was useful. Domain teams still needed to own that judgment.

## Ownership is part of the architecture

A shared platform creates an ownership problem as soon as it becomes useful.

Centralizing the plumbing reduced duplication, but it also risked centralizing every maintenance request. We pushed ownership outward through application boundaries, path-based review ownership, and contributor responsibilities. The platform team still had to protect the shared contracts, but it could not be the permanent owner of every domain workflow.

The handoff work made this especially clear. A platform with a thin maintainer group may be technically stable while still being organizationally fragile. Documentation, release practices, access paths, feature tours, open issues, and contribution guides are not paperwork after the engineering is complete. They are part of what makes an internal platform durable.

If I were starting again, I would establish the minimum maintainer model and application ownership earlier. It is much easier to add a new application than to create sustainable responsibility for it after people depend on it.

## Hedwig and Ramp Inspect

[Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) is a useful comparison, but it is not the same product category.

Inspect is a deeply optimized background coding-agent system. Its public description emphasizes per-session remote development environments, parallel work, coding-context integrations, testing, telemetry, visual verification, and pull-request workflows. Its central question is how to make the complete coding loop work better than local, generic agent tooling.

Hedwig addressed a broader question: how can teams build and govern many types of internal AI applications without each one reinventing the surrounding infrastructure? Its workspace agents overlapped with Inspect in meaningful ways, especially for coding workflows, but coding was one workload among several rather than the organizing principle of the entire platform.

| Dimension | Hedwig | Ramp Inspect |
| --- | --- | --- |
| Primary scope | Shared platform for internal AI applications | Background software-development agent |
| Extensibility unit | Applications, agent types, tools, and integrations | Coding sessions, repository environments, and clients |
| Execution model | Interactive, background, and isolated workspace agents | Per-session remote development environments |
| Main strength | Reusing governed internal infrastructure across workflows | Deep optimization of the coding loop |
| Verification | Structured output, tracing, domain tools, and application-specific checks | Tests, telemetry, screenshots, previews, and pull-request workflows |
| Tradeoff | Broad platform surface and shared coordination cost | Substantial investment in a coding-specific runtime and client experience |

Inspect looks like the stronger reference point for a company whose primary goal is a best-in-class background coding agent. Hedwig's lesson was different: an internal platform can make focused AI applications cheaper to build, provided the platform stays opinionated about safety, ownership, and the distinction between experimentation and a maintained product.

## What I learned

Hedwig grew from a useful workflow rather than a clean platform plan. That is probably why it acquired the abstractions it actually needed.

- Start with one real job, not a generic agent framework.
- Centralize the plumbing that is expensive to recreate: identity, observability, release paths, tool policy, and UI foundations.
- Keep domain ownership distributed. A platform should make applications easier to build, not take responsibility for every application forever.
- Treat permissions as code and infrastructure, not instructions in a prompt.
- Prefer deterministic software whenever judgment does not add value.
- Measure repeat, accepted outcomes rather than activity alone.
- Design the maintainer model before the platform becomes important.

The enduring lesson is not that every internal tool should turn into a platform. It is that a platform becomes justified when many real workflows share the same hard constraints. When that happens, the durable asset is not the chat interface. It is the environment that makes the right actions possible, observable, and governable.
