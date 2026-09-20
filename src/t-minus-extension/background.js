import { fetchUpcomingEvents, isNotifiableEvent } from './calendar.js';
import { POLL_ALARM_NAME } from './config.js';
import {
  installPollingAlarm,
  readCachedNextMeeting,
  refreshNextMeeting,
} from './schedule.js';
import { paintBadge } from './badge.js';

const EXTENSION_LIFECYCLE_LOG_PREFIX = '[t-minus]';

// ----- lifecycle -----

chrome.runtime.onInstalled.addListener((installDetails) => {
  console.log(`${EXTENSION_LIFECYCLE_LOG_PREFIX} installed`, {
    reason: installDetails.reason,
    extensionId: chrome.runtime.id,
  });
});

// Runs on every service worker cold start, which is the behaviour every later
// phase has to survive -- Chrome evicts the worker when idle, so all scheduling
// goes through chrome.alarms rather than timers.
console.log(`${EXTENSION_LIFECYCLE_LOG_PREFIX} service worker booted`, {
  extensionId: chrome.runtime.id,
  bootedAt: new Date().toISOString(),
});

// ----- polling -----

async function pollAndPaint() {
  try {
    const nextMeeting = await refreshNextMeeting();
    await paintBadge(nextMeeting);
    return nextMeeting;
  } catch (error) {
    // Not signed in is the ordinary case on a fresh install. Leave whatever the
    // badge already shows rather than blanking it on one failed poll.
    console.log(
      `${EXTENSION_LIFECYCLE_LOG_PREFIX} poll failed`,
      String(error?.message ?? error),
    );
    return null;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  installPollingAlarm();
  pollAndPaint();
});

chrome.runtime.onStartup.addListener(() => {
  installPollingAlarm();
  pollAndPaint();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== POLL_ALARM_NAME) return;
  pollAndPaint();
});

// A cold start between ticks would otherwise leave the badge blank until the
// next alarm; the cached meeting repaints it immediately, without a fetch.
readCachedNextMeeting().then((nextMeeting) => paintBadge(nextMeeting));

// ----- console helpers -----

// Module scope is not global in an MV3 worker, so the useful entry points are
// hung off globalThis for debugging from the service worker console.
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

globalThis.tminus = {
  fetchUpcomingEvents,
  isNotifiableEvent,
  logEventSummary,
  refreshNextMeeting,
  readCachedNextMeeting,
  pollAndPaint,
  paintBadge,
};
