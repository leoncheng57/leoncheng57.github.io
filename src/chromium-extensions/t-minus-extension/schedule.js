import {
  ACCOUNT_STORAGE_KEY,
  AGENDA_LIMIT,
  CACHE_USABLE_AFTER_START_MS,
  DEFAULT_LEAD_TIME_MS,
  AGENDA_STORAGE_KEY,
  POLL_ALARM_NAME,
  POLL_BACKOFF_BASE_MS,
  POLL_BACKOFF_MAX_MS,
  POLL_FAILURE_STORAGE_KEY,
  POLL_PERIOD_MINUTES,
} from './config.js';
import { fetchCalendarSnapshot, selectNotifiableEvents } from './calendar.js';
import { readDismissals, readLeadTimeMs } from './settings.js';

// A meeting stays interesting for a while after it starts -- someone joining
// late still wants the button. Past this it is no longer "next".
const STARTED_GRACE_MS = 10 * 60_000;

export function selectUpcomingMeetings(
  events,
  now,
  leadTimeMs = DEFAULT_LEAD_TIME_MS,
  dismissals = {},
  limit = AGENDA_LIMIT,
) {
  return events
    .filter((event) => event.startsAt - now > -STARTED_GRACE_MS)
    .sort((a, b) => a.startsAt - b.startsAt)
    .slice(0, limit)
    .map((event) => ({
      id: event.id,
      summary: event.summary,
      startsAt: event.startsAt,
      startIso: event.startIso,
      conferenceUrl: event.conferenceUrl,
      isDue: event.startsAt - now <= leadTimeMs,
      isDismissed: dismissals[event.id] !== undefined,
    }));
}

export function selectNextMeeting(events, now, leadTimeMs, dismissals) {
  return selectUpcomingMeetings(events, now, leadTimeMs, dismissals, 1)[0] ?? null;
}

// ----- cache -----

// The popup reads this to paint instantly instead of waiting on a round trip to
// Google, then refreshes itself. Stale by at most one poll period.
export async function readCachedAgenda(now = Date.now()) {
  const stored = await chrome.storage.local.get(AGENDA_STORAGE_KEY);
  const cached = stored[AGENDA_STORAGE_KEY] ?? [];
  // Repainting a meeting that ended half an hour ago is worse than an empty
  // badge -- it asserts something the extension has no reason to believe.
  return cached.filter(
    (meeting) => now - meeting.startsAt <= CACHE_USABLE_AFTER_START_MS,
  );
}

export async function readAccountEmail() {
  const stored = await chrome.storage.local.get(ACCOUNT_STORAGE_KEY);
  return stored[ACCOUNT_STORAGE_KEY] ?? null;
}

export async function readCachedNextMeeting(now = Date.now()) {
  return (await readCachedAgenda(now))[0] ?? null;
}

async function cacheAgenda(agenda) {
  await chrome.storage.local.set({ [AGENDA_STORAGE_KEY]: agenda });
}

// ----- polling -----

export async function refreshAgenda() {
  const now = Date.now();
  const [snapshot, leadTimeMs, dismissals] = await Promise.all([
    fetchCalendarSnapshot(),
    readLeadTimeMs(),
    readDismissals(),
  ]);
  const agenda = selectUpcomingMeetings(
    selectNotifiableEvents(snapshot.events),
    now,
    leadTimeMs,
    dismissals,
  );
  await Promise.all([
    cacheAgenda(agenda),
    chrome.storage.local.set({ [ACCOUNT_STORAGE_KEY]: snapshot.accountEmail }),
  ]);
  return agenda;
}

export async function refreshNextMeeting() {
  return (await refreshAgenda())[0] ?? null;
}

export function installPollingAlarm() {
  // create() replaces an alarm of the same name, so this is safe to call on
  // both install and startup without stacking duplicates.
  chrome.alarms.create(POLL_ALARM_NAME, {
    periodInMinutes: POLL_PERIOD_MINUTES,
  });
}

// ----- backoff -----

export function backoffDelayMs(consecutiveFailures) {
  const delay = POLL_BACKOFF_BASE_MS * 2 ** (consecutiveFailures - 1);
  return Math.min(delay, POLL_BACKOFF_MAX_MS);
}

// Kept in session storage: a fresh browser session deserves a fresh attempt,
// and a backoff that outlived the outage would be its own bug.
export async function readPollFailures() {
  const stored = await chrome.storage.session.get(POLL_FAILURE_STORAGE_KEY);
  return stored[POLL_FAILURE_STORAGE_KEY] ?? { count: 0, nextAttemptAt: 0 };
}

export async function recordPollFailure(now = Date.now()) {
  const { count } = await readPollFailures();
  const consecutiveFailures = count + 1;
  const state = {
    count: consecutiveFailures,
    nextAttemptAt: now + backoffDelayMs(consecutiveFailures),
  };
  await chrome.storage.session.set({ [POLL_FAILURE_STORAGE_KEY]: state });
  return state;
}

export async function clearPollFailures() {
  await chrome.storage.session.remove(POLL_FAILURE_STORAGE_KEY);
}

export async function shouldSkipPoll(now = Date.now()) {
  const { nextAttemptAt } = await readPollFailures();
  return now < nextAttemptAt;
}
