const NOTIFICATION_ID_PREFIX = 'tminus:';

// chrome.notifications hands the click callback nothing but the notification
// id, so the join URL has to be parked somewhere the callback can reach. It
// cannot be a module-level Map: Chrome evicts the worker while the notification
// sits on screen, and the click then arrives in a fresh worker with empty
// memory. storage.session survives that and is cleared when the browser closes,
// which is exactly the lifetime a pending notification has.
async function rememberConferenceUrl(notificationId, conferenceUrl) {
  await chrome.storage.session.set({ [notificationId]: conferenceUrl });
}

async function takeConferenceUrl(notificationId) {
  const stored = await chrome.storage.session.get(notificationId);
  await chrome.storage.session.remove(notificationId);
  return stored[notificationId] ?? null;
}

function describeLeadTime(startsAt, now) {
  const minutes = Math.round((startsAt - now) / 60_000);
  if (minutes <= 0) return 'Starting now';
  if (minutes === 1) return 'Starts in 1 minute';
  return `Starts in ${minutes} minutes`;
}

export async function raiseMeetingNotification(event, now = Date.now()) {
  const notificationId = `${NOTIFICATION_ID_PREFIX}${event.id}`;
  // Stored before the notification exists, so a click can never arrive ahead of
  // the URL it needs.
  await rememberConferenceUrl(notificationId, event.conferenceUrl);

  await chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icon-128.png'),
    title: event.summary,
    message: describeLeadTime(event.startsAt, now),
    // A meeting warning that auto-hides after a few seconds is one the user
    // misses while looking at another window -- the exact case this extension
    // exists for. It stays until dismissed.
    requireInteraction: true,
    buttons: [{ title: 'Join' }],
  });

  return notificationId;
}

async function openConference(notificationId) {
  if (!notificationId.startsWith(NOTIFICATION_ID_PREFIX)) return;
  const conferenceUrl = await takeConferenceUrl(notificationId);
  if (!conferenceUrl) return;
  await chrome.tabs.create({ url: conferenceUrl });
  await chrome.notifications.clear(notificationId);
}

export function installNotificationClickHandlers() {
  chrome.notifications.onClicked.addListener(openConference);
  chrome.notifications.onButtonClicked.addListener(openConference);
  chrome.notifications.onClosed.addListener((notificationId) => {
    chrome.storage.session.remove(notificationId);
  });
}
