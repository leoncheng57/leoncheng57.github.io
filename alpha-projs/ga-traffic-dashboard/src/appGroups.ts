export type AppGroup = {
  name: string
  color: string
  pattern: RegExp
}

// Order matters: first match wins. /previews/ must stay first because
// preview URLs embed real app paths (e.g. /previews/pr-164/sub-wait/).
export const APP_GROUPS: AppGroup[] = [
  { name: 'preview', color: '#9ca3af', pattern: /^\/previews\// },
  { name: 'sub-wait', color: '#2563eb', pattern: /^\/sub-wait/ },
  { name: 'workout-lab', color: '#16a34a', pattern: /^\/workout-lab/ },
  { name: 'blog', color: '#db2777', pattern: /^\/blog/ },
  { name: 'apps', color: '#ea580c', pattern: /^\/apps/ },
  {
    name: 'game-nights',
    color: '#7c3aed',
    pattern: /^\/(game-nights|georgies-board-game-nights)/,
  },
  { name: 'repo', color: '#0891b2', pattern: /^\/(repo|development)/ },
  { name: 'tuzi', color: '#ca8a04', pattern: /^\/tuzi/ },
  { name: 'home', color: '#111827', pattern: /^\/$/ },
]

export const OTHER_GROUP: AppGroup = {
  name: 'other',
  color: '#6b7280',
  pattern: /.*/,
}

export function groupForPath(pagePath: string): string {
  const path = pagePath.split('?')[0]
  for (const group of APP_GROUPS) {
    if (group.pattern.test(path)) return group.name
  }
  return OTHER_GROUP.name
}

export const ALL_GROUPS: AppGroup[] = [...APP_GROUPS, OTHER_GROUP]

export function colorForGroup(name: string): string {
  return ALL_GROUPS.find((group) => group.name === name)?.color ?? '#6b7280'
}
