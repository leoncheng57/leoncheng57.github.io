---
title: "My cmux Setup for Parallel AI Coding"
description: "How I organize coding agents, browser context, worktrees, reusable layouts, and notifications in cmux."
publishedAt: "2026-08-03"
tags:
  - workflow
  - AI
  - developer-tools
---

# My cmux Setup for Parallel AI Coding

I have been using [cmux](https://cmux.dev) as the home for my AI coding sessions, and this setup has been surprisingly useful. It is not meant to be the one correct workflow. I am sharing it because other people may want to copy individual ideas from it.

The basic idea is simple: each task gets its own workspace, with the agent, browser tabs, and project context kept together. I can start several bounded tasks, continue with something else, and return when an agent needs me.

## TL;DR

- Use one cmux workspace per task or project.
- Keep the coding agent and relevant browser tabs side by side.
- Use separate worktrees when several changes need to run in parallel.
- Save layouts for recurring workflows.
- Use visual, sound, and spoken notifications so completed sessions do not disappear into the background.

## One workspace, one task

My sidebar acts as a control center. Each active task has a workspace rooted in the relevant project or worktree. Inside it, I usually keep OpenCode in one pane and the task's browser tabs in another.

This separation makes parallel work much easier to follow. Project files, terminal history, the agent session, and reference material all stay attached to the same task instead of becoming mixed across one large terminal and browser window.

I also configured `Cmd+T` and a tab-bar button to start OpenCode in the current workspace. For recurring work, I use saved layouts. One layout opens OpenCode beside Notion and Slack; another opens it beside the application and its GitLab issue.

## What the layout looks like

![A sanitized cmux workspace with a task sidebar, OpenCode terminal, local preview, issue, and documentation tabs.](/blog/cmux-setup/workspace-layout.svg "A privacy-safe recreation of my cmux layout. Real project names, issue details, and terminal content have been removed.")

The sidebar shows all active tasks, while the selected workspace keeps its agent and browser context together. A notification brings me back when that agent finishes or needs input.

## Why I keep browser tabs inside each workspace

The browser is part of the working context, not a separate place I visit occasionally.

### Preview and annotate frontend work

I can run a project locally and keep its localhost preview beside the agent. cmux's Design Mode, available from the paintbrush icon, lets me annotate the page and point out frontend changes visually instead of trying to describe every spacing or layout adjustment in text.

### Keep the task visible

I can leave Jira, Notion, a GitLab work item, or a GitHub issue open beside the implementation. That makes it easy to update progress, check acceptance criteria, and keep the agent aligned with the actual task.

### Keep research with the work

Documentation, references, and other useful pages remain in the workspace where they matter. cmux also restores those browser tabs with the workspace after a restart or crash, so I do not have to reconstruct the task context from browser history.

## Worktrees without leaving the workspace

cmux can create new worktrees and workspaces through AI commands too. That turns the one-workspace-per-task convention into something the agent can set up instead of a process I have to repeat manually.

When several changes need to move in parallel, each gets an isolated worktree and its own cmux workspace. The code, agent session, browser tabs, and task history stay together, while the underlying Git branches remain separate.

## Notifications that bring me back

Parallel agent sessions are only useful if I notice when they finish. My setup uses cmux's unread indicators, pane flash, dock badge, menu-bar status, and notification sound. I also run a spoken notification:

```bash
say "agent session done"
```

If an agent is waiting for approval or asking a question, the message changes to "Input for agent needed." This means I can look away from cmux without repeatedly checking every workspace.

## Why this works for me

The main benefit is not fitting more terminals on the screen. It is preserving context while several tasks move independently.

A workspace tells me what the task is, where its code lives, what the agent is doing, which issue tracks it, and which pages are relevant. When a notification arrives, I can jump back into that complete context rather than first figuring out which terminal finished.

## Conclusion

This setup grew from small conveniences: one workspace per task, browsers beside agents, reusable layouts, and notifications I cannot miss. Together they made parallel AI coding feel much more manageable.

Feel free to copy the whole setup or just the pieces that fit your workflow.
