# Pocket Weather

A small, build-free Chrome extension showing New York City current conditions and a five-day forecast automatically, with a remembered Fahrenheit/Celsius preference.

## Install

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this `src/weather-extension` folder.
4. Pin **Pocket Weather** from Chrome's extensions menu, and open it to see NYC weather immediately.

No npm installation or build is needed. After editing files, reload the extension on Chrome's extensions page. This folder is independent of the personal site's Vite build.

## Data and privacy

Forecasts use [Open-Meteo](https://open-meteo.com/), with no API key for its free non-commercial service. Only fixed NYC coordinates are sent to Open-Meteo. The temperature unit stays in local extension storage. There are no content scripts, background tracking, or location permission requests.

Implementation references: [Chrome manifest](https://developer.chrome.com/docs/extensions/reference/manifest), [forecast API](https://open-meteo.com/en/docs).
