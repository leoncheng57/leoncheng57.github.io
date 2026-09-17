const $ = (id) => document.getElementById(id);
let unit = 'F';
const location = { name: 'New York City', admin1: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 };
let weather;
let forecastRequest;

function describe(code, day = true) {
  if (code === 0) return [day ? 'Clear sky' : 'Clear night', day ? '☀' : '☾'];
  if (code === 1 || code === 2) return ['Partly cloudy', day ? '⛅' : '☁'];
  if (code === 3) return ['Overcast', '☁'];
  if ([45, 48].includes(code)) return ['Fog', '≋'];
  if ([51, 53, 55, 56, 57].includes(code)) return ['Drizzle', '☂'];
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return ['Rain', '☂'];
  if ([71, 73, 75, 77, 85, 86].includes(code)) return ['Snow', '❄'];
  if ([95, 96, 99].includes(code)) return ['Thunderstorms', 'ϟ'];
  return ['Unavailable', '—'];
}

const number = (value, suffix = '') => Number.isFinite(value) ? `${Math.round(value)}${suffix}` : '—';
const temperature = (value) => number(Number.isFinite(value) ? (unit === 'F' ? value * 9 / 5 + 32 : value) : null, '°');
const region = (place) => [...new Set([place.admin1, place.country].filter(Boolean))].join(', ');

function save() {
  try { localStorage.setItem('pocket-weather', JSON.stringify({ unit })); }
  catch { $('status').textContent += ' Preferences could not be saved.'; }
}

function render() {
  $('unit').textContent = unit === 'F' ? '°F / °C' : '°C / °F';
  $('unit').setAttribute('aria-label', `Switch to ${unit === 'F' ? 'Celsius' : 'Fahrenheit'}`);
  if (!weather) return;
  const { current, daily } = weather;
  const [condition, symbol] = describe(current.weather_code, current.is_day === 1);
  $('location').textContent = location.name;
  $('region').textContent = region(location);
  $('temperature').textContent = temperature(current.temperature_2m);
  $('temperature').setAttribute('aria-label', `${temperature(current.temperature_2m)} ${unit === 'F' ? 'Fahrenheit' : 'Celsius'}`);
  $('symbol').textContent = symbol;
  $('condition').textContent = condition;
  $('feels').textContent = `Feels like ${temperature(current.apparent_temperature)}`;
  $('humidity').textContent = number(current.relative_humidity_2m, '%');
  $('wind').textContent = number(Number.isFinite(current.wind_speed_10m) ? current.wind_speed_10m * (unit === 'F' ? 0.621371 : 1) : null, unit === 'F' ? ' mph' : ' km/h');
  $('rain').textContent = number(daily.precipitation_probability_max[0], '%');
  $('forecast').replaceChildren(...daily.time.map((date, index) => {
    const row = document.createElement('li');
    const [description, icon] = describe(daily.weather_code[index]);
    const day = index === 0 ? 'Today' : new Date(`${date}T12:00:00`).toLocaleDateString('en', { weekday: 'short' });
    [day, icon, description, temperature(daily.temperature_2m_min[index]), temperature(daily.temperature_2m_max[index])].forEach((text, i) => {
      const span = document.createElement('span');
      span.textContent = text;
      if (i === 1) span.setAttribute('aria-hidden', 'true');
      if (i === 2) { span.className = 'forecast-condition'; span.title = description; }
      if (i === 3 || i === 4) { span.className = i === 3 ? 'low' : 'high'; span.setAttribute('aria-label', `${i === 3 ? 'Low' : 'High'} ${text}`); }
      row.append(span);
    });
    return row;
  }));
  $('weather').hidden = false;
}

async function fetchJSON(url, signal) {
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]) });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

async function loadWeather(place) {
  forecastRequest?.abort();
  const controller = new AbortController();
  forecastRequest = controller;
  $('status').textContent = `Loading weather for ${place.name}…`;
  $('refresh').disabled = true;
  const params = new URLSearchParams({
    latitude: place.latitude, longitude: place.longitude, timezone: 'auto', forecast_days: 5,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  });
  try {
    const data = await fetchJSON(`https://api.open-meteo.com/v1/forecast?${params}`, controller.signal);
    if (controller.signal.aborted) return;
    if (!data.current || !data.daily?.time?.length) throw new Error('Missing forecast');
    weather = data;
    render();
    $('status').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    save();
  } catch {
    if (controller.signal.aborted) return;
    $('status').textContent = weather
      ? `Couldn’t load ${place.name}. Previous forecast is still shown. Try again.`
      : 'Couldn’t load the weather. Check your connection and try again.';
  } finally {
    if (!controller.signal.aborted) {
      $('refresh').disabled = false;
      $('refresh').hidden = false;
      $('refresh').onclick = () => loadWeather(place);
    }
  }
}

$('unit').addEventListener('click', () => { unit = unit === 'F' ? 'C' : 'F'; render(); save(); });
try {
  const saved = JSON.parse(localStorage.getItem('pocket-weather') || '{}');
  unit = saved.unit === 'C' ? 'C' : 'F';
} catch { /* An invalid preference should not prevent opening the popup. */ }
render();
loadWeather(location);
