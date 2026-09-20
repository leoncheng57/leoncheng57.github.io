import {
  BADGE_DUE_COLOR,
  BADGE_SOON_COLOR,
  BADGE_VISIBLE_WITHIN_MS,
} from './config.js';

export function minutesUntil(startsAt, now) {
  return Math.ceil((startsAt - now) / 60_000);
}

export function describeCountdown(startsAt, now) {
  const minutes = minutesUntil(startsAt, now);
  if (minutes <= 0) return 'Started';
  if (minutes === 1) return 'in 1 min';
  if (minutes < 60) return `in ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `in ${hours}h` : `in ${hours}h ${remainder}m`;
}

// Badge text has room for about four characters, so the countdown collapses to
// the coarsest unit that still reads honestly.
export function badgeTextFor(nextMeeting, now) {
  if (!nextMeeting) return '';
  // Dismissing silences the icon, not the popup -- the meeting is still next.
  if (nextMeeting.isDismissed) return '';
  const msUntilStart = nextMeeting.startsAt - now;
  if (msUntilStart <= 0) return 'now';
  if (msUntilStart > BADGE_VISIBLE_WITHIN_MS) return '';
  return `${minutesUntil(nextMeeting.startsAt, now)}m`;
}

export async function paintBadge(nextMeeting, now = Date.now()) {
  const text = badgeTextFor(nextMeeting, now);
  await chrome.action.setBadgeText({ text });

  if (!text) {
    await chrome.action.setTitle({ title: 'T-minus' });
    return;
  }

  await chrome.action.setBadgeBackgroundColor({
    color: nextMeeting.isDue ? BADGE_DUE_COLOR : BADGE_SOON_COLOR,
  });
  await chrome.action.setTitle({
    title: `${nextMeeting.summary} — ${describeCountdown(nextMeeting.startsAt, now)}`,
  });
}
