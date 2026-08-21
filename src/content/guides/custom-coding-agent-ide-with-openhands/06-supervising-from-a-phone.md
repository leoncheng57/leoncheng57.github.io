---
title: "Supervising from a phone"
description: "The same control plane over a tailnet, so a long run does not pin me to a desk."
part: "Operate"
---

# Supervising from a phone

Long runs are mostly waiting. The value of a browser control plane is that waiting does not have to happen at the desk: the agent keeps working on my machine, and I check on it from a phone.

![A screen recording of the custom OpenHands IDE running in a mobile browser.](component:mobile-tour)

There is no app and no tunnel to a cloud. `bash scripts/dev.sh --tailscale` detects the machine's tailnet name and allows it through Vite's host check; the phone reaches the same origin over [Tailscale](https://tailscale.com/). Execution never leaves the laptop.

```text
  phone (tailnet) ─┐
                   ├─► same Express BFF ─► agent server ─► repos
  laptop browser ──┘
```

The layout is responsive rather than a separate product. The side panels that sit in a rail on a desktop collapse into a bottom sheet, the transcript takes the full width, and the composer keeps the controls that matter when steering: the Build/Plan switch, the model, and Send. Everything else — files, diff, preview, commands, pull requests, the shared terminal — is one tap away in the rail beneath the transcript.

What I actually do from a phone is narrow, and worth being honest about:

| Works well | Better at a desk |
| --- | --- |
| Read the transcript and catch a wrong turn early | Reviewing a large diff |
| Approve or reject a plan-mode write | Resolving merge conflicts |
| Steer with a short follow-up | Writing a detailed task spec |
| Check pull-request and CI state | Anything needing a terminal |

Push notifications make this work without a tab open: the server posts finished, error, stuck, and awaiting-input transitions, so the phone tells me when a run needs me instead of me polling it. That is the difference between supervising a run and babysitting one.
