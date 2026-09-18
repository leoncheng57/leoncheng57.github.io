# NYC Weather extension privacy policy

This policy applies to the NYC Weather Chrome/Brave extension, published by Leon Cheng.

## Information stored on your device

The extension saves your Fahrenheit/Celsius preference, light/dark appearance, and the latest New York City toolbar temperature and update time in your browser's local storage. These values are used to display weather and keep the popup and toolbar consistent. They are not sent to the developer or synced through an extension account.

## Weather requests

The extension requests weather from `api.open-meteo.com` and air quality from `air-quality-api.open-meteo.com`. Requests always use fixed New York City coordinates (40.7128, -74.006). The extension does not request your device's location or infer your location.

Like other internet requests, these connections expose your IP address and standard connection/request information to the API provider. Open-Meteo handles that information under its own [privacy policy](https://open-meteo.com/en/terms). Weather requests are made when the popup opens or is refreshed, and background temperature requests are scheduled approximately every 15 minutes while the browser is running.

## Data the extension does not collect

The extension has no developer-operated data collection server, analytics, advertisements, account registration, or tracking code. It does not read browsing history, webpage contents, personal communications, passwords, or payment information. It does not sell user data, use data for advertising, or use data for creditworthiness or lending. Network requests serve only its weather-display purpose.

## Permissions

- **Alarms:** periodically refresh the toolbar temperature.
- **Storage:** remember settings and the recent toolbar reading locally.
- **Open-Meteo host access:** retrieve weather and air-quality JSON for New York City. No remotely hosted code is executed.

## External links

If you choose to open the full NYC Weather website, Open-Meteo, or the GitHub support page, you leave the extension. Those websites handle their own browsing activity and requests under their respective policies.

## Your choices and contact

You can change the unit and appearance in the popup. Removing the extension removes its extension-local data through the browser's normal uninstall process and stops its background requests.

For questions or support, open an issue at [the NYC Weather project](https://github.com/leoncheng57/leoncheng57.github.io/issues). Do not include private information in a public issue.
