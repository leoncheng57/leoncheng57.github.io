import { fetchUpcomingEvents, isNotifiableEvent } from './calendar.js';
import { SignInRequiredError } from './auth.js';
import { POLL_ALARM_NAME } from './config.js';
import {
  clearPollFailures,
  installPollingAlarm,
  readCachedNextMeeting,
  readPollFailures,
  recordPollFailure,
  refreshNextMeeting,
  shouldSkipPoll,
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
  // Repaint from cache before anything else, so a countdown stays live through
  // an outage instead of freezing on whatever minute the last poll saw.
  const cached = await readCachedNextMeeting();
  if (cached) await paintBadge(cached);

  if (await shouldSkipPoll()) return cached;

  try {
    const nextMeeting = await refreshNextMeeting();
    await paintBadge(nextMeeting);
    await clearPollFailures();
    return nextMeeting;
  } catch (error) {
    if (error instanceof SignInRequiredError) {
      // Nothing to wait out: the badge is asserting a calendar the extension
      // can no longer read, so clear it and let the popup ask for sign-in.
      await paintBadge(null);
      await clearPollFailures();
      console.log(`${EXTENSION_LIFECYCLE_LOG_PREFIX} signed out`);
      return null;
    }

    const { count, nextAttemptAt } = await recordPollFailure();
    console.log(`${EXTENSION_LIFECYCLE_LOG_PREFIX} poll failed`, {
      attempt: count,
      retryAt: new Date(nextAttemptAt).toISOString(),
      error: String(error?.message ?? error),
    });
    return cached;
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
// next alarm. Repaint from cache immediately, and make sure the alarm still
// exists: neither onInstalled nor onStartup fires when Chrome revives a worker,
// so an alarm lost to a crash would otherwise never come back.
(async () => {
  const existing = await chrome.alarms.get(POLL_ALARM_NAME);
  if (!existing) installPollingAlarm();
  await paintBadge(await readCachedNextMeeting());
})();

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
  readPollFailures,
  clearPollFailures,
};
