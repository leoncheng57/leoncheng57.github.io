# Meet Ahead

A Chrome/Brave extension that watches Google Calendar and fires a desktop notification shortly before a meeting starts, with one click to join the Meet call. No backend.

This is **Phase 0**: a loadable Manifest V3 skeleton with a pinned extension ID. It does nothing yet beyond logging its own lifecycle. The build plan below tracks the rest.

## Install and test

1. Open `chrome://extensions` (or `brave://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this `src/meet-ahead-extension` folder. If already installed, click **Reload** instead.
4. Confirm the listed ID is `dikdmdfmpjcemjbohhocmfdpmglnoppj`. A different ID means `manifest.json`'s `key` was changed or dropped.
5. Click **service worker** on the extension card to open its console. It should log `[meet-ahead] service worker booted` with that same ID.
6. Reload the extension and confirm the boot line appears again. Chrome evicts an idle worker, so this line is expected to reappear on its own during normal use.

There is no build step. Unlike the NYC Weather extension next door, there is no bundled popup source yet; `background.js` runs directly.

## Why the extension ID is pinned

An unpacked extension's ID is derived from its path and changes whenever it moves or is reloaded from elsewhere. The OAuth client created in Phase 1 binds to one specific extension ID, so the ID has to be fixed before that client exists. `manifest.json` carries a `key` field — the base64 DER public key — which pins it.

The matching private key is `key.pem` in this folder. It is covered by the repository's existing `*.pem` ignore rule and must never be committed. It is not needed to load or run the extension, only to regenerate the same ID elsewhere. Regenerating the keypair is free right now, and expensive once Phase 1 has bound an OAuth client to this ID.

To regenerate (only if the key is lost before Phase 1):

```bash
cd src/meet-ahead-extension
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out key.pem
openssl rsa -in key.pem -pubout -outform DER | base64 -w 0          # -> manifest.json "key"
openssl rsa -in key.pem -pubout -outform DER \
  | openssl dgst -sha256 -binary | od -An -tx1 -N16 | tr -d ' \n' \
  | tr '0123456789abcdef' 'abcdefghijklmnop'                        # -> the extension ID
```

## Why Calendar and not the Meet API

There is no Meet API a browser extension can use for this. The Meet REST API (`meet.googleapis.com/v2`) is post-hoc: conference records are readable after a call, and `meetings.space.created` only grants access to spaces your own token created. The real-time signals (`google.workspace.meet.conference.v2.started`) come from the Workspace Events API, which delivers exclusively through Cloud Pub/Sub and so needs a server — and reports fully only on spaces the subscribing user *owns*, so a typical attendee sees almost nothing.

Calendar already knows the start time and already carries the Meet URL in `conferenceData` / `hangoutLink`. Calendar's `watch` push channels also need an HTTPS receiver, so the extension polls on a `chrome.alarms` timer instead of subscribing. That keeps the project backend-free.

Calendar Ringer, Checker Plus for Google Calendar, and Meeting Timer already ship this feature and none of them use the Meet API, which independently confirms the approach.

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

## Phase 1 is manual

Phase 1 is Google Cloud Console work no agent can do:

1. Create a Cloud project.
2. Enable the **Google Calendar API**. This is a separate step from creating the OAuth client — skipping it produces a 403 `accessNotConfigured` that reads like an auth failure but is not.
3. Configure the consent screen with scope `https://www.googleapis.com/auth/calendar.events.readonly`, and add Leon as a test user.
4. Create an OAuth client of type **Chrome Extension** using the extension ID above.

Phase 2 is unblocked once that client ID exists. It adds an `oauth2` block (`client_id` plus `scopes`) to the manifest along with the `identity` permission, and a temporary popup with a sign-in button to trigger the flow on demand.

No existing extension in this repository uses `chrome.identity`, so there is no in-repo auth pattern to copy. The website's `GmailReaderRoute` references Google's native-app OAuth flow, which is a different flow and not a useful template here.

## Data and privacy

Nothing is collected or transmitted in Phase 0. From Phase 2 the extension will read the signed-in user's Calendar events read-only, over `chrome.identity`, and keep event data in `chrome.storage.local` on the device. There is no backend and no analytics.

API references: [Chrome alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [notifications](https://developer.chrome.com/docs/extensions/reference/api/notifications), [identity](https://developer.chrome.com/docs/extensions/reference/api/identity), [Calendar API `events.list`](https://developers.google.com/calendar/api/v3/reference/events/list).
