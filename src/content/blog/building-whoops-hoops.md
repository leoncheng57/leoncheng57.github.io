---
title: "Building Whoops Hoops: From Side Project to the App Store"
description: "The journey of building a daily basketball guessing game for iOS with React Native and Expo -- from first commit to App Store approval."
publishedAt: "2026-06-02"
tags:
  - ios
  - react-native
  - side-project
  - app-store
  - expo
---

# 🏀 Building Whoops Hoops: From Side Project to the App Store

Whoops Hoops is a daily basketball guessing game for iOS. Think Wordle, but instead of guessing a five-letter word, you're guessing an active basketball player. Each guess reveals color-coded clues across attributes like team, position, height, age, jersey number, conference, and division. You get one puzzle a day, and the game tracks your streak.

This is the story of how it went from a blank Expo project to the App Store in about six weeks -- what worked, what surprised me, and what I'd do differently.

## 💡 The idea

Daily puzzle games are popular for good reason. Wordle, Connections, the mini crossword -- there's something about having exactly one shot per day that makes each round feel meaningful. I wanted to bring that same format to basketball.

The concept is simple: a mystery player is selected each day, and you narrow it down by submitting guesses. Each guess fills a row in a grid, with cells turning green (exact match), yellow (close), or gray (miss) for each attribute. The hint system gives you progressively more information if you're stuck -- first a vague clue, then more specific ones.

## 🚀 Getting started with Expo and React Native

I chose Expo and React Native because I wanted to ship an iOS app without writing Swift, and because the Expo toolchain handles a lot of the painful parts of mobile development -- builds, signing, OTA updates, native module linking. TypeScript was the obvious language choice.

## 🎮 The core gameplay loop

The gameplay has three main parts: the search bar, the guess grid, and the hint system.

The search bar is a filtered dropdown over the full player roster. When you submit a guess, a new row appears in the grid. Each cell in the row corresponds to an attribute (team, position, height, etc.) and gets colored based on how close your guess is to the answer. Green means exact match, yellow means close (same conference, adjacent height range, etc.), and gray means no match.

The hint system was designed to keep players from getting completely stuck. It reveals clues in stages: the first hint is vague ("This player is in the Western Conference"), and each subsequent one narrows it down further. The hints panel pins to the bottom of the screen alongside the search bar, which was a layout fix that took a couple of iterations to get right.

![The guess grid and hints panel in action](/blog/whoops-hoops/gameplay-hints.png)

## ✨ Making it feel right

One of the more satisfying parts of the project was tuning the haptics and animations. On iOS, haptic feedback is a first-class part of the user experience, and I wanted each guess to feel physical.

Each cell in the guess grid reveals with a staggered flip animation -- about 800ms between cells, so you watch your result unfold left to right. I tied a haptic pulse to the start of each cell's flip, with different patterns for each color: a light selection tick for gray, a medium escalating ramp for yellow, and a stronger double-tap for green.

The win state got special treatment. When you guess correctly, there's a fireworks-style haptic sequence -- a quick escalating burst followed by a lingering tail that lasts nearly a second. I went through several iterations on this, testing on a physical iPhone each time since the simulator doesn't support haptics. The difference between "feels right" and "feels annoying" was often just 50ms of timing adjustment.

## 🔥 On-device history and streaks

A daily game needs streaks. If you play every day you want to see that reflected somewhere.

I built the history system around AsyncStorage with a reducer-based architecture: game events (guess submitted, game won) get dispatched to a store, which persists a blob of game records to disk. On app launch, the store hydrates from AsyncStorage and runs a rollover reconciliation -- if you missed a day, your streak resets.

The streak shows up as a pill badge in the header. Tapping it opens a history modal that shows your current streak, longest streak, and a scrollable list of past games. There's also a "clear history" option with a confirmation dialog.

![The win popup after a correct guess](/blog/whoops-hoops/win-popup.png)

One early user-reported bug was that streaks would reset every time the app was killed and relaunched. The root cause was that I wasn't hydrating the history store from AsyncStorage on cold start -- the store initialized empty and the rollover logic saw zero games, so it reset the streak. A straightforward fix, but the kind of thing that's hard to catch in development when you're constantly reloading.

## ⚙️ Engineering quality

Even for a side project, I invested early in CI/CD and testing. The rationale was simple: I wanted to move fast without breaking things, and I knew I'd be shipping updates frequently.

**Semantic release and conventional commits**: Every commit follows the conventional commits spec (`feat:`, `fix:`, `docs:`, etc.). On merge to `main`, GitHub Actions runs semantic-release to auto-bump the version, update the changelog, and create a git tag. This eliminated the "what version are we on" question entirely.

**Maestro E2E tests**: Maestro is a mobile UI testing framework that lets you write flows in YAML. I wrote flows for the core gameplay loop (search, guess, win), the history modal, and the settings screen. The test runner is a Python script that handles starting Metro if needed and routing artifacts to timestamped directories. These tests caught several regressions, especially around layout changes and modal z-index issues.

**Docusaurus docs site**: I set up a Docusaurus site that pulls in both top-level `docs/` content and co-located `__docs__/` folders from the source tree. This gave me a searchable, cross-linked documentation site for architecture decisions, analytics events, and feature specs -- all browsable locally.

## 🤝 Getting friends involved

Two friends got involved in the project. Friend I contributed code directly -- he added the conference and division columns to the guess grid, which was a meaningful gameplay improvement. Having a second pair of eyes on the codebase also helped me catch things I'd been blind to, and his PR was the first external contribution the project received.

Friend S was more of a playtester and sounding board. He gave feedback on the game feel, the difficulty curve, and the hint system. Some of the haptics tuning came directly from his feedback -- he was the one who pointed out that the yellow and gray haptics felt too similar, which led me to differentiate them into distinct patterns.

Having even two people involved changed the dynamic of the project. It stopped feeling like a solo exercise and started feeling like something people might actually use.

## 📦 The rename and App Store push

The app was originally called something else. As I got serious about shipping it, I renamed it to Whoops Hoops -- a name that felt playful, was available as a bundle ID, and didn't reference any trademarks.

Getting App Store-ready involved more work than I expected:

- **App icon**: I went through several iterations before landing on a basketball-themed 3x3 grid on a black background.
- **Branded splash screen**: Light and dark variants, with the `userInterfaceStyle` set to `automatic` so iOS renders the right one.
- **Crashlytics and error boundary**: Firebase Crashlytics for crash reporting, wrapped in a React error boundary with retry limits to pre-empt React 19's internal bailout behavior.
- **Privacy disclosures**: Apple requires detailed privacy nutrition labels. I documented exactly what data the app collects (Firebase Analytics events, none linked to identity) and created a source-of-truth doc to keep the App Store disclosures in sync with the code.
- **EAS build profiles**: Separate `preview` and `production` profiles in EAS, with the production profile wired to auto-submit to App Store Connect.

## 🍎 The App Store review gauntlet

If building the app took six weeks, getting through App Store review felt like it added another two.

The review process is slow and opaque. You submit a build, wait one to three days for a reviewer to look at it, and then get a response that's often a single paragraph pointing out an issue. Fix the issue, resubmit, wait another one to three days. Repeat.

My first rejection was about third-party sports league references. I had used league-related terminology in the app metadata and some UI text. Apple flagged it as a potential trademark issue. The fix was straightforward -- scrub the references, add a non-affiliation disclaimer in the settings screen under a "Data & credits" section -- but each round-trip through review cost days.

The metadata requirements are also surprisingly particular. Screenshot dimensions need to be exact for each device class. The app description has to match what the reviewer sees when they launch the app. The privacy disclosures have to be precise about what you collect and why. Getting all of these right is not technically difficult, but it's tedious and the feedback loop is measured in days, not minutes.

One thing I underestimated was how much the manual nature of the process would slow down iteration. When you're used to CI/CD pipelines that deploy in minutes, waiting days for a human reviewer to approve a one-line text change is jarring. You start batching changes to avoid burning review cycles, which goes against the instinct to ship small and often.

By the time the app was approved, I had been through several review rounds and had commits specifically addressing reviewer feedback -- removing league references, syncing version numbers between `app.json` and `package.json`, and tightening the privacy disclosures.

## 🔔 Notifications and polish

After the initial App Store approval, I kept iterating. The biggest post-launch feature was daily reminder notifications.

The notification system uses `expo-notifications` with a preference store that mirrors the history store's architecture: preferences persist to AsyncStorage, and a scheduler hook re-schedules notifications whenever preferences change. Users can toggle reminders on/off and pick from preset time slots. If notifications are blocked at the OS level, the app prompts you to open iOS Settings.

A nice detail: the app suppresses reminder notifications for the rest of the day after you've completed the daily puzzle. No point reminding someone to play a game they've already played. This required plumbing a `hasCompletedDailyToday` selector from the history store into the notification scheduler.

Other polish work included fixing modal overlay z-index issues (where the search bar would peek through behind modals), combining the conference and division columns into a single cell, and adding an empty-state CTA to the history grid.

## 📝 What I learned

**The 80/20 rule is real, but the last 20% is where the product lives.** The core game loop was working within the first week. The next five weeks were spent on everything that makes the difference between a prototype and something you'd actually want on your phone: haptics, streaks, notifications, App Store compliance, crash reporting, polish.

**Invest in CI/CD early, even for side projects.** Semantic release, conventional commits, and Maestro tests paid for themselves within the first two weeks. They let me refactor aggressively without fear and kept the project in a shippable state at all times.

**The App Store process is a bottleneck you can't engineer around.** You can automate your builds, your tests, your deployments. You cannot automate a human reviewer. Plan for multi-day turnaround on every submission and batch your changes accordingly.

**Ship to real people as early as possible.** The best feedback came from Friend I and Friend S using the app on their own phones. Bugs I never would have found in the simulator surfaced within hours of them installing a TestFlight build.

**Side projects are a good place to try things you wouldn't try at work.** I used this project to experiment with AI coding agents, advanced haptics patterns, Maestro E2E testing, and a Docusaurus docs site for a mobile app. Not all of it was necessary, but all of it taught me something.

Whoops Hoops is live on the [App Store](https://apps.apple.com/us/app/whoops-hoops/id6763969713). If you like basketball and daily puzzles, give it a try.
