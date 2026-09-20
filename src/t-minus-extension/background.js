import { fetchUpcomingEvents, isNotifiableEvent } from './calendar.js';
import { POLL_ALARM_NAME } from './config.js';
import { findDueEvents, installPollingAlarm } from './schedule.js';
import {
  installNotificationClickHandlers,
  raiseMeetingNotification,
} from './notify.js';

const EXTENSION_LIFECYCLE_LOG_PREFIX = '[t-minus]';

chrome.runtime.onInstalled.addListener((installDetails) => {
  console.log(`${EXTENSION_LIFECYCLE_LOG_PREFIX} installed`, {
    reason: installDetails.reason,
    extensionId: chrome.runtime.id,
  });
});

chrome.runtime.onStartup.addListener(() => {
  console.log(`${EXTENSION_LIFECYCLE_LOG_PREFIX} browser startup`);
});

// Runs on every service worker cold start, which is the behaviour every later
// phase has to survive -- Chrome evicts the worker when idle, so all scheduling
// from Phase 5 onward has to go through chrome.alarms rather than timers.
console.log(`${EXTENSION_LIFECYCLE_LOG_PREFIX} service worker booted`, {
  extensionId: chrome.runtime.id,
  bootedAt: new Date().toISOString(),
});

// Reachable as `tminus.fetchUpcomingEvents(...)` from the service worker console.
// Module scope is not global in an MV3 worker, so without this there is no way
// to probe a different lookahead without editing and reloading.
async function logEventSummary(lookaheadDays = 4) {
  const events = await fetchUpcomingEvents({
    lookaheadMs: lookaheadDays * 24 * 60 * 60 * 1000,
  });
  // Console object previews truncate past a few fields, which hides exactly the
  // ones the filter turns on -- a table column cannot be truncated away.
  console.table(
    events.map((event) => ({
      summary: event.summary.slice(0, 30),
      start: event.startIso,
      allDay: event.isAllDay,
      response: event.selfResponseStatus,
      conference: event.conferenceUrl ? 'yes' : '--',
      notifiable: isNotifiableEvent(event),
    })),
  );
  return `${events.filter(isNotifiableEvent).length} notifiable of ${events.length}`;
}

// Fires the real notification path against the next genuinely notifiable
// meeting, ignoring the due window and the dedupe set, so the display and the
// join click can be checked without waiting for a meeting to come round.
async function testNotification() {
  const upcoming = await fetchUpcomingEvents({
    lookaheadMs: 7 * 24 * 60 * 60 * 1000,
  });
  const candidate = upcoming.filter(isNotifiableEvent)[0];
  if (!candidate) return 'no notifiable meeting in the next week';
  await raiseMeetingNotification(candidate);
  return `raised for "${candidate.summary}" (${candidate.startIso})`;
}

globalThis.tminus = {
  fetchUpcomingEvents,
  isNotifiableEvent,
  logEventSummary,
  findDueEvents,
  raiseMeetingNotification,
  testNotification,
};

// ----- polling -----

installNotificationClickHandlers();

chrome.runtime.onInstalled.addListener(installPollingAlarm);
chrome.runtime.onStartup.addListener(installPollingAlarm);

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== POLL_ALARM_NAME) return;

  try {
    const dueEvents = await findDueEvents();
    if (dueEvents.length === 0) return;
    for (const event of dueEvents) {
      console.log(`${EXTENSION_LIFECYCLE_LOG_PREFIX} notifying`, {
        summary: event.summary,
        startIso: event.startIso,
      });
      await raiseMeetingNotification(event);
    }
  } catch (error) {
    console.log(
      `${EXTENSION_LIFECYCLE_LOG_PREFIX} poll failed`,
      String(error?.message ?? error),
    );
  }
});
