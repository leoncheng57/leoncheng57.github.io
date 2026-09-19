# T-minus

A Chrome/Brave extension that watches Google Calendar and fires a desktop notification shortly before a meeting starts, with one click to join the call. No backend.

This is **Phase 0**: a loadable Manifest V3 skeleton with a pinned extension ID. It does nothing yet beyond logging its own lifecycle. The build plan below tracks the rest.

## Install and test

1. Open `chrome://extensions` (or `brave://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this `src/t-minus-extension` folder. If already installed, click **Reload** instead.
4. Confirm the listed ID is `dikdmdfmpjcemjbohhocmfdpmglnoppj`. A different ID means `manifest.json`'s `key` was changed or dropped.
5. Click **service worker** on the extension card to open its console. It should log `[t-minus] service worker booted` with that same ID.
6. Reload the extension and confirm the boot line appears again. Chrome evicts an idle worker, so this line is expected to reappear on its own during normal use.

There is no build step. Unlike the NYC Weather extension next door, there is no bundled popup source yet; `background.js` runs directly.

## Why the extension ID is pinned

An unpacked extension's ID is derived from its path and changes whenever it moves or is reloaded from elsewhere. The OAuth client created in Phase 1 binds to one specific extension ID, so the ID has to be fixed before that client exists. `manifest.json` carries a `key` field — the base64 DER public key — which pins it.

The matching private key is `key.pem` in this folder. It is covered by the repository's existing `*.pem` ignore rule and must never be committed. It is not needed to load or run the extension, only to regenerate the same ID elsewhere. Regenerating the keypair is free right now, and expensive once Phase 1 has bound an OAuth client to this ID.

To regenerate (only if the key is lost before Phase 1):

```bash
cd src/t-minus-extension
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
| 1 | Cloud project, Calendar API enabled, OAuth client — **manual, Leon only** |
| 2 | Sign-in and token handling |
| 3 | Fetch upcoming events from Calendar |
| 4 | Filter to joinable, undeclined, non-all-day meetings |
| 5 | `chrome.alarms` polling + persisted notified-event-ID set so nothing double-fires |
| 6 | `chrome.notifications` with click-to-join — first shippable build |
| 7 | Popup showing the next meeting |
| 8 | Configurable lead time + snooze |
| 9 | Hardening: token expiry, backoff, timezones, worker cold starts |

Out of scope for v1: a `meet.google.com` content script, Zoom/Teams support, Web Store publication, and OAuth verification.

A content script was excluded deliberately. Every open-source project doing in-call detection scrapes the Meet DOM with `aria-label` selectors plus a `MutationObserver`, keying off the "You left the call" screen. It works, but Meet's DOM changes without warning and most such repos are abandoned. Nothing on the Calendar path depends on it.

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

A Web application client is issued a client secret. It must never be committed
or shipped in the extension bundle, where anyone who installs it can read it.
Phase 2 uses a flow that does not need one.

## Phase 1 is manual

Phase 1 is Google Cloud Console work no agent can do. It runs against a Cloud
project owned by the `hebbia.ai` Workspace organization, which is what makes
the **Internal** consent screen in step 3 available.

1. Create a Cloud project with **Organization set to `hebbia.ai`**. The organization is fixed at creation, so changing it later means a new project rather than an edit.
2. Enable the **Google Calendar API**. This is a separate step from creating the OAuth client — skipping it produces a 403 `accessNotConfigured` that reads like an auth failure but is not.
3. Configure the consent screen as user type **Internal**, with app name `T-minus` and scope `https://www.googleapis.com/auth/calendar.events.readonly`. Internal means no test-user list, no verification review, and no "Google hasn't verified this app" interstitial, even though that scope is classed as sensitive. The app name is what the consent screen shows.
4. Create an OAuth client of type **Web application**, with the authorized redirect URI `https://dikdmdfmpjcemjbohhocmfdpmglnoppj.chromiumapp.org/` (trailing slash included). Leave authorized JavaScript origins empty.

Phase 2 is unblocked once the client ID exists. It adds the `identity`
permission and a `https://www.googleapis.com/*` host permission to the
manifest, stores the client ID as a constant, and adds a temporary popup with
a sign-in button to trigger the flow on demand.

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

Nothing is collected or transmitted in Phase 0. From Phase 2 the extension will read the signed-in user's Calendar events read-only, over `chrome.identity`, and keep event data in `chrome.storage.local` on the device. There is no backend and no analytics.

API references: [Chrome alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [notifications](https://developer.chrome.com/docs/extensions/reference/api/notifications), [identity](https://developer.chrome.com/docs/extensions/reference/api/identity), [Calendar API `events.list`](https://developers.google.com/calendar/api/v3/reference/events/list).
