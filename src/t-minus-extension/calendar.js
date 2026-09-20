import { forgetStoredToken, getAccessToken } from './auth.js';

const CALENDAR_EVENTS_ENDPOINT =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export const DEFAULT_LOOKAHEAD_MS = 24 * 60 * 60 * 1000;

// A day's worth of meetings never approaches this, so the response is read as a
// single page and nextPageToken is ignored. Widening the lookahead past a day
// means revisiting that.
const MAX_EVENTS_PER_REQUEST = 250;

// ----- request -----

function buildEventsListUrl({ lookaheadMs }) {
  const now = Date.now();
  const url = new URL(CALENDAR_EVENTS_ENDPOINT);
  url.search = new URLSearchParams({
    timeMin: new Date(now).toISOString(),
    timeMax: new Date(now + lookaheadMs).toISOString(),
    // singleEvents expands recurring series into individual instances, which is
    // what a start-time comparison needs; orderBy requires it.
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(MAX_EVENTS_PER_REQUEST),
  }).toString();
  return url.toString();
}

function requestEventsPage(url, accessToken) {
  return fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
}

// ----- normalization -----

function findSelfAttendee(rawEvent) {
  return (rawEvent.attendees ?? []).find((attendee) => attendee.self);
}

function findVideoConferenceUrl(rawEvent) {
  if (rawEvent.hangoutLink) return rawEvent.hangoutLink;
  const videoEntryPoint = (rawEvent.conferenceData?.entryPoints ?? []).find(
    (entryPoint) => entryPoint.entryPointType === 'video',
  );
  return videoEntryPoint?.uri ?? null;
}

// "2026-09-21" parsed by Date is UTC midnight, which lands on the wrong day for
// anyone west of Greenwich. An all-day event means midnight where the user is.
function parseAllDayStart(dateText) {
  const [year, month, day] = dateText.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

function toCalendarEvent(rawEvent) {
  // An all-day event carries start.date; a timed one carries start.dateTime.
  const isAllDay = Boolean(rawEvent.start?.date);
  const startIso = rawEvent.start?.dateTime ?? rawEvent.start?.date ?? null;
  const startsAt = isAllDay
    ? parseAllDayStart(rawEvent.start.date)
    : startIso && new Date(startIso).getTime();

  return {
    id: rawEvent.id,
    summary: rawEvent.summary ?? '(no title)',
    startsAt: startsAt || null,
    startIso,
    isAllDay,
    conferenceUrl: findVideoConferenceUrl(rawEvent),
    selfResponseStatus: findSelfAttendee(rawEvent)?.responseStatus ?? null,
    htmlLink: rawEvent.htmlLink ?? null,
  };
}

// ----- public api -----

export async function fetchCalendarSnapshot({
  lookaheadMs = DEFAULT_LOOKAHEAD_MS,
  interactive = false,
} = {}) {
  const url = buildEventsListUrl({ lookaheadMs });

  let accessToken = await getAccessToken({ interactive });
  let response = await requestEventsPage(url, accessToken);

  if (response.status === 401) {
    // Google rejected a token the expiry check still considered live -- revoked
    // from the account, or the session behind it ended. Forget it and re-acquire
    // once; a second 401 is a real failure and falls through below.
    await forgetStoredToken();
    accessToken = await getAccessToken({ interactive });
    response = await requestEventsPage(url, accessToken);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    const failure = new Error(
      `calendar events.list failed: ${response.status} ${errorBody}`,
    );
    // Rate limiting and server faults are worth waiting out; a 400 will fail
    // identically no matter how long the caller waits.
    failure.isTransient = response.status === 429 || response.status >= 500;
    throw failure;
  }

  const payload = await response.json();
  return {
    // For the primary calendar Google returns the account's own address here,
    // so the signed-in identity comes free with the events -- no extra scope,
    // no second request, and nothing for the user to re-consent to.
    accountEmail: payload.summary ?? null,
    events: (payload.items ?? []).map(toCalendarEvent),
  };
}

export async function fetchUpcomingEvents(options) {
  return (await fetchCalendarSnapshot(options)).events;
}

// ----- selection -----

// Google omits the attendees array entirely on an event with no other guests,
// so a null response status means "never asked", not "ignored" -- that is a solo
// block the user still wants warning about, and it must not be filtered out.
const DECLINED_RESPONSE_STATUS = 'declined';

export function isNotifiableEvent(event) {
  if (event.isAllDay) return false;
  if (!event.conferenceUrl) return false;
  if (event.selfResponseStatus === DECLINED_RESPONSE_STATUS) return false;
  if (!Number.isFinite(event.startsAt)) return false;
  return true;
}

export function selectNotifiableEvents(events) {
  return events.filter(isNotifiableEvent);
}
