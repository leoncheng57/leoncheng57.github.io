---
title: "Controlling Coding Agent Sessions From Your Phone"
description: "Phone-oriented control of local agent sessions using OpenCode Web, Tailscale, and ntfy — without enterprise approvals or public GitHub repos."
publishedAt: "2026-08-09"
tags:
  - AI
  - workflow
  - developer-tools
draft: true
---

# Controlling Coding Agent Sessions From Your Phone

Agent sessions run long. A single instruction can take minutes or longer, and the natural next question is: why am I chained to my desk while it works? I want to kick off a task, walk away, get pinged when the agent finishes or needs input, and answer from my phone.

The obvious products that solve this have a catch. The good news is that you do not need any of them. This post describes the setup I actually use: **OpenCode Web + Tailscale + ntfy**, running entirely against my own machine.

## TL;DR

- Cloud agent surfaces like Codex cloud and Claude Code on the web are great, but in an enterprise they typically need organization-level approval before you can point them at company code.
- Most self-serve alternatives assume your code lives in a public GitHub repository, which is rarely true for an industry engineer.
- Instead: run `opencode web` on your workstation, expose it privately over your tailnet with `tailscale serve`, and use a small OpenCode plugin to push ntfy notifications to your phone.
- The agent, the code, and the credentials never leave the machine they already live on. Your phone is just another screen.

## The approval problem

The polished phone experiences for coding agents are cloud products. [Codex cloud](https://developers.openai.com/codex/cloud) runs tasks in OpenAI-managed containers; [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) runs sessions on Anthropic-managed VMs that you can monitor from the mobile app. Both are genuinely good at asynchronous, start-from-anywhere work — I compared the execution models in [Worktrees, Remote Coding Agents, and Choosing the Right Kind of Isolation](https://leoncheng.dev/blog/worktrees-vs-remote-coding-agents).

But both run your code on vendor infrastructure, and that is exactly the part an employer has to sign off on. GitHub app installs, repository access grants, data-handling review, enterprise plan features — none of it is something an individual engineer can just enable on a Tuesday.

There is also a quieter assumption baked into many of the self-serve tools in this space: that your project is a public GitHub repository, or at least a personal one you can freely connect to a third-party service. For hobby projects, fine. For the codebases I work on professionally, that is a non-starter.

So the requirements for a workable setup are:

1. The code and the agent stay on my machine.
2. Nothing is exposed to the public internet.
3. My phone can see the session, steer it, and approve permission prompts.
4. I get a push notification when the agent finishes or gets stuck.

## The stack

Three pieces, each doing one job:

```
┌────────────┐   Tailscale (WireGuard)   ┌──────────────────────────────┐
│   Phone    │◀─────────────────────────▶│  Workstation                 │
│            │                           │                              │
│  Browser ──┼── https://machine.ts.net ─┼─▶ tailscale serve ─▶ :4096   │
│            │                           │        opencode web          │
│  ntfy app ◀┼── push notification ──────┼── OpenCode plugin (events)   │
└────────────┘                           └──────────────────────────────┘
```

- **[OpenCode Web](https://opencode.ai/docs/web/)** — OpenCode ships a browser UI. `opencode web` starts a local server with the same sessions you use from the TUI; you can even attach a terminal to the same server and drive one session from both.
- **[Tailscale Serve](https://tailscale.com/kb/1242/tailscale-serve)** — a private reverse proxy into your tailnet. Your phone reaches the web UI over an encrypted WireGuard tunnel with automatic HTTPS. Nothing is opened to the public internet (that would be Funnel — do not use Funnel for this).
- **[ntfy](https://docs.ntfy.sh/publish/)** — dead-simple pub/sub push notifications. Publishing is an HTTP POST; the phone app subscribes to a topic and buzzes.

### 1. Start OpenCode Web

On the workstation:

```bash
OPENCODE_SERVER_PASSWORD=<something-long> opencode web --port 4096
```

By default it binds to `127.0.0.1`, which is exactly what you want — Tailscale will be the only way in. The password enables HTTP basic auth (username defaults to `opencode`). Do not skip it: anyone on your tailnet would otherwise have full access to an agent that can run shell commands as you.

### 2. Serve it over the tailnet

```bash
tailscale serve --bg 4096
```

That gives you a stable `https://<machine>.<tailnet>.ts.net` URL, TLS included, reachable only by devices in your tailnet. With `--bg` it persists across reboots. Install Tailscale on your phone, sign in to the same tailnet, and the URL just works in the phone browser.

The web UI is not a toy: you can watch the session stream, send follow-up prompts, respond to permission requests, and start new sessions. On a phone it is entirely usable for the steering-and-approving style of interaction — I would not write a design doc from it, but that is not the job.

### 3. Get pinged with ntfy

The missing piece is knowing *when* to pick up the phone. OpenCode's [plugin system](https://opencode.ai/docs/plugins/) exposes session lifecycle events, so notifications fire from the actual event stream — no relying on the agent to remember to notify you.

Drop this into `~/.config/opencode/plugins/ntfy.js`:

```js
const NTFY_URL = "https://ntfy.sh/<your-random-topic>"
const WEB_URL = "https://<machine>.<tailnet>.ts.net"

async function notify(title, message, priority) {
  await fetch(NTFY_URL, {
    method: "POST",
    body: message,
    headers: {
      Title: title,
      Priority: priority,
      Click: WEB_URL,
    },
  })
}

export const NtfyPlugin = async () => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await notify("opencode", "Agent session done", "default")
      }
      if (event.type === "permission.asked") {
        await notify("opencode", "Input for agent needed", "high")
      }
      if (event.type === "session.error") {
        await notify("opencode", "Agent session error", "high")
      }
    },
  }
}
```

Subscribe to the same topic in the ntfy phone app. The `Click` header means tapping the notification opens the web UI directly — notification to steering in one tap. This mirrors the notification philosophy from [my cmux setup](https://leoncheng.dev/blog/my-cmux-setup-for-parallel-ai-coding): parallel sessions are only useful if you reliably notice when they need you.

Two notes on ntfy hygiene:

- On the public ntfy.sh server, **the topic name is the only access control** — treat it like a password. Use a long random topic, or self-host ntfy / pay for access-controlled topics.
- Keep notification bodies generic ("session done", "input needed"). Do not put repository names, branch names, or error text into a message that transits a third-party push service.

## What a day with this looks like

Start a task at my desk, or from the phone itself. Walk away. The phone buzzes: "Input for agent needed." Tap the notification, land in the session, read the permission prompt, approve or redirect, pocket the phone. Buzz again later: "Agent session done." Skim the diff summary from the couch and queue up the review for when I am back at a real keyboard.

The important property is that this changes *where I can be* without changing *where the work happens*. Same machine, same checkout, same credentials, same MCP servers and local services — the environment-fidelity argument for local sessions stays fully intact.

## What I tried that did not work, and other options

I first tried [OpenChamber](https://github.com/openchamber/openchamber), a community desktop/web/mobile frontend for OpenCode with a built-in private relay and device pairing. It looks like the most complete packaged answer to this exact problem, but I could not get it working in my environment. Your mileage may vary — it is actively developed and worth a look before you assemble things by hand.

The rest of the [OpenCode ecosystem](https://opencode.ai/docs/ecosystem/) has a few other credible routes, mostly alternate frontends rather than plugins:

- **[Portal](https://github.com/hosenur/portal)** — a mobile-first web UI for OpenCode, explicitly designed to be used over Tailscale or a VPN. Closest in spirit to this post's setup.
- **[CodeNomad](https://github.com/NeuralNomadsAI/CodeNomad)** — a desktop/server workspace for OpenCode with remote browser access and notifications.
- **[Kimaki](https://github.com/remorses/kimaki)** — drives OpenCode from Discord; each project is a channel, each session a thread. If you live in Discord, your phone client already exists.

I have not run these three in anger, so treat them as pointers, not endorsements. The stack in this post has the advantage of being almost entirely first-party: the web UI is built into OpenCode, and Tailscale and ntfy are boring, well-understood infrastructure.

## Security notes, seriously

- This is a way to reach *your own machine* from *your own phone*. It is not a way to route around your employer's security policy — if your company forbids remote access to dev machines, that decision wins.
- Keep OpenCode bound to localhost and let Tailscale Serve be the only path in. Never use `--hostname 0.0.0.0` on a network you do not control, and never use Tailscale Funnel for this.
- Always set `OPENCODE_SERVER_PASSWORD`. Defense in depth: the tailnet gates the network, the password gates the app.
- Use tailnet ACLs to limit which devices can reach the workstation, and revoke devices promptly if a phone is lost.
- Remember what this UI can do: it fronts an agent with shell access. Treat the whole path with the same care you would give SSH keys.

## Conclusion

Phone control of agent sessions does not require an enterprise procurement cycle or moving your code to someone else's cloud. A local-first stack — OpenCode Web for the interface, Tailscale for private transport, ntfy for the tap on the shoulder — gets you the core of what the cloud products offer, on the code you actually work on, today.
