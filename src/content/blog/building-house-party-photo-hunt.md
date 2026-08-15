---
title: "Building House Party Photo Hunt: A Photo Voting Game for My Housewarming"
description: "How a housewarming party turned into a multi-round photo scavenger game with live voting, a Supabase-backed photo export runbook, password protection, and a TV mode with Spotify playback."
publishedAt: "2026-08-15"
tags:
  - side-project
  - product
  - engineering
---

# 📸 Building House Party Photo Hunt: A Photo Voting Game for My Housewarming

I was planning a housewarming party and wanted a fun activity that could hold the room together without holding anyone hostage. The result was [House Party Photo Hunt](https://leoncheng.dev/vibe-photo-voting-house-game/) -- a photo scavenger game where guests snap pictures on their phones for themed rounds, and everyone votes on the results together on the TV.

This is the story of why the game works at a party, and the engineering that went into it -- including the photo export runbook that keeps the whole thing within a free database tier.

![The House Photo Hunt landing page: "Find it. Frame it. Fight for it."](/blog/building-house-party-photo-hunt/landing.webp)

## 🎉 Designing for how parties actually work

Parties are chaotic. People show up late, people leave early, and nobody wants to be told to sit down for a rigid hour-long game. The core design decision that made Photo Hunt work is that **the game has multiple rounds, but you can play all of them in parallel**.

Every round is a photo prompt. Guests take pictures for whichever rounds they want, in any order, whenever they feel like it during the party. Someone arriving an hour late can still jump into every round. Someone leaving early has already submitted their shots. There's no "you missed round two, sorry."

![The play screen: six photo challenges, all open at once, with the party timer and storage meter up top](/blog/building-house-party-photo-hunt/play-rounds.webp)

Then the voting rounds do the opposite: they **bring everyone back together**. We gather around the TV, look at the submissions for each round, and vote. Voting gives everyone a stake -- your vote counts even if you didn't submit a great photo -- and it produces winners.

Not just one winner, actually: the **top three** get prizes. That did two things for the party. It let the house give away prizes (a great housewarming gesture), and it gave participants a real reason to try to win. Motivation matters -- people take much better, funnier photos when there's something on the line.

And the best part is the byproduct: at the end of the night you have a curated set of photos of everyone at the party. Pictures are awesome for memories, and this game manufactures them.

## 🗄️ The photo storage problem (and the export runbook)

The first real engineering challenge: **photos need a database**. Guests upload images from their phones, and those images have to live somewhere the voting screen can read from. The app is backed by Supabase, and the free tier has a hard storage limit.

A party's worth of full-resolution phone photos eats through that limit fast. Rather than pay for storage that only spikes once per party, I built a **manual runbook for exporting photos** after an event: pull the originals out of the database, archive them, and keep only smaller resized versions in storage. The runbook lives in the app's developer section as a documented flow -- [the photo export page](https://leoncheng.dev/vibe-photo-voting-house-game/developer/photo-export/) -- so future me (or a co-host) can run it step by step without re-deriving anything.

![The photo export runbook: storage meter, per-round file listing, and a one-click ZIP of every retained original](/blog/building-house-party-photo-hunt/photo-export-runbook.webp)

A manual runbook instead of an automated pipeline was a deliberate choice. Exports happen once per party, the stakes are "don't lose people's photos," and a human following a checklist is the right level of automation for that frequency and risk. It keeps the game comfortably on the free tier while preserving every original.

## 🔒 Passwords, because these photos aren't for the internet

The second challenge was access control. These are candid photos of friends at a house party -- **they should not be public**. The hosted game sits behind a password, so only people who were actually at the party can see the submissions and vote. It's a small feature, but it's the difference between "fun party game" and "accidental public photo dump."

## ✨ A theme with some energy

Presentation mattered more than I expected. An exciting, light design theme turned out to be genuinely valuable -- the game runs on a TV in front of a room of people, and it needs to feel like part of the party, not like an internal tool someone projected by mistake. Bright, playful visuals set the tone for the voting rounds.

## 🧪 What quick UX testing taught me

Before the party, I did some quick UX testing with a few people. Two features came directly out of that -- neither of which I would have prioritized on my own.

**A developer section with a run of the show.** Hosting a game while also hosting a party is a lot. Testers pointed out that the host needs a script: what to announce, when to open voting, when to reveal winners. So the app grew a developer section with a run-of-show -- an operational checklist for the event itself, right next to the photo export runbook. Runbooks aren't just for infrastructure.

**TV mode with Spotify playback.** The voting screen on the TV was functional but flat. Testing surfaced that music is what makes it feel like a party moment, so TV mode integrates the Spotify SDK for playback. Music during the picture-taking phase keeps the energy up while people roam around shooting photos, and music during voting turns the reveal into an event instead of a slideshow.

![TV mode: the how-to-play briefing guests see on the big screen, with a QR code to join and a Connect Spotify button for the vibes](/blog/building-house-party-photo-hunt/tv-mode.webp)

Both features were cheap to build and completely changed how the game felt live. UX testing is very valuable, even -- especially -- for a party game.

## 📝 What I learned

**Design around the social physics of the event.** Parallel rounds plus synchronized voting matched how people actually behave at a party: drift apart, come back together. The format was the product.

**Prizes create participation.** Top-three prizes gave the game stakes and gave the hosts a way to give something back. Incentives work at parties too.

**Free tiers are a design constraint, not a blocker.** The storage limit forced the export runbook, which ended up being a cleaner long-term flow than "just store everything forever."

**Write runbooks for humans.** The photo export flow and the run-of-show are both just documented checklists, and both were load-bearing on party night.

**Test with real users before the real event.** The developer section and Spotify TV mode -- arguably the two features that made the night -- both came out of quick UX testing.

The game is [open source on GitHub](https://github.com/leoncheng57/vibe-photo-voting-house-game) if you want to run one at your own party.
