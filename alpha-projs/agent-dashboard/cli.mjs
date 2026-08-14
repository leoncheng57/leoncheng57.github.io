#!/usr/bin/env node

// Agent dashboard: one view of every child agent working in its own worktree.
//
// Zero dependencies on purpose. The thing this reports on is a set of local
// worktrees, so it should run from a fresh clone with no install step, and it
// should keep working when cmux or gh are missing.
//
//   node cli.mjs            one-shot table
//   node cli.mjs --watch    live board, redraw every 5s
//   node cli.mjs --json     aggregated state for scripts and agents

import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const CACHE_TTL_MS = 5000
const DEFAULT_INTERVAL_SECONDS = 5
const DEFAULT_STALE_AFTER_SECONDS = 900
const STATUS_FILE = '.agent-status.json'
const CHILD_TITLE_PREFIX = 'Child:'
const SUBPROCESS_TIMEOUT_MS = 10000
const PR_LIMIT = 30

// ---------------------------------------------------------------------------
// Arguments

const USAGE = `Agent dashboard - one row per child agent.

Usage
  node cli.mjs [options]

In a terminal the live board is the default. When stdout is piped the
default is a one-shot table, so scripts get plain output.

Options
  --once               One-shot table, even in a terminal
  --watch              Live full-screen board, even when auto-detection says otherwise
  --json               Print the aggregated state as JSON and exit
  --config <path>      Config file to use instead of auto-detection
  --project <name>     Select one project from a multi-project config
  --interval <seconds> Redraw interval for the live board (default ${DEFAULT_INTERVAL_SECONDS})
  --help               Show this message

With no config file the project is inferred from the current directory.`

function parseCliArgs(argv) {
  try {
    const { values } = parseArgs({
      args: argv,
      options: {
        once: { type: 'boolean', default: false },
        watch: { type: 'boolean', default: false },
        json: { type: 'boolean', default: false },
        config: { type: 'string' },
        project: { type: 'string' },
        interval: { type: 'string' },
        help: { type: 'boolean', default: false },
      },
      strict: true,
    })

    if (values.once && values.watch) {
      fail(`--once and --watch contradict each other.\n\n${USAGE}`)
    }

    return values
  } catch (error) {
    fail(`${error.message}\n\n${USAGE}`)
  }
}

function fail(message) {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Subprocess helper with a short cache
//
// One render pass asks for the same git and gh data more than once, and --watch
// repeats the whole pass on an interval. A short TTL keeps both cheap without
// making the board lag behind reality.

const cache = new Map()

function run(command, args, options = {}) {
  const key = `${options.cwd ?? '.'}|${command} ${args.join(' ')}`
  const hit = cache.get(key)

  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.value
  }

  // A missing cwd raises ENOENT too, which would otherwise be reported as a
  // missing tool. Check it first so the note names the real problem.
  if (options.cwd && !directoryExists(options.cwd)) {
    const value = {
      ok: false,
      missing: false,
      stdout: '',
      error: `directory does not exist: ${options.cwd}`,
    }
    cache.set(key, { at: Date.now(), value })
    return value
  }

  let value
  try {
    value = {
      ok: true,
      stdout: execFileSync(command, args, {
        cwd: options.cwd,
        encoding: 'utf8',
        timeout: SUBPROCESS_TIMEOUT_MS,
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 16 * 1024 * 1024,
      }).trim(),
    }
  } catch (error) {
    value = {
      ok: false,
      // ENOENT means the tool is not installed, which is a different problem
      // from the tool refusing to answer.
      missing: error.code === 'ENOENT',
      stdout: '',
      error: String(error.stderr || error.message || error).trim(),
    }
  }

  cache.set(key, { at: Date.now(), value })
  return value
}

function runJson(command, args, options = {}) {
  const result = run(command, args, options)
  if (!result.ok) return result

  try {
    return { ok: true, data: JSON.parse(result.stdout) }
  } catch (error) {
    return { ok: false, missing: false, error: `unparseable JSON: ${error.message}` }
  }
}

// ---------------------------------------------------------------------------
// Project resolution
//
// Auto-detection reads the repository the current directory belongs to, so the
// common case needs no config at all.

function detectProject(fromDirectory) {
  // --git-common-dir resolves to the main clone even when run inside a linked
  // worktree, which is where this usually runs.
  const commonDir = run('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
    cwd: fromDirectory,
  })

  if (!commonDir.ok) return null

  const mainRoot = path.dirname(commonDir.stdout)
  const name = path.basename(mainRoot)

  const originHead = run('git', ['symbolic-ref', 'refs/remotes/origin/HEAD'], { cwd: mainRoot })
  const mainBranch = originHead.ok
    ? originHead.stdout.replace('refs/remotes/origin/', '')
    : 'main'

  const originUrl = run('git', ['remote', 'get-url', 'origin'], { cwd: mainRoot })

  return {
    name,
    root: mainRoot,
    mainBranch,
    // Canonical layout: the main clone and a sibling directory of worktrees.
    worktrees: path.join(path.dirname(mainRoot), `${name}.worktrees`, '*'),
    github: originUrl.ok ? parseGithubRemote(originUrl.stdout) : null,
    detected: true,
  }
}

/** Accepts both SSH (git@host:owner/repo.git) and HTTPS remote forms. */
function parseGithubRemote(url) {
  const match = url.match(/[/:]([^/:]+)\/([^/]+?)(?:\.git)?$/)
  return match ? { owner: match[1], repo: match[2] } : null
}

function loadConfigFile(explicitPath, scriptDirectory) {
  const candidates = explicitPath
    ? [path.resolve(explicitPath)]
    : [path.join(process.cwd(), 'agent-dashboard.config.json'),
       path.join(scriptDirectory, 'agent-dashboard.config.json')]

  for (const candidate of candidates) {
    let raw
    try {
      raw = readFileSync(candidate, 'utf8')
    } catch {
      continue
    }

    try {
      return { path: candidate, data: JSON.parse(raw) }
    } catch (error) {
      // A config that exists but cannot be read is a mistake worth stopping
      // for; silently falling back to auto-detection would hide it.
      fail(`${candidate} could not be parsed: ${error.message}`)
    }
  }

  return null
}

function resolveProject(values, scriptDirectory) {
  const file = loadConfigFile(values.config, scriptDirectory)

  if (!file) {
    if (values.project) {
      fail(`--project ${values.project} needs a config file, and none was found.`)
    }

    const detected = detectProject(process.cwd()) ?? detectProject(scriptDirectory)

    if (!detected) {
      fail(
        'Could not detect a project: the current directory is not inside a Git repository.\n' +
          'Run this from a repository, or pass --config with a config file.'
      )
    }

    return detected
  }

  const configured = Array.isArray(file.data.projects) ? file.data.projects : [file.data]
  const selected = values.project
    ? configured.find((project) => project.name === values.project)
    : configured[0]

  if (!selected) {
    const names = configured.map((project) => project.name ?? '(unnamed)').join(', ')
    fail(`No project named "${values.project}" in ${file.path}. Available: ${names}`)
  }

  // Anything the config leaves out still falls back to auto-detection.
  const base = detectProject(selected.root ?? process.cwd()) ?? {}

  return {
    name: selected.name ?? base.name ?? 'project',
    root: selected.root ? path.resolve(selected.root) : base.root,
    mainBranch: selected.mainBranch ?? base.mainBranch ?? 'main',
    worktrees: selected.worktrees
      ? path.resolve(selected.worktrees)
      : base.worktrees,
    github: selected.github ?? base.github ?? null,
    staleAfterSeconds: selected.staleAfterSeconds,
    detected: false,
    configPath: file.path,
  }
}

// ---------------------------------------------------------------------------
// Sources

/** Supports the trailing `/*` form used by the worktrees setting. */
function expandGlob(pattern) {
  if (!pattern) return []

  if (!pattern.endsWith(`${path.sep}*`) && !pattern.endsWith('/*')) {
    return directoryExists(pattern) ? [pattern] : []
  }

  const base = pattern.slice(0, -2)

  try {
    return readdirSync(base, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => path.join(base, entry.name))
      .sort()
  } catch {
    return []
  }
}

function directoryExists(candidate) {
  try {
    return statSync(candidate).isDirectory()
  } catch {
    return false
  }
}

function readStatusFile(directory, staleAfterSeconds) {
  let raw
  try {
    raw = readFileSync(path.join(directory, STATUS_FILE), 'utf8')
  } catch {
    return null
  }

  const id = path.basename(directory)

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    // Usually a half-written file caught mid-poll. Keep the row: a child that
    // vanishes from the board is a worse failure than one that shows up broken.
    return {
      id,
      worktree: directory,
      task: id,
      phase: 'invalid',
      branch: null,
      prUrl: null,
      summary: '',
      blockers: [],
      updatedAt: null,
      ageSeconds: null,
      stale: false,
      note: `unparseable ${STATUS_FILE}: ${error.message}`,
    }
  }

  const updatedAt = parsed.updated_at ?? parsed.updatedAt ?? null
  const updatedMs = updatedAt ? Date.parse(updatedAt) : Number.NaN
  const ageSeconds = Number.isNaN(updatedMs)
    ? null
    : Math.max(0, Math.round((Date.now() - updatedMs) / 1000))
  const phase = typeof parsed.phase === 'string' ? parsed.phase : 'unknown'
  // Agents reliably mislabel local time as UTC. A future timestamp cannot be
  // trusted for staleness either way, so say so instead of pretending.
  const futureMs = Number.isNaN(updatedMs) ? 0 : updatedMs - Date.now()
  const clockNote =
    futureMs > 60_000
      ? `updated_at is ${Math.round(futureMs / 60_000)}m in the future - worker clock wrong?`
      : null

  return {
    id,
    worktree: directory,
    task: parsed.task ?? id,
    phase,
    branch: parsed.branch ?? null,
    prUrl: parsed.pr_url ?? parsed.prUrl ?? null,
    summary: parsed.summary ?? parsed.notes ?? '',
    blockers: Array.isArray(parsed.blockers) ? parsed.blockers : [],
    updatedAt,
    ageSeconds,
    stale:
      ageSeconds !== null && ageSeconds > staleAfterSeconds && phase !== 'done',
    note: clockNote,
  }
}

function readCmuxWorkspaces() {
  const result = runJson('cmux', ['workspace', 'list', '--json'])

  if (!result.ok) {
    return {
      available: false,
      note: result.missing
        ? 'cmux not on PATH'
        : `cmux workspace list failed: ${firstLine(result.error)}`,
      workspaces: [],
    }
  }

  const all = Array.isArray(result.data) ? result.data : (result.data.workspaces ?? [])

  return {
    available: true,
    note: null,
    workspaces: all
      .map((workspace) => ({
        ref: workspace.ref ?? workspace.id ?? null,
        title: workspace.title ?? workspace.custom_title ?? '',
        directory: workspace.current_directory ?? null,
      }))
      .filter((workspace) => workspace.title.startsWith(CHILD_TITLE_PREFIX)),
  }
}

function readPullRequests(project) {
  // statusCheckRollup is the expensive part of this query, so the limit stays
  // small: children are always among the most recent pull requests.
  const args = [
    'pr',
    'list',
    '--state',
    'all',
    '--limit',
    String(PR_LIMIT),
    '--json',
    'number,title,state,isDraft,url,headRefName,statusCheckRollup',
  ]

  if (project.github) {
    args.push('--repo', `${project.github.owner}/${project.github.repo}`)
  }

  const result = runJson('gh', args, { cwd: project.root })

  if (!result.ok) {
    return {
      available: false,
      note: result.missing
        ? 'gh not on PATH'
        : `gh pr list failed: ${firstLine(result.error)}`,
      byBranch: new Map(),
    }
  }

  const byBranch = new Map()

  for (const pr of result.data) {
    // gh returns newest first; keep the newest per branch, preferring open ones.
    const existing = byBranch.get(pr.headRefName)
    if (existing && existing.state === 'OPEN' && pr.state !== 'OPEN') continue

    byBranch.set(pr.headRefName, {
      number: pr.number,
      state: pr.state,
      isDraft: pr.isDraft,
      url: pr.url,
      ci: rollupToCiState(pr.statusCheckRollup),
    })
  }

  return { available: true, note: null, byBranch }
}

/** Collapses a GitHub status-check rollup into one word. */
function rollupToCiState(rollup) {
  if (!Array.isArray(rollup) || rollup.length === 0) return 'none'

  const outcomes = rollup.map((check) =>
    String(check.conclusion || check.state || check.status || '').toUpperCase()
  )

  if (outcomes.some((outcome) => ['FAILURE', 'ERROR', 'TIMED_OUT', 'CANCELLED'].includes(outcome))) {
    return 'failing'
  }

  if (
    rollup.some((check) =>
      ['IN_PROGRESS', 'QUEUED', 'PENDING', 'WAITING', 'REQUESTED'].includes(
        String(check.status || check.state || '').toUpperCase()
      )
    )
  ) {
    return 'pending'
  }

  if (outcomes.every((outcome) => ['SUCCESS', 'NEUTRAL', 'SKIPPED'].includes(outcome))) {
    return 'passing'
  }

  return 'unknown'
}

function readAheadBehind(project, branch) {
  if (!branch || !project.root) return { available: false, ahead: null, behind: null }

  // Compare against the remote main when it is available, because that is what
  // the branch will actually merge into.
  const remoteMain = `origin/${project.mainBranch}`
  const base = run('git', ['rev-parse', '--verify', '--quiet', remoteMain], {
    cwd: project.root,
  }).ok
    ? remoteMain
    : project.mainBranch

  const result = run(
    'git',
    ['rev-list', '--left-right', '--count', `${base}...${branch}`],
    { cwd: project.root }
  )

  if (!result.ok) return { available: false, ahead: null, behind: null, base }

  const [behind, ahead] = result.stdout.split(/\s+/).map(Number)

  return {
    available: Number.isFinite(ahead) && Number.isFinite(behind),
    ahead: Number.isFinite(ahead) ? ahead : null,
    behind: Number.isFinite(behind) ? behind : null,
    base,
  }
}

// ---------------------------------------------------------------------------
// Aggregation

const PHASE_ORDER = [
  'invalid',
  'blocked',
  'no-report',
  'unknown',
  'assigned',
  'working',
  'verifying',
  'pushed',
  'pr-open',
  'done',
]

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function matchWorkspace(child, workspaces) {
  // Directory is the strongest signal; the title is a fallback for children
  // whose pane has moved somewhere else in the tree.
  const byDirectory = workspaces.find(
    (workspace) =>
      workspace.directory &&
      (workspace.directory === child.worktree ||
        workspace.directory.startsWith(`${child.worktree}${path.sep}`))
  )

  if (byDirectory) return byDirectory

  const wanted = [normalize(child.id), normalize(child.task)]

  return workspaces.find((workspace) => {
    const label = normalize(workspace.title.slice(CHILD_TITLE_PREFIX.length))
    return label.length > 0 && wanted.some((candidate) => candidate === label)
  })
}

function aggregate(project) {
  const staleAfterSeconds = project.staleAfterSeconds ?? DEFAULT_STALE_AFTER_SECONDS
  const notes = []

  const cmux = readCmuxWorkspaces()
  const pullRequests = readPullRequests(project)

  if (cmux.note) notes.push(cmux.note)
  if (pullRequests.note) notes.push(pullRequests.note)

  const directories = expandGlob(project.worktrees)

  if (directories.length === 0) {
    notes.push(`no worktrees found at ${project.worktrees}`)
  }

  const children = []
  const claimedWorkspaces = new Set()

  for (const directory of directories) {
    const child = readStatusFile(directory, staleAfterSeconds)
    if (!child) continue

    const workspace = matchWorkspace(child, cmux.workspaces)
    if (workspace) claimedWorkspaces.add(workspace.ref)

    const pr = child.branch ? pullRequests.byBranch.get(child.branch) : undefined

    children.push({
      ...child,
      git: readAheadBehind(project, child.branch),
      ci: { state: pr?.ci ?? 'none', available: pullRequests.available },
      pr: pr
        ? { number: pr.number, state: pr.state, isDraft: pr.isDraft, url: pr.url }
        : null,
      cmux: workspace ? { ref: workspace.ref, title: workspace.title } : null,
    })
  }

  // A Child: workspace with no status file is its own failure mode: the child
  // was created but never reported, so it must not be invisible here.
  for (const workspace of cmux.workspaces) {
    if (claimedWorkspaces.has(workspace.ref)) continue

    children.push({
      id: workspace.title.slice(CHILD_TITLE_PREFIX.length).trim() || workspace.ref,
      worktree: workspace.directory,
      task: workspace.title.slice(CHILD_TITLE_PREFIX.length).trim(),
      phase: 'no-report',
      branch: null,
      prUrl: null,
      summary: '',
      blockers: [],
      updatedAt: null,
      ageSeconds: null,
      stale: false,
      note: `no ${STATUS_FILE} found for this workspace`,
      git: { available: false, ahead: null, behind: null },
      ci: { state: 'none', available: pullRequests.available },
      pr: null,
      cmux: { ref: workspace.ref, title: workspace.title },
    })
  }

  children.sort((left, right) => {
    if (left.stale !== right.stale) return left.stale ? -1 : 1

    const leftRank = PHASE_ORDER.indexOf(left.phase)
    const rightRank = PHASE_ORDER.indexOf(right.phase)
    const rankDelta =
      (leftRank === -1 ? PHASE_ORDER.length : leftRank) -
      (rightRank === -1 ? PHASE_ORDER.length : rightRank)

    return rankDelta || String(left.id).localeCompare(String(right.id))
  })

  return {
    generatedAt: new Date().toISOString(),
    project: {
      name: project.name,
      root: project.root,
      mainBranch: project.mainBranch,
      worktrees: project.worktrees,
      github: project.github,
      source: project.detected ? 'auto-detected' : project.configPath,
    },
    staleAfterSeconds,
    counts: {
      total: children.length,
      blocked: children.filter((child) => child.phase === 'blocked').length,
      stale: children.filter((child) => child.stale).length,
      done: children.filter((child) => child.phase === 'done').length,
    },
    sources: {
      cmux: { available: cmux.available },
      gh: { available: pullRequests.available },
    },
    notes,
    children,
  }
}

// ---------------------------------------------------------------------------
// Rendering

const useColor = process.stdout.isTTY && !process.env.NO_COLOR

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function paint(text, ...codes) {
  if (!useColor || codes.length === 0) return text
  return `${codes.join('')}${text}${C.reset}`
}

const PHASE_COLORS = {
  invalid: [C.bold, C.red],
  blocked: [C.bold, C.red],
  'no-report': [C.bold, C.yellow],
  unknown: [C.yellow],
  assigned: [C.gray],
  working: [C.cyan],
  verifying: [C.yellow],
  pushed: [C.magenta],
  'pr-open': [C.blue],
  done: [C.green],
}

const CI_LABELS = {
  passing: ['pass', [C.green]],
  failing: ['fail', [C.bold, C.red]],
  pending: ['run', [C.yellow]],
  unknown: ['?', [C.gray]],
  none: ['-', [C.gray]],
}

const ANSI_PATTERN = /\x1b\[[0-9;]*m/g

function visibleWidth(text) {
  return text.replace(ANSI_PATTERN, '').length
}

function padVisible(text, width) {
  return text + ' '.repeat(Math.max(0, width - visibleWidth(text)))
}

function truncate(text, width) {
  const plain = String(text ?? '')
  if (plain.length <= width) return plain
  return width <= 1 ? plain.slice(0, width) : `${plain.slice(0, width - 1)}…`
}

function formatAge(child) {
  if (child.ageSeconds === null) return paint('-', C.gray)

  const seconds = child.ageSeconds
  const label =
    seconds < 60
      ? `${seconds}s`
      : seconds < 3600
        ? `${Math.floor(seconds / 60)}m`
        : seconds < 86400
          ? `${Math.floor(seconds / 3600)}h`
          : `${Math.floor(seconds / 86400)}d`

  return child.stale ? paint(label, C.bold, C.red) : label
}

function formatBranch(child, width) {
  if (!child.branch) return paint('-', C.gray)

  const counts = []
  if (child.git.available) {
    if (child.git.ahead) counts.push(paint(`+${child.git.ahead}`, C.green))
    if (child.git.behind) counts.push(paint(`-${child.git.behind}`, C.yellow))
  }

  const suffix = counts.length > 0 ? ` ${counts.join('/')}` : ''
  const room = width - visibleWidth(suffix)

  return `${truncate(child.branch, Math.max(3, room))}${suffix}`
}

function formatPr(child) {
  if (!child.pr) return paint('-', C.gray)

  const label = `#${child.pr.number}`

  if (child.pr.state === 'MERGED') return paint(label, C.magenta)
  if (child.pr.state === 'CLOSED') return paint(label, C.gray)
  return child.pr.isDraft ? paint(label, C.dim) : paint(label, C.bold, C.blue)
}

/** Returns plain text plus its colour, so the caller can truncate safely. */
function formatNotes(child) {
  if (child.blockers.length > 0) {
    return { text: child.blockers.join('; '), codes: [C.red] }
  }
  if (child.note) return { text: child.note, codes: [C.yellow] }
  return { text: child.summary ?? '', codes: [C.gray] }
}

function renderTable(state, terminalWidth) {
  const rows = state.children.map((child) => ({
    child: truncate(child.task || child.id, 26),
    phase: paint(child.phase, ...(PHASE_COLORS[child.phase] ?? [C.gray])),
    age: formatAge(child),
    branch: child,
    ci: (() => {
      const [label, codes] = CI_LABELS[child.ci.state] ?? CI_LABELS.none
      return paint(child.ci.available ? label : '-', ...codes)
    })(),
    pr: formatPr(child),
    workspace: child.cmux ? child.cmux.ref : paint('-', C.gray),
    notes: formatNotes(child),
  }))

  const headers = ['CHILD', 'PHASE', 'AGE', 'BRANCH', 'CI', 'PR', 'WORKSPACE']
  const widths = [
    Math.max(5, ...rows.map((row) => visibleWidth(row.child))),
    Math.max(5, ...rows.map((row) => visibleWidth(row.phase))),
    Math.max(3, ...rows.map((row) => visibleWidth(row.age))),
    0,
    Math.max(2, ...rows.map((row) => visibleWidth(row.ci))),
    Math.max(2, ...rows.map((row) => visibleWidth(row.pr))),
    Math.max(9, ...rows.map((row) => visibleWidth(row.workspace))),
  ]

  const fixed = widths.reduce((total, width) => total + width, 0) + headers.length * 2
  // Branch takes what is left, and notes get whatever survives after that.
  const branchWidth = Math.max(12, Math.min(34, terminalWidth - fixed - 20))
  widths[3] = branchWidth

  const prefixes = rows.map((row) =>
    [
      row.child,
      row.phase,
      row.age,
      formatBranch(row.branch, branchWidth),
      row.ci,
      row.pr,
      row.workspace,
    ]
      .map((cell, index) => padVisible(cell, widths[index]))
      .join('  ')
  )

  const headerPrefix = headers
    .map((header, index) => padVisible(header, widths[index]))
    .join('  ')

  // Notes only get a column when there is real room for them, so a narrow
  // terminal drops the column instead of wrapping the table.
  const prefixWidth = Math.max(
    visibleWidth(headerPrefix),
    ...prefixes.map((prefix) => visibleWidth(prefix))
  )
  const notesWidth = terminalWidth - prefixWidth - 2
  const showNotes = notesWidth >= 12

  const lines = [
    paint(showNotes ? `${headerPrefix}  NOTES` : headerPrefix, C.bold, C.gray),
  ]

  rows.forEach((row, index) => {
    const prefix = prefixes[index]

    if (!showNotes || row.notes.text.length === 0) {
      lines.push(prefix)
      return
    }

    lines.push(
      `${prefix}  ${paint(truncate(row.notes.text, notesWidth), ...row.notes.codes)}`
    )
  })

  return lines
}

function renderHeader(state) {
  const { counts } = state
  const summary = [
    `${counts.total} ${counts.total === 1 ? 'child' : 'children'}`,
    counts.blocked > 0
      ? paint(`${counts.blocked} blocked`, C.bold, C.red)
      : `${counts.blocked} blocked`,
    counts.stale > 0
      ? paint(`${counts.stale} stale`, C.bold, C.red)
      : `${counts.stale} stale`,
    `${counts.done} done`,
  ].join('  ')

  return [
    `${paint(state.project.name, C.bold)}  ${paint(`base ${state.project.mainBranch}`, C.gray)}`,
    `${summary}  ${paint(new Date(state.generatedAt).toLocaleTimeString(), C.gray)}`,
  ]
}

function renderFrame(state, terminalWidth) {
  const lines = [...renderHeader(state), '']

  if (state.children.length === 0) {
    lines.push(
      paint(
        `No children reporting yet. Children write ${STATUS_FILE} at the root of their worktree.`,
        C.gray
      )
    )
  } else {
    lines.push(...renderTable(state, terminalWidth))
  }

  // Degraded sources are worth one quiet line, not a missing column with no
  // explanation.
  for (const note of state.notes) {
    lines.push(paint(`note: ${note}`, C.yellow))
  }

  return lines
}

function firstLine(text) {
  return String(text ?? '').split('\n')[0].trim()
}

// ---------------------------------------------------------------------------
// Watch mode

function watch(project, intervalSeconds) {
  const out = process.stdout
  let active = false

  const enter = () => {
    if (active) return
    active = true
    out.write('\x1b[?1049h\x1b[?25l')
  }

  const restore = () => {
    if (!active) return
    active = false
    out.write('\x1b[?25h\x1b[?1049l')
  }

  const draw = () => {
    const state = aggregate(project)
    const width = out.columns || 120
    const height = out.rows || 40
    const lines = renderFrame(state, width)
    lines.push('', paint(`refreshing every ${intervalSeconds}s - ctrl-c to exit`, C.gray))

    // One write per frame, and the clear is part of it, so the board does not
    // flicker between erase and redraw.
    out.write(`\x1b[H\x1b[2J${lines.slice(0, height - 1).join('\n')}\n`)
  }

  enter()
  draw()

  const timer = setInterval(draw, Math.max(1, intervalSeconds) * 1000)
  const stop = (code) => {
    clearInterval(timer)
    restore()
    process.exit(code)
  }

  process.on('SIGINT', () => stop(130))
  process.on('SIGTERM', () => stop(143))
  process.on('exit', restore)
  process.on('uncaughtException', (error) => {
    restore()
    process.stderr.write(`${error.stack ?? error}\n`)
    process.exit(1)
  })
}

// ---------------------------------------------------------------------------
// Entry point

function main() {
  const values = parseCliArgs(process.argv.slice(2))

  if (values.help) {
    process.stdout.write(`${USAGE}\n`)
    return
  }

  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
  const project = resolveProject(values, scriptDirectory)

  if (values.json) {
    process.stdout.write(`${JSON.stringify(aggregate(project), null, 2)}\n`)
    return
  }

  // The live board is the default where it makes sense: an interactive
  // terminal. Piped output gets the one-shot table, because an alternate
  // screen buffer is meaningless in a file or a pager.
  const live = values.watch || (process.stdout.isTTY && !values.once)

  if (live) {
    const interval = values.interval ? Number(values.interval) : DEFAULT_INTERVAL_SECONDS

    if (!Number.isFinite(interval) || interval <= 0) {
      fail(`--interval must be a positive number of seconds, got "${values.interval}"`)
    }

    watch(project, interval)
    return
  }

  const state = aggregate(project)
  process.stdout.write(`${renderFrame(state, process.stdout.columns || 120).join('\n')}\n`)
}

main()
