---
title: "PWA Good Practices: What I Learned Shipping Installable Web Apps"
description: "Practices from building Sub-Wait and Workout Lab as PWAs — why PWAs over native apps, scoping multiple apps on one domain, page-specific installs, installation guides, and how I produce install walkthrough animations."
publishedAt: "2026-08-15"
tags:
  - engineering
  - mobile
  - side-project
---

# PWA Good Practices: What I Learned Shipping Installable Web Apps

This site hosts two apps that live on people's home screens: [Sub-Wait](/sub-wait/), which shows live NYC subway arrival times, and [Workout Lab](/workout-lab/), an offline workout tracker. Neither one went through an app store. Both are Progressive Web Apps — regular web pages with a manifest and a service worker, installable straight from the browser.

This post collects the practices that actually mattered while shipping them: why I chose PWAs in the first place, how to run multiple PWAs on one domain, how to make a *single page* installable as its own app, why you need an installation guide, and how I produce the animated install walkthroughs that go with it.

## Contents

- [Why a PWA instead of a native app](#why-a-pwa-instead-of-a-native-app)
- [The honest downsides](#the-honest-downsides)
- [Practice 1: Scope each app, even on one domain](#practice-1-scope-each-app-even-on-one-domain)
- [Practice 2: Page-specific installations](#practice-2-page-specific-installations)
- [Practice 3: Ship an installation guide](#practice-3-ship-an-installation-guide)
- [Practice 4: Show, don't tell — install walkthrough animations](#practice-4-show-dont-tell--install-walkthrough-animations)
  - [Real-device recordings](#real-device-recordings)
  - [The illustrated animation pipeline (alpha/beta)](#the-illustrated-animation-pipeline-alphabeta)
  - [Where each format wins](#where-each-format-wins)
  - [The road not taken: desktop simulators](#the-road-not-taken-desktop-simulators)
- [Closing thought](#closing-thought)

## Why a PWA instead of a native app

The case for PWAs on a personal or small project is mostly about removing friction:

- **No app store approval and no yearly fees.** There is no review queue between you and your users, and no $99/year developer program just to keep an app alive. You push to your web host and the update is live.
- **One codebase for every device.** The same URL works on iPhones, Android phones, tablets, and laptops. I did not write Sub-Wait twice, and I did not have to decide which platform's users mattered more.
- **Much easier to build and maintain.** It is a website. All the web tooling you already know — React, Vite, normal CI, normal deploys — applies directly. There is no separate build toolchain, signing setup, or store listing to babysit.
- **Startup can feel fast.** With a service worker caching the shell, launching from the home screen often feels snappy — sometimes faster than heavyweight native apps, though I will admit this one is partly perceived experience and varies a lot by app and device.

For an app like Sub-Wait — glance at it for ten seconds while walking to the station — this trade is clearly right. The whole value is "one tap from the home screen to live data," and a PWA delivers exactly that without any of the store overhead.

## The honest downsides

PWAs are not a free win, and pretending otherwise is how you end up disappointed:

- **The install flow is too many clicks.** On iOS it is Share → Add to Home Screen → Add, buried in a menu most people have never scrolled through. There is no one-tap "Get" button, and most folks simply are not used to installing apps this way. This is the single biggest problem, and it is why two of the practices below are entirely about the install experience.
- **No home screen widgets.** If your app's value would shine as a widget — and honestly, subway arrival times would — a PWA cannot do that today.
- **Animations and touch feel are a tier below native.** You can get close with careful CSS, but the platform-native scroll physics, transitions, and gesture handling that make iOS and Android apps feel polished are hard to fully match in a web view.
- **Platform behavior shifts under you.** Install menus, labels, and home-screen behavior change between OS releases, which means your install documentation can silently go stale.

My conclusion: PWAs are the right default for utility apps where distribution speed and maintenance cost matter more than platform polish. If you need widgets or best-in-class gestures, that is when native earns its cost.

## Practice 1: Scope each app, even on one domain

Both of my apps live on the same domain as this blog. That works because each PWA is strictly scoped to its own path. Sub-Wait's manifest looks like this:

```json
{
  "name": "Sub-Wait",
  "short_name": "Sub-Wait",
  "id": "/sub-wait/",
  "start_url": "/sub-wait/",
  "scope": "/sub-wait/",
  "display": "standalone",
  "orientation": "portrait",
  "icons": [
    { "src": "icon-v2-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icon-v2-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icon-v2-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

The details that matter:

- **`scope` and `start_url` are both under the app's path.** Workout Lab has its own manifest with `scope: "/workout-lab/"`. The browser treats them as two independent apps that happen to share a hostname, so a user can install both and get two icons.
- **The service worker is registered with an explicit scope** (`/sub-wait/sw.js` with `scope: '/sub-wait/'`). Each app caches only its own assets, and neither one can accidentally intercept the blog or the other app.
- **Inject the manifest link per app, not globally.** In a single-page app the `<link rel="manifest">` should only exist while the user is inside that app's routes. My React component appends the manifest link, theme color, and `apple-touch-icon` on mount and removes them on unmount. Otherwise, a visitor reading a blog post who taps "Add to Home Screen" would get the wrong app.
- **Ship a maskable icon.** Android crops icons into circles and squircles; without a `purpose: "maskable"` variant your icon ends up as a small logo floating on a white plate.

## Practice 2: Page-specific installations

Here is the practice I have not seen written up much: you do not have to make *the app* installable — you can make **a specific page** installable as its own app.

Sub-Wait users mostly care about one station, theirs. So every station page serves its own generated manifest:

```json
{
  "name": "Astoria Blvd",
  "short_name": "Astoria Blvd",
  "id": "/sub-wait/pwa/station/astoria-blvd",
  "start_url": "/sub-wait/station/astoria-blvd",
  "scope": "/sub-wait/",
  "display": "standalone"
}
```

When you are on a station page and add it to your home screen, the icon is named after the station and launches directly into that station's live arrivals. One tap, zero navigation, exactly the screen you wanted.

The mechanics:

- **Generate one manifest per page at build time.** A small Vite plugin emits `manifests/station-<id>.webmanifest` for every station from the same data file that drives the UI. No hand-maintained JSON.
- **Give each install a unique `id` but share the `scope`.** A distinct `id` (I use a virtual `/sub-wait/pwa/station/<id>` path) lets the browser treat each station as a separate installable app, while the shared `scope` means they all reuse the same service worker and cache.
- **Swap the manifest link as the route changes.** The PWA component watches the current route: on a station page it points `<link rel="manifest">` at that station's manifest; anywhere else in the app it points at the general one. The `apple-mobile-web-app-title` meta gets the station name too, so iOS labels the icon correctly.

This turns "install my app" into "pin the exact thing you check every morning," which is a much easier sell.

## Practice 3: Ship an installation guide

Because the install flow is the weakest part of the PWA story, do not leave users to figure it out. Three layers have worked for me:

1. **A dismissible in-app hint.** On mobile browsers (and only when *not* already running standalone — check `display-mode: standalone` and iOS's `navigator.standalone`), Sub-Wait shows a small banner: "Add Sub-Wait to homescreen — 1-click from immediate subway times, no app store required." It collapses to a compact pill, and the collapsed state persists in `localStorage` so it never nags.
2. **A quick-help popup.** Tapping the hint opens a modal with the short version of the steps, right where the user already is.
3. **A full guide page.** A dedicated [/sub-wait/install](/sub-wait/install) page with per-platform, step-by-step instructions — Safari's Share button for iOS, Chrome's menu → "Install app" for Android — with visuals for every step.

Two details worth stealing: detect the platform from the user agent so you show iPhone steps to iPhone users first, and date-stamp the guide against an OS version ("Safari on iOS 26") so readers and future-you know when it was last verified. Install menus do change.

## Practice 4: Show, don't tell — install walkthrough animations

Text instructions for "tap Share, then scroll, then tap Add to Home Screen" are exactly the kind of thing people skim and get wrong. Short videos work far better, and they turned out to be cheap to produce. The workhorse is a manual iPhone screen recording of the real install flow, optimized down to about a megabyte. Alongside it I built a JavaScript animation generator that renders illustrated walkthroughs — though that one is still in an alpha/beta state and not very refined. And the third option, desktop simulators, is the one I would reach for next but have not tried yet.

### Real-device recordings

The manual iPhone recording is the foundation: an actual screen capture of the real install flow (Safari on iOS 26). Illustrations are clear, but a real recording is what convinces a skeptical user that the flow genuinely exists on their phone.

Raw phone recordings are unusable as-is — mine was a 24 MB HEVC file — so a script (`optimize-install-recording.mjs`) turns any capture into web assets:

- Lanczos downscale to 480 px wide at 30 fps
- CRF-tuned H.264 MP4 and VP9 WebM encodes, audio stripped, faststart
- A poster frame extracted at a chosen timestamp
- **Time-windowed blur redaction**: a `--blur=x:y:w:h:from:to` flag blurs a source-pixel region between two timestamps — I used it to hide a notification badge that appeared mid-recording

That took the 24 MB source down to a 1.1 MB MP4 plus a 0.7 MB WebM. Captions for recordings are hand-timed VTT files, since the cues have to match a human's tap timing rather than a fixed four-second rhythm.

### The illustrated animation pipeline (alpha/beta)

The second kind is a fully synthetic, pre-rendered animation — no phone involved. It is generated by one Node script (`npm run generate:install-videos`) and is completely reproducible:

1. **Draw each step as a 390×720 SVG illustration.** A stylized Safari share sheet, a Chrome menu, and so on. Because they are illustrations rather than screenshots, there is nothing personal to redact and they do not look stale the moment an OS ships a new font.
2. **Define each step as data**: which image, a caption, and a hand-picked tap coordinate.

```js
const GUIDES = {
  iphone: [
    { image: 'iphone-1-share.svg', caption: '1. Tap Share in Safari', tap: [195, 650] },
    { image: 'iphone-2-add.svg', caption: '2. Choose Add to Home Screen', tap: [195, 442] },
    { image: 'iphone-3-confirm.svg', caption: '3. Confirm with Add', tap: [319, 88] },
  ],
  // ...
}
```

3. **Generate an HTML/CSS scene** from that data: each illustration is shown for four seconds with a pulsing tap ripple at the coordinate, a subtle reveal transition between steps, a caption overlay, and step progress dots.
4. **Record it with Playwright** — headless Chromium at a fixed 390×720 viewport, which produces a WebM.
5. **Post-process with FFmpeg** (via `ffmpeg-static`, so there is no system dependency): convert the WebM to an H.264 MP4 with a web-compatible pixel format and fast-start metadata, and grab a poster frame.
6. **Generate WebVTT captions from the same step data**, so the captions can never drift from the visuals.

The result is a ~0.3 MB MP4 for a 13-second walkthrough, embedded as a normal `<video>` with `controls`, `playsInline`, `preload="metadata"`, poster, captions, and no autoplay. When a menu changes, I edit one SVG or one caption and re-run the script — the whole video regenerates deterministically.

> **Alpha/beta warning.** This generator is very much not refined yet. The accuracy is approximate — spacing, labels, and transitions are my hand-drawn interpretation of the real OS menus, not pixel-faithful reproductions — and the visual polish is lacking compared to what a motion designer (or the real OS) would produce. I stopped iterating on it for now purely due to lack of time; it is good enough to communicate the steps, and that was the bar I needed to clear.

### Where each format wins

Running both formats side by side taught me a presentation split that I now treat as the rule:

- **The quick-help popup shows only the real recording.** In that moment the user needs trust — "yes, this is really what my phone will do."
- **The full guide shows the recording and the animation side by side.** The recording proves the flow; the illustration makes it unambiguous *where* to tap, because a stylized frame with a pulsing ripple communicates the target far better than a busy real screenshot.

Both pipelines share the same size and codec targets (MP4 + WebM + poster + VTT, around a megabyte or less per video), so a guide with several videos still loads instantly.

### The road not taken: desktop simulators

With more time, the next thing I would have tried is capturing the flows from desktop simulators — iOS and Android simulators running on a Mac. The appeal is accuracy without a personal phone: Xcode's iOS Simulator runs real Safari and supports Add to Home Screen, so it would give correct spacing, labels, transitions, and safe areas for the current iOS release; Android Studio's emulator with a Play Store system image runs real Chrome, so the full "Install app" flow works and could be captured with `adb screenrecord`. Both would drop straight into the same recording-optimization script as a phone capture.

I have not done this yet — again, time — and it comes with its own honesty caveats (generic status bars and mouse-driven taps make emulator footage look subtly different from a real device), but it is the obvious middle ground between my rough illustrated animations and asking a human for a fresh screen recording every time an OS update changes a menu.

## Closing thought

The core PWA plumbing — a manifest, a service worker, some icons — is a weekend of work. What separates a PWA that people actually use from one they visit once is everything around the install: scoping it correctly, letting users pin the exact page they care about, and treating the installation guide as a real feature with real production values instead of a paragraph of text.

The install flow is the worst part of the PWA experience, and it is also the part you have the most room to fix.
