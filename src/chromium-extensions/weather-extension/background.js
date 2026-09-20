const ALARM = 'nyc-temperature';
const MAX_AGE = 30 * 60 * 1000;
let pendingRefresh;

async function drawTemperature() {
  const { unit = 'F', toolbarWeather } = await chrome.storage.local.get(['unit', 'toolbarWeather']);
  const available = Number.isFinite(toolbarWeather?.celsius) && Date.now() - toolbarWeather.updatedAt < MAX_AGE;
  const temperature = available ? Math.round(unit === 'C' ? toolbarWeather.celsius : toolbarWeather.celsius * 9 / 5 + 32) : null;
  const label = available ? `${temperature}°` : '—';
  const imageData = {};
  for (const size of [16, 32]) {
    const canvas = new OffscreenCanvas(size, size);
    const context = canvas.getContext('2d');
    context.fillStyle = '#1e5485';
    context.fillRect(0, 0, size, size);
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `bold ${size * (label.length > 3 ? 0.56 : 0.7)}px sans-serif`;
    context.fillText(label, size / 2, size / 2 + size * 0.04, size - 1);
    imageData[size] = context.getImageData(0, 0, size, size);
  }
  await chrome.action.setIcon({ imageData });
  await chrome.action.setTitle({ title: available
    ? `NYC Weather: ${temperature}°${unit} • Updated ${new Date(toolbarWeather.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : 'NYC Weather: temperature unavailable — open to retry' });
}

async function refreshTemperature() {
  if (pendingRefresh) return pendingRefresh;
  pendingRefresh = (async () => {
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m', { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error('Weather request failed');
      const data = await response.json();
      if (!Number.isFinite(data.current?.temperature_2m)) throw new Error('Missing temperature');
      await chrome.storage.local.set({ toolbarWeather: { celsius: data.current.temperature_2m, updatedAt: Date.now() } });
    } catch {
      // Keep a recent reading; show a dash once it is too old to be useful.
    }
    await drawTemperature();
  })();
  try { await pendingRefresh; } finally { pendingRefresh = undefined; }
}

async function start() {
  if (!await chrome.alarms.get(ALARM)) await chrome.alarms.create(ALARM, { periodInMinutes: 15 });
  await drawTemperature();
  await refreshTemperature();
}

chrome.runtime.onInstalled.addListener(() => { start().catch(console.error); });
chrome.runtime.onStartup.addListener(() => { start().catch(console.error); });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM) refreshTemperature().catch(console.error);
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.unit || changes.toolbarWeather)) drawTemperature().catch(console.error);
});
// Recreate alarms if the browser discarded them between worker activations.
start().catch(console.error);
