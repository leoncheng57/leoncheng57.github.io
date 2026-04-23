---
title: "A Template for Technical Design Documents"
description: "A reusable skeleton for writing clear, reviewable technical design docs, with section-by-section prompts and sample text."
publishedAt: "2026-04-23"
tags:
  - design-docs
  - engineering
  - process
  - writing
---

# A Template for Technical Design Documents

> I have worked at many different tech companies. Amazon had the best writing culture. Here is an example of a technical design doc format that might have been used. Of course note that this is just one template and there are many valid templates. But it gives you an idea of what's important in the technical design phase.

## Contents

- [How to use this template](#how-to-use-this-template)
- [Template Sections](#template-sections)
  - [Problem Statement](#problem-statement)
  - [Goals and Non-Goals](#goals-and-non-goals)
  - [Page Designs / UX References](#page-designs--ux-references)
  - [Technical Plan](#technical-plan)
  - [Alternatives Considered](#alternatives-considered)
  - [Rollout Plan](#rollout-plan)
  - [Breaking Changes](#breaking-changes)
  - [Success Criteria](#success-criteria)
  - [Dependencies](#dependencies)
  - [Risks and Mitigations](#risks-and-mitigations)
  - [Open Questions](#open-questions)
  - [Appendix](#appendix)

Most engineering teams eventually converge on some flavor of a technical design doc. The exact name varies — RFC, design review, tech spec, ADR — but the purpose is the same: write down the plan before writing the code, so that reviewers can poke holes in the plan while it is still cheap to change.

This post is a reusable template. The headings below are the ones I keep reaching for. Each section includes a short prompt describing what belongs there, and a sample line or two in the tone you might actually write in. Steal it, rename it, remove sections that don't apply. The value is in the structure, not the exact wording.

## How to use this template

A few notes on making the template actually useful in practice rather than a wall of empty headings:

- **Delete sections that don't apply.** A small backend-only change does not need a `Page Designs` section. A pure UX change may not need an `Alternatives Considered` section. The template is a checklist, not a contract.
- **Keep it short.** If a section can be one sentence, make it one sentence. Reviewers read more carefully when there is less to read.
- **Circulate early.** A half-finished doc with a clear problem statement and a rough technical plan gets better feedback than a polished doc that has already closed off the design space.

The goal is to make it cheap to have a design conversation in writing, have a historical marker to look back on, centralize multi-stakeholder discussions, plan ahead like a senior engineer, and catch problems as early as possible to make deadlines predictable and bandwidth accurate.

## Template Sections

### Problem Statement

**Prompt:** What is broken today? Who feels it, how often, and how much does it cost? Quantify if you can. End with a one-sentence framing of what this doc proposes to change.

> A long-running internal report has fallen behind its SLA for three consecutive quarters. Traces and team interviews point to the same root cause: a blocking step that runs on every request but is only needed for a small subset. This document proposes making that step conditional, behind a feature flag.

Link out to supporting docs — the PRD, customer research, analytics dashboards — rather than recreating them here.

### Goals and Non-Goals

**Prompt:** What is this doc actually trying to accomplish? What is explicitly out of scope? Non-goals are as important as goals; they prevent reviewers from pulling the discussion sideways.

**Goals**
- Reduce drop-off on the affected flow
- Keep rollout reversible within minutes
- Preserve behavior for every unaffected user segment

**Non-Goals**
- Redesigning the page visually
- Changing the pricing model
- Addressing known issues in the adjacent settings flow

### Page Designs / UX References

**Prompt:** Link to Figma, mockups, or user flow diagrams. If the design is load-bearing for the technical plan, embed a screenshot so readers don't have to context-switch.

> Design reference: [link to Figma]
> User flow diagram: [link to FigJam]

### Technical Plan

This is the section reviewers will spend the most time on. Break it down by surface area — page, service, endpoint — rather than trying to describe the whole change in one long paragraph.

#### `/some-page` (or `ServiceName`)

**Old behavior.** Describe how it works today, in one or two sentences. Be concrete enough that a new team member could follow it.

**New behavior.** Describe the target state with the same level of specificity.

**Approach.** How the code will actually change. Name the module, the function, or the boundary. If there are multiple plausible approaches, list them:

- **Option A:** Modify the shared pipeline. Semantically clean, but widens the blast radius.
- **Option B:** Add a dedicated branch at the entry point. Isolates the change, trivial to roll back.
- **Recommendation:** Option B, because the experiment is time-bounded and we want the rollback cost to be near zero.

Repeat the same sub-structure for every surface the change touches.

#### Backend change

**Prompt:** If there are backend changes, describe the validation, storage, or API contract that moves. Call out the existing code path you are mirroring, if any — that is usually the cleanest signal that the change is low-risk.

> Relax the check in `SomeValidationService` for the specific case. Route the new case through an existing branch that already handles a structurally similar scenario, rather than inventing a new one.

### Alternatives Considered

**Prompt:** What did you rule out, and why? Reviewers often want to reopen an alternative you already evaluated — saving them the round-trip by writing it down here is cheap and respectful of their time.

> **Alternative 1: do nothing.** Cheapest option. Rejected because the metric has been flat for two quarters and customer research consistently points to the same root cause.
>
> **Alternative 2: a larger redesign.** Higher ceiling but much higher cost and risk. Better suited for a follow-up once this smaller change has been measured.

### Rollout Plan

**Prompt:** How does this ship? Flag-gated? Staged? What order do the changes land in, and what is the ramp schedule?

1. Backend change lands and is promoted. No user-facing behavior change yet.
2. Frontend changes land behind a disabled flag.
3. Flag is ramped to a small percentage of users for a short observation window.
4. If guardrail metrics hold, ramp to 100%. Otherwise, flip the flag off and investigate.

### Breaking Changes

**Prompt:** Are there any? If not, say so explicitly — reviewers will ask either way. If yes, list each one and how it will be communicated.

> None. The change is gated behind a feature flag and preserves behavior for every segment not in the experiment.

### Success Criteria

**Prompt:** How will you know this worked? Name the primary metric, the direction you expect it to move, and the secondary metrics that act as guardrails.

- **Primary:** drop-off rate on the affected flow decreases by at least X percentage points.
- **Guardrails:** adjacent flow conversion rates remain within their historical ranges; support ticket volume for the affected area does not spike.

### Dependencies

**Prompt:** Who do you need, and for what? Name teams, not just people — on-call rotations change.

- Team A: owns the validation service the backend change touches.
- Team B: owns the flag and experiment infrastructure.
- Team C: owns the downstream pipeline that consumes the affected state.

### Risks and Mitigations

**Prompt:** For each meaningful risk, state the risk concretely, what you are doing to reduce its likelihood, and what you will do if it materializes.

- **Risk:** guardrail metric moves against us during ramp. **Mitigation:** feature flag makes rollback instant; on-call rotation is briefed on the rollback procedure before ramp.
- **Risk:** change accidentally affects an unrelated code path. **Mitigation:** change is isolated to a dedicated branch at the entry point; existing code paths are covered by the current test suite.

### Open Questions

**Prompt:** Write down what you don't yet know. This is where reviewers add the most value, because you are explicitly inviting them to.

- Should we combine this change with another adjacent experiment, or keep them separate for cleaner attribution?
- Is there an existing dashboard for the guardrail metric, or do we need to build one before ramp?
- Who owns the follow-up cleanup if the experiment wins and ramps to 100%?

### Appendix

**Prompt:** Anything that would be useful to a reader but would bog down the main body. Old screenshots, raw data, detailed timelines, earlier proposals that were ruled out.
