// The OAuth client is a Web application client, so the client ID is public by
// design -- it is sent in the authorization URL on every sign-in. The client
// secret that Google issued alongside it is deliberately not here: anything in
// this bundle is readable by anyone who installs the extension.
export const OAUTH_CLIENT_ID =
  '324229282876-no30bbqvtbntofh77qe8e6l9uac9ul27.apps.googleusercontent.com';

export const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

export const TOKEN_STORAGE_KEY = 'tminus.token';

// Treat a token as expired slightly early so a fetch started just under the
// wire does not land after real expiry.
export const TOKEN_EXPIRY_SKEW_MS = 60_000;

// Chrome clamps alarm periods to one minute, which also sets the worst-case
// lateness of a notification: a meeting can be up to a minute further along
// than the lead time suggests.
export const POLL_PERIOD_MINUTES = 1;
export const POLL_ALARM_NAME = 'tminus.poll';

// How early the badge turns amber. Overridable from the popup; this is the
// fallback before anyone has chosen.
export const DEFAULT_LEAD_TIME_MS = 2 * 60_000;

export const LEAD_TIME_CHOICES_MS = [60_000, 2 * 60_000, 5 * 60_000, 10 * 60_000, 15 * 60_000];

export const SETTINGS_STORAGE_KEY = 'tminus.settings';

// Meetings the user has silenced, kept as id -> start so the record can be
// pruned once the meeting is over rather than growing forever.
export const DISMISSED_STORAGE_KEY = 'tminus.dismissed';
export const DISMISSED_RETENTION_MS = 60 * 60_000;

export const AGENDA_STORAGE_KEY = 'tminus.agenda';
export const ACCOUNT_STORAGE_KEY = 'tminus.account';

// How many meetings the popup can list when expanded. Five covers a packed
// day without turning a glance into a scroll.
export const AGENDA_LIMIT = 5;

// Badge colors. Amber once a meeting is inside the lead window, muted grey
// while one is merely approaching, so a glance separates 'now' from 'soon'.
export const BADGE_DUE_COLOR = '#c2410c';
export const BADGE_SOON_COLOR = '#64748b';

// Beyond this the badge stays empty -- a number counting down all afternoon is
// noise, not information.
export const BADGE_VISIBLE_WITHIN_MS = 60 * 60_000;

// Failed polls back off exponentially from one minute to roughly half an hour,
// so a Google outage or a rate limit is not met with a request every minute for
// as long as the browser stays open.
export const POLL_BACKOFF_BASE_MS = 60_000;
export const POLL_BACKOFF_MAX_MS = 32 * 60_000;
export const POLL_FAILURE_STORAGE_KEY = 'tminus.pollFailures';

// A cached meeting is only worth repainting for so long after it starts.
export const CACHE_USABLE_AFTER_START_MS = 10 * 60_000;
