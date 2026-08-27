/**
 * Keeps root-relative public assets under Vite's base path, including PR previews.
 * Other URL forms are left to the browser or their protocol handler.
 */
export function publicAssetUrl(url: string, baseUrl = import.meta.env.BASE_URL): string {
  if (!url.startsWith('/') || url.startsWith('//')) {
    return url
  }

  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  if (base === '/' || url === base.slice(0, -1) || url.startsWith(base)) {
    return url
  }

  return `${base}${url.slice(1)}`
}
