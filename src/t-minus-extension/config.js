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

// Phase 8 makes this user-configurable; until then it is the one number that
// decides how early the warning lands.
export const DEFAULT_LEAD_TIME_MS = 2 * 60_000;

export const NEXT_MEETING_STORAGE_KEY = 'tminus.nextMeeting';

// Badge colors. Amber once a meeting is inside the lead window, muted grey
// while one is merely approaching, so a glance separates 'now' from 'soon'.
export const BADGE_DUE_COLOR = '#c2410c';
export const BADGE_SOON_COLOR = '#64748b';

// Beyond this the badge stays empty -- a number counting down all afternoon is
// noise, not information.
export const BADGE_VISIBLE_WITHIN_MS = 60 * 60_000;
