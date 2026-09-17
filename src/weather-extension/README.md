# Pocket Weather

A small, build-free Chrome extension with city search, current conditions, a five-day forecast, Fahrenheit/Celsius, and a remembered city. Your previous Weather App was not available in this workspace, so this is a standalone first version.

## Install

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this `src/weather-extension` folder.
4. Pin **Pocket Weather** from Chrome's extensions menu, open it, and search for your city.

No npm installation or build is needed. After editing files, reload the extension on Chrome's extensions page. This folder is independent of the personal site's Vite build.

## Data and privacy

Forecasts and city search use [Open-Meteo](https://open-meteo.com/), with no API key for its free non-commercial service. Searches and selected coordinates are sent to Open-Meteo. The chosen city and temperature unit stay in local extension storage. There are no content scripts, background tracking, or location permission requests.

Implementation references: [Chrome manifest](https://developer.chrome.com/docs/extensions/reference/manifest), [forecast API](https://open-meteo.com/en/docs), [geocoding API](https://open-meteo.com/en/docs/geocoding-api).
