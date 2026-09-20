import {
  DEFAULT_LEAD_TIME_MS,
  NEXT_MEETING_STORAGE_KEY,
  POLL_ALARM_NAME,
  POLL_PERIOD_MINUTES,
} from './config.js';
import { fetchUpcomingEvents, selectNotifiableEvents } from './calendar.js';

// A meeting stays interesting for a while after it starts -- someone joining
// late still wants the button. Past this it is no longer "next".
const STARTED_GRACE_MS = 10 * 60_000;

export function selectNextMeeting(events, now, leadTimeMs = DEFAULT_LEAD_TIME_MS) {
  const candidates = events
    .filter((event) => event.startsAt - now > -STARTED_GRACE_MS)
    .sort((a, b) => a.startsAt - b.startsAt);

  const next = candidates[0];
  if (!next) return null;

  return {
    id: next.id,
    summary: next.summary,
    startsAt: next.startsAt,
    startIso: next.startIso,
    conferenceUrl: next.conferenceUrl,
    isDue: next.startsAt - now <= leadTimeMs,
  };
}

// ----- cache -----

// The popup reads this to paint instantly instead of waiting on a round trip to
// Google, then refreshes itself. Stale by at most one poll period.
export async function readCachedNextMeeting() {
  const stored = await chrome.storage.local.get(NEXT_MEETING_STORAGE_KEY);
  return stored[NEXT_MEETING_STORAGE_KEY] ?? null;
}

async function cacheNextMeeting(nextMeeting) {
  await chrome.storage.local.set({ [NEXT_MEETING_STORAGE_KEY]: nextMeeting });
}

// ----- polling -----

export async function refreshNextMeeting({
  leadTimeMs = DEFAULT_LEAD_TIME_MS,
} = {}) {
  const now = Date.now();
  const notifiable = selectNotifiableEvents(await fetchUpcomingEvents());
  const nextMeeting = selectNextMeeting(notifiable, now, leadTimeMs);
  await cacheNextMeeting(nextMeeting);
  return nextMeeting;
}

export function installPollingAlarm() {
  // create() replaces an alarm of the same name, so this is safe to call on
  // both install and startup without stacking duplicates.
  chrome.alarms.create(POLL_ALARM_NAME, {
    periodInMinutes: POLL_PERIOD_MINUTES,
  });
}
