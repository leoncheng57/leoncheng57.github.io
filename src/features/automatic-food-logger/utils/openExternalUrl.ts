// Isolated so tests can mock it: jsdom cannot navigate to a shortcuts:// URL.
export function openExternalUrl(url: string): void {
  window.location.assign(url)
}
