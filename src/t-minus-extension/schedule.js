import {
  DEFAULT_LEAD_TIME_MS,
  NOTIFIED_RETENTION_MS,
  NOTIFIED_STORAGE_KEY,
  POLL_ALARM_NAME,
  POLL_PERIOD_MINUTES,
} from './config.js';
import { fetchUpcomingEvents, selectNotifiableEvents } from './calendar.js';

// ----- the fired-already set -----

// Keyed by event ID mapped to the meeting's start. Recurring series arrive from
// events.list already expanded into per-instance IDs, so tomorrow's standup is a
// different key from today's and dedupe never swallows it.
async function readNotifiedEvents() {
  const stored = await chrome.storage.local.get(NOTIFIED_STORAGE_KEY);
  return stored[NOTIFIED_STORAGE_KEY] ?? {};
}

function withoutStaleEntries(notifiedEvents, now) {
  return Object.fromEntries(
    Object.entries(notifiedEvents).filter(
      ([, startedAt]) => now - startedAt < NOTIFIED_RETENTION_MS,
    ),
  );
}

async function markEventsNotified(events, now) {
  const notifiedEvents = withoutStaleEntries(await readNotifiedEvents(), now);
  for (const event of events) {
    notifiedEvents[event.id] = event.startsAt;
  }
  await chrome.storage.local.set({ [NOTIFIED_STORAGE_KEY]: notifiedEvents });
}

// ----- due-event selection -----

export function selectDueEvents(events, notifiedEvents, now, leadTimeMs) {
  return events.filter((event) => {
    if (notifiedEvents[event.id] !== undefined) return false;
    const msUntilStart = event.startsAt - now;
    // Already started is still worth firing: a worker asleep through the lead
    // window would otherwise drop the notification entirely. The retention
    // window is what stops it firing over and over afterwards.
    return msUntilStart <= leadTimeMs && msUntilStart > -NOTIFIED_RETENTION_MS;
  });
}

// ----- polling -----

export async function findDueEvents({ leadTimeMs = DEFAULT_LEAD_TIME_MS } = {}) {
  const now = Date.now();
  const upcomingEvents = await fetchUpcomingEvents();
  const notifiableEvents = selectNotifiableEvents(upcomingEvents);
  const notifiedEvents = await readNotifiedEvents();

  const dueEvents = selectDueEvents(
    notifiableEvents,
    notifiedEvents,
    now,
    leadTimeMs,
  );

  if (dueEvents.length > 0) {
    // Recorded before any notification is raised, so a failure to display
    // cannot turn into the same meeting firing on every tick afterwards.
    await markEventsNotified(dueEvents, now);
  }

  return dueEvents;
}

export function installPollingAlarm() {
  // create() replaces an alarm of the same name, so this is safe to call on
  // both install and startup without stacking duplicates.
  chrome.alarms.create(POLL_ALARM_NAME, {
    periodInMinutes: POLL_PERIOD_MINUTES,
  });
}
