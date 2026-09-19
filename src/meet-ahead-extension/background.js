const EXTENSION_LIFECYCLE_LOG_PREFIX = '[meet-ahead]';

chrome.runtime.onInstalled.addListener((installDetails) => {
  console.log(`${EXTENSION_LIFECYCLE_LOG_PREFIX} installed`, {
    reason: installDetails.reason,
    extensionId: chrome.runtime.id,
  });
});

chrome.runtime.onStartup.addListener(() => {
  console.log(`${EXTENSION_LIFECYCLE_LOG_PREFIX} browser startup`);
});

// Runs on every service worker cold start, which is the behaviour every later
// phase has to survive -- Chrome evicts the worker when idle, so all scheduling
// from Phase 5 onward has to go through chrome.alarms rather than timers.
console.log(`${EXTENSION_LIFECYCLE_LOG_PREFIX} service worker booted`, {
  extensionId: chrome.runtime.id,
  bootedAt: new Date().toISOString(),
});
