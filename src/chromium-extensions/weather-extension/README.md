# NYC Weather

A Chrome/Brave extension matching the NYC Weather PWA's hourly homepage: Classic Navy light/dark styling, current conditions, AQI, and interactive temperature and precipitation charts covering the past 12 hours and next 24 hours. Weekly and Alerts open the corresponding PWA pages in a new tab.

## Install and test

1. Open `chrome://extensions` (or `brave://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this `src/chromium-extensions/weather-extension` folder. If already installed, click **Reload** instead.
4. Pin **NYC Weather**. The toolbar icon displays the current temperature, without needing to open the popup.
5. Open the popup. Check the hourly charts; drag or use the arrow keys on either chart to scrub through hours.
6. Toggle °F/°C and confirm the popup and toolbar agree. Close and reopen to check persistence. Switch light/dark mode to check the alternate appearance.
7. Hover the toolbar icon for units and the update time. The worker refreshes approximately every 15 minutes while the browser runs; sleep can delay updates.

The bundled popup is checked in, so installation needs no build. After editing `ui/`, run `node src/chromium-extensions/weather-extension/build.mjs` from the repository root (after `npm install`), then reload the extension. `popup.js` and `popup.css` are generated; edit `ui/` instead. `background.js` runs directly without bundling.

## Source and scope

The chart components, formatting helpers, types, default light/dark tokens, and homepage styles were adapted from this repository's NYC Weather PWA at commit `d5c397e`. The popup implements the hourly homepage first. It keeps the PWA's chart interactions and adds an extension unit toggle. The PWA's full palette picker and other routes remain on the website.

## Data and privacy

Weather and AQI use [Open-Meteo](https://open-meteo.com/). Only fixed NYC coordinates are requested; there is no geolocation or browsing-history access. `alarms` schedules toolbar updates; `storage` shares the temperature and unit with the service worker. A recent toolbar reading is retained on network errors and replaced with a dash when older than 30 minutes at the next refresh. Opening the popup fetches fresh data and updates the icon. Settings from the old Pocket Weather version are migrated on first popup open.

API references: [Chrome action](https://developer.chrome.com/docs/extensions/reference/api/action), [alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [Open-Meteo](https://open-meteo.com/en/docs).
