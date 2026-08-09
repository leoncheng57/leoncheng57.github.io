---
title: "Controlling Coding Agent Sessions From Your Phone"
description: "How I use OpenCode Web, Tailscale, and ntfy to monitor and steer local coding agent sessions from my phone."
publishedAt: "2026-08-09"
tags:
  - AI
  - workflow
  - developer-tools
draft: true
---

# Controlling Coding Agent Sessions From Your Phone

Agent sessions run long. A single instruction can take minutes or longer, and the natural next question is: why am I chained to my desk while it works? I want to kick off a task, walk away, get pinged when the agent finishes or needs input, and answer from my phone.

The obvious products that solve this have a catch. The good news is that you do not need any of them. This post describes the setup I actually use: **OpenCode Web + Tailscale + ntfy**, with the agent and code still running on my own machine. I packaged the scripts and plugin in [opencode-remote-control-and-notifications](https://github.com/leoncheng57/opencode-remote-control-and-notifications).

## TL;DR

- Cloud agent surfaces like Codex cloud and Claude Code on the web are great, but in an enterprise they typically need organization-level approval before you can point them at company code.
- Many self-serve alternatives assume your code lives in a public GitHub repository, which is rarely true for an industry engineer.
- Instead, bind `opencode web` only to your workstation's Tailscale IP and use an OpenCode plugin to push ntfy notifications to your phone.
- Tapping a notification opens the exact session, so you can answer a question, approve a command, or steer the agent from the phone browser.

## The approval problem

The polished phone experiences for coding agents are cloud products. [Codex cloud](https://developers.openai.com/codex/cloud) runs tasks in OpenAI-managed containers; [Claude Code on the web](https://code.claude.com/docs/en/claude-code/claude-code-on-the-web) runs sessions on Anthropic-managed VMs that you can monitor from the mobile app. Both are genuinely good at asynchronous, start-from-anywhere work. I compared the execution models in [Worktrees, Remote Coding Agents, and Choosing the Right Kind of Isolation](https://leoncheng.dev/blog/worktrees-vs-remote-coding-agents).

But both run your code on vendor infrastructure, and that is exactly the part an employer has to sign off on. GitHub app installs, repository access grants, data-handling review, and enterprise controls are not things an individual engineer can necessarily enable on a Tuesday.

There is also a quieter assumption baked into many self-serve tools in this space: that your project is a public GitHub repository, or at least a personal one you can freely connect to a third-party service. For hobby projects, fine. For the codebases I work on professionally, that is a non-starter.

So the requirements for a workable setup are:

1. The code and agent execution stay on my machine.
2. The web interface is reachable only through my tailnet.
3. My phone can see the session, steer it, and approve permission prompts.
4. I get a push notification when the agent finishes or gets stuck.

## The stack

Three pieces, each doing one job:

```
┌─────────┐   Tailscale (WireGuard)   ┌──────────────────────┐
│  phone  │ ────────────────────────▶ │  Mac: opencode web   │
│ browser │   http://100.x.y.z:4096   │  (tailnet-only bind) │
└─────────┘                           └──────────┬───────────┘
     ▲                                          │ session idle /
     │  push notification (tap to open session) │ needs approval /
     │                                          │ question
┌────┴────┐                          ┌───────────▼──────────┐
│ ntfy app│ ◀─────────────────────── │ ntfy-notify plugin  │
└─────────┘       ntfy.sh            └──────────────────────┘
```

- **[OpenCode Web](https://opencode.ai/docs/web/)** provides the browser UI and access to the same local projects, sessions, tools, and credentials I already use at my desk.
- **[Tailscale](https://tailscale.com/)** provides an encrypted WireGuard path between my phone and workstation. OpenCode listens directly on the Tailscale interface, not the LAN or public internet.
- **[ntfy](https://docs.ntfy.sh/publish/)** provides push notifications. The plugin publishes an HTTP request when a session finishes a turn, requests permission, or asks a question.

The codebase and execution stay local. If I use the public ntfy.sh service, notification metadata does leave the machine; I cover that tradeoff in the security section.

## Setup

The complete setup is in the companion repository:

```bash
git clone https://github.com/leoncheng57/opencode-remote-control-and-notifications.git
cd opencode-remote-control-and-notifications
./install.sh
```

The installer generates a random ntfy topic, stores it in `~/.config/opencode/ntfy-topic` with mode `600`, symlinks the plugin into the OpenCode plugin directory, registers it in `opencode.json`, and optionally installs `qrencode`.

Install Tailscale on the workstation and phone, join both to the same tailnet, and subscribe to the generated topic in the ntfy phone app. Then add the repository's `bin/` directory to your `PATH` and start the server:

```bash
oc-web
```

The important part of `oc-web` is small:

```bash
TS_IP="$(tailscale ip -4 2>/dev/null | head -1 || true)"
if [ -z "$TS_IP" ]; then
  echo "error: Tailscale is not connected; refusing to start" >&2
  exit 1
fi

export OC_WEB_URL="http://$TS_IP:4096"
exec opencode web --hostname "$TS_IP" --port 4096
```

This is intentionally not `0.0.0.0`, and it does not use Tailscale Funnel. The process binds only to the machine's Tailscale address. If Tailscale is unavailable, the launcher fails closed instead of falling back to localhost, the LAN, or every interface.

I keep `oc-web` running in a terminal or tmux. The workstation has to remain awake and online; this is remote control of a local agent, not remote execution in a vendor cloud.

## Notifications that open the exact session

OpenCode's [plugin system](https://opencode.ai/docs/plugins/) exposes lifecycle and tool events. The plugin tracks session titles, assistant text, and turn start times, then publishes on three useful transitions:

| Trigger | Priority | Notification |
| --- | --- | --- |
| Session becomes idle | Default | Session title, final-message snippet, and turn duration |
| Permission requested | High | What the agent wants to run |
| Question tool runs | High | Question text and available options |

The core event wiring looks like this; the [full plugin](https://github.com/leoncheng57/opencode-remote-control-and-notifications/blob/main/plugins/ntfy-notify.js) adds deduplication, state pruning, message tracking, and header sanitization:

```js
export const NtfyNotify = async () => ({
  event: async ({ event }) => {
    trackEvent(event)
    const props = event.properties || {}

    if (event.type === "session.idle") {
      notifyIdle(props.sessionID)
    }

    if (event.type === "session.status" && props.status?.type === "idle") {
      notifyIdle(props.sessionID)
    }

    if (event.type === "permission.updated") {
      const permission = props.permission || props.info || props
      if (!permission.time?.completed) notifyPermission(props)
    }
  },

  "tool.execute.before": async (input, output) => {
    if (input.tool !== "question") return
    notifyQuestion(input.sessionID, output.args)
  },
})
```

Each ntfy message includes a `Click` header pointing to an OpenCode Web deep link:

```text
http://100.x.y.z:4096/server/<base64url-server>/session/<session-id>
```

Tapping the push notification skips the homepage and opens the exact session that needs attention. That makes the loop notification → context → response rather than notification → hunt through a session list → response.

### A plugin footgun

`opencode web` creates one plugin instance per project directory, and each instance has its own event bus. A process-wide "install once" guard looks reasonable but silently disables notifications for every project except the first one loaded.

The plugin therefore registers its hooks for every instance and keeps only shared bookkeeping — debounce timestamps, titles, message snippets, and permission IDs — on `globalThis`. This is the kind of bug that makes a notification setup seem intermittently broken when the real problem is project-specific event registration.

## Small tools that make it practical

The repository includes two helpers beyond the server launcher:

```bash
oc-link ~/Documents/Projects/my-project
oc-link ~/Documents/Projects/my-project ses_xxx
oc-notify-test
```

`oc-link` prints a bookmarkable new-session link for a project, or a deep link for an existing session. If `qrencode` is installed, it also renders a terminal QR code, which is much nicer than typing a Tailscale IP and encoded path on a phone.

`oc-notify-test` sends a high-priority test push. Run it first when notifications do not arrive: if the phone buzzes, the ntfy channel is healthy and the remaining problem is plugin loading or event handling.

## What a day with this looks like

I start a task at my desk, or open a project link from the phone. Then I walk away. The phone buzzes with a question or approval request. I tap the notification, land in the exact session, respond, and pocket the phone. When the turn ends, another notification includes the last response and how long the agent worked.

The important property is that this changes *where I can be* without changing *where the work happens*. It is still the same machine, checkout, credentials, MCP servers, and local services. The environment-fidelity argument for local sessions stays intact.

## Current OpenCode Web workarounds

> These workarounds were needed in August 2026. OpenCode Web is moving quickly, so check the linked issues before copying them.

### The project picker can show no folders

The web UI's folder picker is rooted at `$HOME`. On a real development machine, indexing the entire home directory may effectively never finish, leaving the "Add project" dialog at "No folders found."

`oc-web` currently works around this by setting `OPENCODE_TEST_HOME` to the chosen project root. That makes the picker index a small, relevant directory in seconds. The tradeoff is that `~/.claude` skill discovery follows the temporary home and `~` in OpenCode's path display refers to the served directory.

Tracking: [issue #41155](https://github.com/anomalyco/opencode/issues/41155), [issue #37611](https://github.com/anomalyco/opencode/issues/37611), and [PR #41153](https://github.com/anomalyco/opencode/pull/41153).

### A fresh browser can look empty

The project and session rail is browser-local state. A new phone browser may show an empty homepage even though the server has active projects and sessions. Add a project once or open an `oc-link` deep link to initialize that browser.

Tracking: [issue #37606](https://github.com/anomalyco/opencode/issues/37606) and [issue #40399](https://github.com/anomalyco/opencode/issues/40399).

## What I tried that did not work, and other options

I first tried [OpenChamber](https://github.com/openchamber/openchamber), a community desktop, web, and mobile frontend for OpenCode with a built-in private relay and device pairing. It looks like the most complete packaged answer to this problem, but I could not get it working in my environment. Your mileage may vary; it is actively developed and worth evaluating before assembling the pieces yourself.

The [OpenCode ecosystem](https://opencode.ai/docs/ecosystem/) has a few other credible routes, mostly alternate frontends rather than plugins:

- **[Portal](https://github.com/hosenur/portal)** is a mobile-first web UI for OpenCode, explicitly designed for Tailscale or VPN access.
- **[CodeNomad](https://github.com/NeuralNomadsAI/CodeNomad)** is a desktop and server workspace with remote browser access and notifications.
- **[Kimaki](https://github.com/remorses/kimaki)** drives OpenCode from Discord, mapping each project to a channel and each session to a thread.

I have not used those three enough to endorse them. The setup in this post stays relatively small and keeps the official OpenCode Web UI as the control surface.

## Security notes, seriously

- This reaches *your own machine* from *your own phone*. It is not a way around your employer's security policy. If remote access to development machines is prohibited, that decision wins.
- The launcher deliberately uses no OpenCode password because it binds exclusively to the Tailscale interface. Tailnet membership and ACLs are the access-control boundary. If you bind to the LAN or `0.0.0.0`, set `OPENCODE_SERVER_PASSWORD` and understand what you are exposing.
- Restrict workstation access with Tailscale ACLs or grants, and revoke a lost phone promptly.
- The ntfy topic name is effectively a password. The installer generates a random suffix, stores it with mode `600`, and keeps it out of Git. Rotate it by deleting `~/.config/opencode/ntfy-topic` and running `install.sh` again.
- Notifications include session titles and fragments of agent output. If that is too much information to send through public ntfy.sh, set `NTFY_SERVER` to a self-hosted ntfy instance, ideally reachable only inside the tailnet.
- The web UI fronts an agent with your local shell access. Treat access to it with the same care you would give SSH credentials.

## Conclusion

Phone control of agent sessions does not require an enterprise procurement cycle or moving the execution environment to someone else's cloud. OpenCode Web provides the interface, Tailscale provides the private path, and ntfy provides the tap on the shoulder.

The complete implementation — launcher, event plugin, project and session deep links, notification test, and installer — is available at [leoncheng57/opencode-remote-control-and-notifications](https://github.com/leoncheng57/opencode-remote-control-and-notifications).
