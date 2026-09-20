# T-minus

A Chrome/Brave extension that watches Google Calendar and fires a desktop notification shortly before a meeting starts, with one click to join the call. No backend.

This is **v1**: the extension signs in, reads the calendar, picks out the meetings worth warning about, polls on a one-minute alarm, counts down on the toolbar badge, and opens a popup with a Join button, a configurable lead time, a per-meeting dismiss and an optional five-meeting agenda. All nine phases are done.

## Install and test

1. Open `chrome://extensions` (or `brave://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this `src/chromium-extensions/t-minus-extension` folder. If already installed, click **Reload** instead.
4. Confirm the listed ID is `dikdmdfmpjcemjbohhocmfdpmglnoppj`. A different ID means `manifest.json`'s `key` was changed or dropped.
5. Click **service worker** on the extension card to open its console. It should log `[t-minus] service worker booted` with that same ID.
6. Reload the extension and confirm the boot line appears again. Chrome evicts an idle worker, so this line is expected to reappear on its own during normal use.
7. Click the extension's toolbar icon, then **Sign in with Google**. A Google window opens; approve the Calendar access request. The popup should then read `Signed in.`
8. Close and reopen the popup. It should still read `Signed in.` — the token is cached in `chrome.storage.local` and survives the popup closing and the worker being evicted.
9. Click **Sign out**, reopen the popup, and confirm it reads `Not signed in.`

There is no build step. Unlike the NYC Weather extension next door, the popup is plain hand-written HTML/CSS/JS with no bundler; `background.js` and `popup.js` run directly as ES modules.

## Why the extension ID is pinned

An unpacked extension's ID is derived from its path and changes whenever it moves or is reloaded from elsewhere. The OAuth client created in Phase 1 binds to one specific extension ID, so the ID has to be fixed before that client exists. `manifest.json` carries a `key` field — the base64 DER public key — which pins it.

The matching private key is `key.pem` in this folder. It is covered by the repository's existing `*.pem` ignore rule and must never be committed. It is not needed to load or run the extension, only to regenerate the same ID elsewhere. Regenerating the keypair is free right now, and expensive once Phase 1 has bound an OAuth client to this ID.

To regenerate (only if the key is lost before Phase 1):

```bash
cd src/chromium-extensions/t-minus-extension
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out key.pem
openssl rsa -in key.pem -pubout -outform DER | base64 -w 0          # -> manifest.json "key"
openssl rsa -in key.pem -pubout -outform DER \
  | openssl dgst -sha256 -binary | od -An -tx1 -N16 | tr -d ' \n' \
  | tr '0123456789abcdef' 'abcdefghijklmnop'                        # -> the extension ID
```

## Why Calendar and not the Meet API

There is no Meet API a browser extension can use for this. The Meet REST API (`meet.googleapis.com/v2`) is post-hoc: conference records are readable after a call, and `meetings.space.created` only grants access to spaces your own token created. The real-time signals (`google.workspace.meet.conference.v2.started`) come from the Workspace Events API, which delivers exclusively through Cloud Pub/Sub and so needs a server — and reports fully only on spaces the subscribing user *owns*, so a typical attendee sees almost nothing.

Calendar already knows the start time and already carries the join URL in `conferenceData` / `hangoutLink`. Calendar's `watch` push channels also need an HTTPS receiver, so the extension polls on a `chrome.alarms` timer instead of subscribing. That keeps the project backend-free.

Calendar Ringer, Checker Plus for Google Calendar, and Meeting Timer already ship this feature and none of them use the Meet API, which independently confirms the approach.

## Why the name avoids "Meet"

Two reasons. Google's branding guidelines discourage third-party products leading with "Meet" or "Google", which is a Chrome Web Store rejection risk if this is ever published. And the extension is Calendar-driven rather than Meet-driven — it keys off whatever join link an event carries, so a Meet-specific name would misdescribe it and box in the Zoom/Teams support listed below as a possible v2.

"T-minus" names the actual mechanic: the notification fires a set number of minutes before zero.

## Build plan

| Phase | Adds |
| ----- | ---- |
| 0 | Skeleton + pinned extension ID — **done** |
| 1 | Cloud project, Calendar API enabled, OAuth client — **done, manual** |
| 2 | Sign-in and token handling — **done** |
| 3 | Fetch upcoming events from Calendar — **done** |
| 4 | Filter to joinable, undeclined, non-all-day meetings — **done** |
| 5 | `chrome.alarms` polling + persisted notified-event-ID set so nothing double-fires — **done** |
| 6 | Toolbar badge countdown, click-to-join from the popup — first shippable build — **done** |
| 7 | Popup showing the next meeting — **done** |
| 8 | Configurable lead time + dismiss — **done** |
| 9 | Hardening: token expiry, backoff, timezones, worker cold starts — **done** |

Out of scope for v1: a `meet.google.com` content script, Zoom/Teams support, Web Store publication, and OAuth verification.

A content script was excluded deliberately. Every open-source project doing in-call detection scrapes the Meet DOM with `aria-label` selectors plus a `MutationObserver`, keying off the "You left the call" screen. It works, but Meet's DOM changes without warning and most such repos are abandoned. Nothing on the Calendar path depends on it.

## What the filter drops, and why

`selectNotifiableEvents` keeps an event only when it is timed, carries a video
conference URL, and has not been declined. Three of those rules are obvious; the
fourth is the one that bites.

**An unanswered invite counts as attending.** Google omits the `attendees` array
entirely on an event with no other guests, so `selfResponseStatus` is `null` for
every solo block — a lunch hold, a reminder, a focus block. Filtering on
`=== 'accepted'` would therefore drop not just those but every invitation not yet
responded to, including a company all-hands sitting at `needsAction`. The rule is
`!== 'declined'`: say nothing only when the user has actually said no.

Checked against a real calendar, 11 of 25 events over four days came back
notifiable. Declined meetings dropped even when they carried a Meet link;
`needsAction` ones were kept.

**In-person meetings drop as a side effect.** No conference URL means no
one-click join, which is the whole premise, so an office-hours block with
attendees and no link is filtered out the same as a solo reminder. That is
intended for v1 and worth revisiting only if the notification stops being a join
button.

## Polling, and what happens when the worker dies

Chrome evicts an idle service worker, so nothing may live in a `setTimeout`.
`chrome.alarms` is the only timer that survives, and its period is clamped to one
minute — which also sets the worst case: a meeting can be up to a minute further
along than the lead time suggests.

Two consequences shaped `selectDueEvents`:

- **A meeting that started while the worker slept still fires.** The due window
  extends backwards, not just forwards. A worker asleep through the lead window
  would otherwise drop the notification silently, which is the exact failure the
  extension exists to prevent.
- **The dedupe set is keyed by event instance ID.** `events.list` with
  `singleEvents=true` expands a recurring series into per-instance IDs
  (`..._20260922T140000Z`), so tomorrow's standup is a different key from
  today's and is never swallowed as a duplicate. Entries are pruned an hour
  after the meeting starts, which bounds the set and stops a restart re-firing
  something already announced.

Event IDs are marked notified **before** the notification is raised. A display
failure therefore costs one missed alert; the alternative — marking afterwards —
costs the same meeting re-firing every sixty seconds until it ends.

## The badge, not a desktop notification

The first cut of Phase 6 raised a `chrome.notifications` banner. That was
dropped on purpose: the alert now lives on the toolbar icon and in the popup,
which keeps the whole thing inside the browser and removes a dependency on
macOS notification permissions that silently swallowed the banner when not
granted. `chrome.notifications` and its permission are gone.

This changed the shape of the state. A notification is a one-shot **event** and
needed a persisted set of already-fired IDs so a restart could not double-fire
it. A badge is **state**: it is recomputed from the calendar on every tick and
simply reflects what is true now, so the dedupe set and its retention window
were deleted rather than carried forward.

What the badge shows:

- blank when the next meeting is over an hour out — a number counting down all
  afternoon is noise, not information
- the minute count inside that hour, grey, carrying its unit (`45m`, `2m`) so the
  number is never mistaken for an unread count
- amber once inside the lead window, then `now` once it has started

The popup paints from a cached next-meeting record first so it never opens on a
spinner, then refreshes and repaints; the cache is at most one poll period
stale. A meeting stays "next" for ten minutes after it starts, because someone
joining late still wants the button.

## Lead time and dismissing

The lead time — how early the badge turns amber — is chosen in the popup from
one, two, five, ten or fifteen minutes and kept in `chrome.storage.local`. It is
read on every poll rather than cached in the worker, so a change takes effect on
the next tick without a reload.

**Dismiss silences the icon, not the meeting.** The badge clears, but the popup
still shows the meeting and its Join button, with an Undo. A meeting the user
has waved away is still the next meeting; pretending otherwise would mean
opening the popup and being told nothing is coming up while a call is starting.

Dismissals are keyed by event instance ID, so waving away today's standup says
nothing about tomorrow's, and are pruned an hour after the meeting starts. This
is the one place a persisted set survived the move away from notifications — not
to stop a double-fire, which the badge cannot do, but because a user action has
to outlive the worker that handled it.

## Hardening

**Failures back off.** A poll that cannot reach Google waits one minute, then
two, four, and so on to a ceiling of about half an hour, rather than retrying
every minute for as long as the browser stays open. The state lives in session
storage, so a fresh browser session gets a fresh attempt and a backoff can never
outlive the outage that caused it.

**Not every failure is the same.** `SignInRequiredError` separates the one
failure the user can fix from every transient one. A network fault keeps the
badge and backs off; a missing credential clears the badge and lets the popup
ask for sign-in, because a countdown drawn from a calendar the extension can no
longer read is a lie.

**The countdown survives an outage.** Every tick repaints from cache before
attempting the network, so the number keeps falling during a failure instead of
freezing on whatever minute the last successful poll saw. Cached meetings are
discarded ten minutes after they start.

**All-day events parse in the local timezone.** `new Date("2026-09-21")` is UTC
midnight, which is the previous day for anyone west of Greenwich. All-day events
are filtered out anyway, so nothing visible depended on it — which is exactly
the kind of latent wrongness that surfaces later as an off-by-one-day bug.

**The alarm re-arms itself.** Neither `onInstalled` nor `onStartup` fires when
Chrome revives an evicted worker, so every cold start checks the alarm still
exists and recreates it if not. Without this, an alarm lost to a crash would
never come back and the extension would go quietly dead.

## Showing the account

The popup names the signed-in account. No extra scope was added for it: for the
primary calendar, `events.list` returns the account's own address as the
response's `summary`, so the identity arrives with the events — no second
request, and nothing for the user to re-consent to.

## Debugging from the service worker console

Module scope is not global in an MV3 worker, so `background.js` hangs the useful
entry points off `globalThis.tminus`:

```js
await tminus.logEventSummary(4)   // table of 4 days of events + the filter verdict per row
await tminus.fetchUpcomingEvents({ lookaheadMs: 4 * 24 * 60 * 60 * 1000 })
await tminus.refreshNextMeeting() // re-read the calendar and recompute the next meeting
await tminus.pollAndPaint()       // the whole alarm tick, badge included
await tminus.paintBadge({ summary: 'Test', startsAt: Date.now() + 120000, isDue: true })
```

`logEventSummary` prints a `console.table` rather than objects deliberately:
console object previews truncate after a few fields, and the truncated ones are
exactly `conferenceUrl` and `selfResponseStatus` — the two the filter turns on.

## Auth approach: launchWebAuthFlow, not getAuthToken

The extension targets Chrome and Brave. Brave removes Chrome's Google account
integration, so `chrome.identity.getAuthToken()` — the simpler API — does not
work there. Both browsers are served instead by
`chrome.identity.launchWebAuthFlow()`, which drives the OAuth flow in a popup
window and redirects to a virtual URL derived from the extension ID.

That choice decides the rest of the setup:

| | getAuthToken (not used) | launchWebAuthFlow (used) |
| --- | --- | --- |
| OAuth client type | Chrome Extension | **Web application** |
| Redirect URI | none | `https://dikdmdfmpjcemjbohhocmfdpmglnoppj.chromiumapp.org/` |
| Manifest `oauth2` block | required | **not used** — the client ID lives in code |
| Brave | unsupported | supported |

A Web application client is issued a client secret. It is not in this bundle
and must never be: anyone who installs an extension can read every file in it.
The flow below does not need one.

## How sign-in works

`auth.js` runs the OAuth **implicit** flow: it opens Google's authorization
endpoint with `response_type=token`, and Google returns the access token in
the fragment of the `chromiumapp.org` redirect. The alternative — an
authorization code exchanged at the token endpoint — is what needs the client
secret for a Web application client, which is exactly the thing that cannot
ship here. If Google ever refuses `response_type=token` for this client, the
fallback is auth code plus PKCE, contained entirely within `auth.js`.

The client ID lives in `config.js` rather than a manifest `oauth2` block,
because `launchWebAuthFlow` does not read that block. It is not a secret; it
travels in the authorization URL on every sign-in.

Tokens last about an hour and the implicit flow issues no refresh token, so
`getAccessToken()` defaults to non-interactive: it returns the cached token,
or silently re-authorizes against the existing Google session with
`prompt=none`, and only opens a window when a caller passes
`interactive: true`. That default is what keeps the Phase 5 alarm from opening
a sign-in window behind the user's back.

## Phase 1 is manual

Phase 1 was Google Cloud Console work no agent can do — recorded here because
it has to be repeatable. It ran against a Cloud project owned by the
`hebbia.ai` Workspace organization, which is what makes the **Internal**
consent screen in step 3 available.

1. Create a Cloud project with **Organization set to `hebbia.ai`**. The organization is fixed at creation, so changing it later means a new project rather than an edit.
2. Enable the **Google Calendar API**. This is a separate step from creating the OAuth client — skipping it produces a 403 `accessNotConfigured` that reads like an auth failure but is not.
3. Configure the consent screen as user type **Internal**, with app name `T-minus` and scope `https://www.googleapis.com/auth/calendar.events.readonly`. Internal means no test-user list, no verification review, and no "Google hasn't verified this app" interstitial, even though that scope is classed as sensitive. The app name is what the consent screen shows.
4. Create an OAuth client of type **Web application**, with the authorized redirect URI `https://dikdmdfmpjcemjbohhocmfdpmglnoppj.chromiumapp.org/` (trailing slash included). Leave authorized JavaScript origins empty.

Phase 2 consumed the resulting client ID. Nothing from Phase 1 other than that
one string reaches the code.

Two consequences of the Internal choice worth knowing. An Internal app can
only be authorized by accounts inside the organization, so signing in with a
personal Google account will not work — this reads the `hebbia.ai` calendar
and nothing else. And the project is organization property rather than
personal, so it is subject to the org's lifecycle and governance.

### If the organization route is unavailable

Creating a project in an organization needs `resourcemanager.projects.create`,
which some organizations revoke from ordinary users. Where that blocks step 1,
the fallback is a project with **no organization** and an **External** consent
screen in **Testing** status, with each address added as a test user; consent
then shows the unverified-app interstitial, which is expected in Testing.

Switching between the two later is cheap, because almost nothing about the
extension is tied to the project:

| | Changes when switching? |
| --- | --- |
| Extension ID | No — derived from `key.pem` |
| Redirect URI | No — derived from the extension ID |
| Auth code and flow | No — the Web application client type is used either way |
| Manifest permissions | No |
| Client ID constant | Yes, one line |
| Consent screen | Internal becomes External/Testing, or the reverse |

The Internal route also avoids a risk the External one carries: a Workspace
administrator may restrict third-party API access (Admin console → Security →
API controls), in which case an External app is refused at the consent screen
when authorizing a Workspace account, whatever the extension does.

No existing extension in this repository uses `chrome.identity`, so there is no in-repo auth pattern to copy. The website's `GmailReaderRoute` references Google's native-app OAuth flow, which is a different flow and not a useful template here.

## Data and privacy

There is no backend and no analytics. As of Phase 2 the only thing stored is the Google access token, in `chrome.storage.local` on the device, and the only network traffic is the sign-in itself. From Phase 3 the extension reads the signed-in user's Calendar events read-only and caches them the same way. Signing out deletes the stored token and asks Google to revoke it.

API references: [Chrome alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [notifications](https://developer.chrome.com/docs/extensions/reference/api/notifications), [identity](https://developer.chrome.com/docs/extensions/reference/api/identity), [Calendar API `events.list`](https://developers.google.com/calendar/api/v3/reference/events/list).
