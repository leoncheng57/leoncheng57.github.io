import { getAccessToken, hasValidToken, signOut } from './auth.js';
import { readCachedNextMeeting, refreshNextMeeting } from './schedule.js';
import { describeCountdown, paintBadge } from './badge.js';

const panels = {
  meeting: document.getElementById('meeting'),
  empty: document.getElementById('empty'),
  signin: document.getElementById('signin'),
  loading: document.getElementById('loading'),
};
const countdownEl = document.getElementById('countdown');
const summaryEl = document.getElementById('summary');
const startEl = document.getElementById('start');
const joinEl = document.getElementById('join');
const actionEl = document.getElementById('action');
const detailEl = document.getElementById('detail');
const signOutEl = document.getElementById('signout');

const startTimeFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

function showPanel(name) {
  for (const [panelName, element] of Object.entries(panels)) {
    element.hidden = panelName !== name;
  }
  signOutEl.hidden = name === 'signin';
}

function renderMeeting(nextMeeting) {
  if (!nextMeeting) {
    showPanel('empty');
    return;
  }

  const now = Date.now();
  countdownEl.textContent = describeCountdown(nextMeeting.startsAt, now);
  countdownEl.classList.toggle('is-due', Boolean(nextMeeting.isDue));
  summaryEl.textContent = nextMeeting.summary;
  startEl.textContent = startTimeFormat.format(new Date(nextMeeting.startsAt));
  joinEl.disabled = !nextMeeting.conferenceUrl;
  joinEl.onclick = async () => {
    if (!nextMeeting.conferenceUrl) return;
    await chrome.tabs.create({ url: nextMeeting.conferenceUrl });
    window.close();
  };

  showPanel('meeting');
}

async function load() {
  if (!(await hasValidToken())) {
    showPanel('signin');
    return;
  }

  // Paint the cached meeting first so the popup never opens on a spinner, then
  // refresh -- the cache is at most one poll period stale.
  const cached = await readCachedNextMeeting();
  if (cached) renderMeeting(cached);

  try {
    const nextMeeting = await refreshNextMeeting();
    await paintBadge(nextMeeting);
    renderMeeting(nextMeeting);
  } catch (error) {
    // A refresh failure with a cached meeting on screen is not worth reporting;
    // with nothing on screen it is the only thing to say.
    if (!cached) {
      showPanel('signin');
      detailEl.textContent = String(error?.message ?? error);
    }
  }
}

actionEl.addEventListener('click', async () => {
  actionEl.disabled = true;
  detailEl.textContent = '';
  try {
    await getAccessToken({ interactive: true });
    showPanel('loading');
    await load();
  } catch (error) {
    detailEl.textContent = String(error?.message ?? error);
  }
  actionEl.disabled = false;
});

signOutEl.addEventListener('click', async () => {
  await signOut();
  await paintBadge(null);
  showPanel('signin');
});

load();
