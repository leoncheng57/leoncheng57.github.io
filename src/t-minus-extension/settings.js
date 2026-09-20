import {
  DEFAULT_LEAD_TIME_MS,
  DISMISSED_RETENTION_MS,
  DISMISSED_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
} from './config.js';

// ----- lead time -----

export async function readLeadTimeMs() {
  const stored = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
  const leadTimeMs = stored[SETTINGS_STORAGE_KEY]?.leadTimeMs;
  return Number.isFinite(leadTimeMs) ? leadTimeMs : DEFAULT_LEAD_TIME_MS;
}

export async function writeLeadTimeMs(leadTimeMs) {
  await chrome.storage.local.set({
    [SETTINGS_STORAGE_KEY]: { leadTimeMs },
  });
}

// ----- dismissals -----

// Keyed by event instance ID, so dismissing today's standup says nothing about
// tomorrow's -- events.list hands back per-instance IDs.
export async function readDismissals() {
  const stored = await chrome.storage.local.get(DISMISSED_STORAGE_KEY);
  return stored[DISMISSED_STORAGE_KEY] ?? {};
}

export async function dismissMeeting(eventId, startsAt) {
  const dismissals = await readDismissals();
  const now = Date.now();
  const kept = Object.fromEntries(
    Object.entries(dismissals).filter(
      ([, dismissedStart]) => now - dismissedStart < DISMISSED_RETENTION_MS,
    ),
  );
  kept[eventId] = startsAt;
  await chrome.storage.local.set({ [DISMISSED_STORAGE_KEY]: kept });
}

export async function restoreMeeting(eventId) {
  const dismissals = await readDismissals();
  delete dismissals[eventId];
  await chrome.storage.local.set({ [DISMISSED_STORAGE_KEY]: dismissals });
}
