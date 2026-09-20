import { getAccessToken, hasValidToken, signOut } from './auth.js';

const statusEl = document.getElementById('status');
const detailEl = document.getElementById('detail');
const actionEl = document.getElementById('action');

// Phase 2 is a harness for the auth flow, not the real UI -- Phase 7 replaces
// this popup with the next-meeting view.
let signedIn = false;

function render() {
  statusEl.textContent = signedIn ? 'Signed in.' : 'Not signed in.';
  actionEl.textContent = signedIn ? 'Sign out' : 'Sign in with Google';
  actionEl.disabled = false;
}

async function onAction() {
  actionEl.disabled = true;
  detailEl.textContent = '';

  try {
    if (signedIn) {
      await signOut();
      signedIn = false;
    } else {
      statusEl.textContent = 'Waiting for Google...';
      const token = await getAccessToken({ interactive: true });
      signedIn = true;
      detailEl.textContent = `Token acquired (${token.length} chars).`;
    }
  } catch (error) {
    detailEl.textContent = String(error?.message ?? error);
  }

  render();
}

actionEl.addEventListener('click', onAction);

hasValidToken().then((valid) => {
  signedIn = valid;
  render();
});
