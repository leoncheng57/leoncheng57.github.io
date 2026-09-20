import { getAccessToken, hasValidToken, signOut } from './auth.js';
import { readCachedNextMeeting, refreshNextMeeting } from './schedule.js';
import { describeCountdown, paintBadge } from './badge.js';
import { LEAD_TIME_CHOICES_MS } from './config.js';
import {
  dismissMeeting,
  readLeadTimeMs,
  restoreMeeting,
  writeLeadTimeMs,
} from './settings.js';

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
const dismissEl = document.getElementById('dismiss');
const dismissedEl = document.getElementById('dismissed');
const restoreEl = document.getElementById('restore');
const leadEl = document.getElementById('lead');
const footerEl = document.getElementById('footer');

const startTimeFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

function showPanel(name) {
  for (const [panelName, element] of Object.entries(panels)) {
    element.hidden = panelName !== name;
  }
  footerEl.hidden = name === 'signin' || name === 'loading';
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
  dismissedEl.hidden = !nextMeeting.isDismissed;
  dismissEl.hidden = Boolean(nextMeeting.isDismissed);
  dismissEl.onclick = async () => {
    await dismissMeeting(nextMeeting.id, nextMeeting.startsAt);
    await reload();
  };
  restoreEl.onclick = async () => {
    await restoreMeeting(nextMeeting.id);
    await reload();
  };

  joinEl.disabled = !nextMeeting.conferenceUrl;
  joinEl.onclick = async () => {
    if (!nextMeeting.conferenceUrl) return;
    await chrome.tabs.create({ url: nextMeeting.conferenceUrl });
    window.close();
  };

  showPanel('meeting');
}

function describeLeadChoice(leadTimeMs) {
  const minutes = leadTimeMs / 60_000;
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

async function renderLeadTimePicker() {
  const current = await readLeadTimeMs();
  leadEl.replaceChildren(
    ...LEAD_TIME_CHOICES_MS.map((leadTimeMs) => {
      const option = document.createElement('option');
      option.value = String(leadTimeMs);
      option.textContent = describeLeadChoice(leadTimeMs);
      option.selected = leadTimeMs === current;
      return option;
    }),
  );
}

leadEl.addEventListener('change', async () => {
  await writeLeadTimeMs(Number(leadEl.value));
  await reload();
});

async function reload() {
  const nextMeeting = await refreshNextMeeting();
  await paintBadge(nextMeeting);
  renderMeeting(nextMeeting);
}

async function load() {
  await renderLeadTimePicker();

  if (!(await hasValidToken())) {
    showPanel('signin');
    return;
  }

  // Paint the cached meeting first so the popup never opens on a spinner, then
  // refresh -- the cache is at most one poll period stale.
  const cached = await readCachedNextMeeting();
  if (cached) renderMeeting(cached);

  try {
    await reload();
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
