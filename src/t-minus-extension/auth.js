import {
  OAUTH_CLIENT_ID,
  OAUTH_SCOPES,
  TOKEN_EXPIRY_SKEW_MS,
  TOKEN_STORAGE_KEY,
} from './config.js';

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';

// launchWebAuthFlow rather than getAuthToken: Brave strips Chrome's Google
// account integration, so getAuthToken never resolves there. See README.
function buildAuthUrl({ interactive }) {
  const url = new URL(AUTH_ENDPOINT);
  url.search = new URLSearchParams({
    client_id: OAUTH_CLIENT_ID,
    // The implicit flow returns the token in the redirect fragment. An auth
    // code would have to be exchanged at the token endpoint, which for a Web
    // application client wants the client secret we cannot ship.
    response_type: 'token',
    redirect_uri: chrome.identity.getRedirectURL(),
    scope: OAUTH_SCOPES.join(' '),
    // none = reuse the existing Google session silently, or fail fast so the
    // caller can decide whether to prompt.
    prompt: interactive ? 'consent' : 'none',
  }).toString();
  return url.toString();
}

function parseAuthRedirect(redirectUrl) {
  const fragment = new URL(redirectUrl).hash.slice(1);
  const params = new URLSearchParams(fragment);

  const error = params.get('error');
  if (error) {
    throw new Error(`authorization rejected: ${error}`);
  }

  const accessToken = params.get('access_token');
  const expiresIn = Number(params.get('expires_in'));
  if (!accessToken || !Number.isFinite(expiresIn)) {
    throw new Error('authorization response carried no usable access token');
  }

  return {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };
}

async function readStoredToken() {
  const stored = await chrome.storage.local.get(TOKEN_STORAGE_KEY);
  const token = stored[TOKEN_STORAGE_KEY];
  if (!token?.accessToken) return null;
  if (token.expiresAt - TOKEN_EXPIRY_SKEW_MS <= Date.now()) return null;
  return token;
}

async function authorize({ interactive }) {
  const redirectUrl = await chrome.identity.launchWebAuthFlow({
    url: buildAuthUrl({ interactive }),
    interactive,
  });

  // Chrome resolves with undefined when a non-interactive flow needs a prompt.
  if (!redirectUrl) {
    throw new Error('sign-in required');
  }

  const token = parseAuthRedirect(redirectUrl);
  await chrome.storage.local.set({ [TOKEN_STORAGE_KEY]: token });
  return token;
}

/**
 * Return a valid access token, reusing the stored one when it has not expired.
 *
 * @param {{interactive?: boolean}} options `interactive: true` may open a
 *   sign-in window; the default only tries the cached token and a silent
 *   refresh, so callers on a timer never surprise the user with a popup.
 * @returns {Promise<string>} The access token.
 */
export async function getAccessToken({ interactive = false } = {}) {
  const stored = await readStoredToken();
  if (stored) return stored.accessToken;

  try {
    const token = await authorize({ interactive: false });
    return token.accessToken;
  } catch (silentError) {
    if (!interactive) throw silentError;
  }

  const token = await authorize({ interactive: true });
  return token.accessToken;
}

/** Drop the stored token and revoke it with Google, best effort. */
export async function signOut() {
  const stored = await chrome.storage.local.get(TOKEN_STORAGE_KEY);
  const accessToken = stored[TOKEN_STORAGE_KEY]?.accessToken;
  await chrome.storage.local.remove(TOKEN_STORAGE_KEY);

  if (!accessToken) return;
  // A revoke failure leaves a token that expires on its own within the hour,
  // so it must not block the local sign-out the user asked for.
  try {
    await fetch(`${REVOKE_ENDPOINT}?token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
    });
  } catch {
    // ignored
  }
}

/** Whether a usable token is already stored, without touching the network. */
export async function hasValidToken() {
  return (await readStoredToken()) !== null;
}
