import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App, { THEME_STORAGE_KEY, themeToCssVars } from './App'
import { getThemeById } from './themes'

// Apply the persisted theme's CSS variables to `<html>` before the first
// paint so the page doesn't flash the default theme while React mounts.
function applyStoredThemeBeforeFirstPaint(): void {
  const storedId = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (!storedId || !getThemeById(storedId)) return
  const vars = themeToCssVars(storedId) as Record<string, string>
  for (const [name, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(name, value)
  }
}

applyStoredThemeBeforeFirstPaint()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
