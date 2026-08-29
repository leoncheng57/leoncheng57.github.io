/**
 * Builds a URL for a public asset under Vite's configured base path. PR
 * previews live below /previews/pr-N/, so root-absolute URLs would silently
 * load the production asset instead of the branch's version.
 */
export function assetUrl(path: string, baseUrl = import.meta.env.BASE_URL): string {
  return `${baseUrl}${path.replace(/^\//, '')}`
}
