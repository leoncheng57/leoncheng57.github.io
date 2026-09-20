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
