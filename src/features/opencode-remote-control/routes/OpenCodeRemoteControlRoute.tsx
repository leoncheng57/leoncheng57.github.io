import { useEffect, useState, type ReactElement } from 'react'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import CommandBlock from '../components/CommandBlock'
import ProductNav from '../components/ProductNav'
import { PICKER_ISSUE_URL, REPOSITORY_URL } from '../constants'
import styles from '../opencode-remote-control.module.css'

const NAV_ITEMS = [
  { id: 'architecture', index: '01', label: 'Architecture' },
  { id: 'builder', index: '02', label: 'Setup' },
  { id: 'commands', index: '03', label: 'Commands' },
  { id: 'phone', index: '04', label: 'Phone' },
  { id: 'notifications', index: '05', label: 'Notifications' },
  { id: 'day-in-the-life', index: '06', label: 'Day' },
  { id: 'security', index: '07', label: 'Security' },
  { id: 'troubleshooting', index: '08', label: 'Help' },
]

const SECTION_IDS = NAV_ITEMS.map((item) => item.id)

/**
 * Scroll spy for the sticky nav: the active section is the last one whose top
 * has passed under the nav. jsdom reports zero-size rects, so the hook stays
 * inert (null) in tests.
 */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    function update(): void {
      let current: string | null = null
      let sawMeasurableSection = false
      for (const id of ids) {
        const element = document.getElementById(id)
        if (!element) continue
        const rect = element.getBoundingClientRect()
        if (rect.height === 0) continue
        sawMeasurableSection = true
        if (rect.top <= 96) current = id
      }
      if (sawMeasurableSection) setActive(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ids])

  return active
}

const ASCII_ARCHITECTURE = [
  '┌──────────┐   Tailscale (WireGuard)    ┌──────────────────────┐',
  '│  phone   │ ─────────────────────────▶ │  Mac: opencode web   │',
  '│ browser  │   http://100.x.y.z:4096    │  (tailnet-only bind) │',
  '└──────────┘                            └──────────┬───────────┘',
  '     ▲                                             │ session idle /',
  '     │  push notification (tap to open session)    │ needs approval /',
  '     │                                             │ question',
  '┌────┴─────┐                            ┌──────────▼───────────┐',
  '│ ntfy app │ ◀───────────────────────── │  ntfy-notify plugin  │',
  '└──────────┘      https://ntfy.sh       └──────────────────────┘',
].join('\n')

const DAILY_COMMANDS = [
  'oc-remote --help    # every command',
  'oc-remote web       # serve the default project root',
].join('\n')

const ROTATE_TOPIC_COMMAND = [
  'rm ~/.config/opencode/ntfy-topic',
  './install.sh',
].join('\n')

const STORAGE_KEY = 'opencode-remote-control-settings-v1'

type Settings = {
  projectRoot: string
  port: string
  ntfyServer: string
  pickerWorkaround: boolean
}

const defaults: Settings = {
  projectRoot: '~/Documents/Projects',
  port: '4096',
  ntfyServer: 'https://ntfy.sh',
  pickerWorkaround: true,
}

function loadSettings(): Settings {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults
  } catch {
    return defaults
  }
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`
}

export default function OpenCodeRemoteControlRoute(): ReactElement {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const activeSection = useActiveSection(SECTION_IDS)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'OpenCode Remote Control'
    return () => {
      document.title = previousTitle
    }
  }, [])

  useEffect(() => {
    // The global site background is light; paint the document itself dark so
    // overscroll and short viewports never reveal it around the page.
    const root = document.documentElement
    const previousRootBackground = root.style.backgroundColor
    const previousBodyBackground = document.body.style.backgroundColor
    root.style.backgroundColor = '#050505'
    document.body.style.backgroundColor = '#050505'
    return () => {
      root.style.backgroundColor = previousRootBackground
      document.body.style.backgroundColor = previousBodyBackground
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // The app remains usable when storage is disabled.
    }
  }, [settings])

  const config = [
    `PORT=${settings.port || defaults.port}`,
    `SERVE_DIR=${shellQuote(settings.projectRoot || defaults.projectRoot)}`,
    `PROJECT_HOME_OVERRIDE=${settings.pickerWorkaround ? '1' : '0'}`,
    `NTFY_SERVER=${shellQuote(settings.ntfyServer || defaults.ntfyServer)}`,
  ].join('\n')
  const install = [
    `git clone ${REPOSITORY_URL}.git`,
    'cd opencode-remote-control-and-notifications',
    './install.sh',
  ].join('\n')
  const launch = `oc-remote web ${shellQuote(
    settings.projectRoot || defaults.projectRoot
  )}`

  function update<K extends keyof Settings>(key: K, value: Settings[K]): void {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className={styles.page}>
      <ProductNav>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={activeSection === item.id ? 'true' : undefined}
          >
            <span className={styles.navIndex}>{item.index}</span>
            {item.label}
          </a>
        ))}
        <a className={styles.navExternal} href={REPOSITORY_URL}>
          GitHub ↗
        </a>
      </ProductNav>
      <main className={styles.main} id="top">

        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>
              LOCAL MACHINE ↔ REMOTE PHONE CONTROL
              <span className={styles.betaBadge}>BETA</span>
            </p>
            <h1>OpenCode, from anywhere and anytime.</h1>
            <p className={styles.lede}>
              Get notifications on your phone, and control all the power of AI,
              MCPs, Docker, and everything else that lives on your laptop.
            </p>
            <p className={styles.repoNote}>
              All of it runs on{' '}
              <a href={REPOSITORY_URL}>
                opencode-remote-control-and-notifications ↗
              </a>
              , a simple public repo I created — one launch script plus one
              ntfy notification plugin.
            </p>
          </div>
        </header>

        <pre className={styles.asciiDiagram} aria-label="Architecture overview">
          {ASCII_ARCHITECTURE}
        </pre>

        <section className={styles.architecture} id="architecture">
          <div className={styles.architectureIntro}>
            <p className={styles.eyebrow}>01 / SYSTEM ARCHITECTURE</p>
            <h2>Two private loops. One local agent.</h2>
            <p>
              Commands travel directly to your workstation over WireGuard.
              Agent events travel outward as small ntfy messages. The repository,
              shell, credentials, and full transcript never move to the phone.
            </p>
          </div>

          <div className={styles.diagramGrid}>
            <article className={styles.diagram}>
              <div className={styles.diagramHeader}>
                <span>CONTROL PLANE</span>
                <small>interactive / private</small>
              </div>
              <div className={styles.diagramFlow}>
                <div className={styles.node}>
                  <strong>Phone browser</strong>
                  <span>OpenCode Web UI</span>
                </div>
                <div className={styles.connection}>
                  <b>→</b>
                  <span>WireGuard</span>
                </div>
                <div className={`${styles.node} ${styles.nodeAccent}`}>
                  <strong>Tailscale IP</strong>
                  <span>100.x.y.z:4096</span>
                </div>
                <div className={styles.connection}>
                  <b>→</b>
                  <span>HTTP</span>
                </div>
                <div className={styles.node}>
                  <strong>Host Mac</strong>
                  <span>opencode web + repo</span>
                </div>
              </div>
              <p className={styles.diagramNote}>
                No Funnel, port forwarding, or LAN bind. The launcher exits if it
                cannot resolve a Tailscale address.
              </p>
            </article>

            <p className={styles.planeBridge}>
              That is the inbound loop you drive. A second, outbound-only loop
              lets the agent report back without exposing anything else:
            </p>

            <article className={styles.diagram}>
              <div className={styles.diagramHeader}>
                <span>NOTIFICATION PLANE</span>
                <small>event-driven / outbound</small>
              </div>
              <div className={styles.diagramFlow}>
                <div className={styles.node}>
                  <strong>Event bus</strong>
                  <span>idle · permission · question</span>
                </div>
                <div className={styles.connection}>
                  <b>→</b>
                  <span>plugin</span>
                </div>
                <div className={`${styles.node} ${styles.nodeAccent}`}>
                  <strong>ntfy server</strong>
                  <span>small push payload</span>
                </div>
                <div className={styles.connection}>
                  <b>→</b>
                  <span>push</span>
                </div>
                <div className={styles.node}>
                  <strong>Exact session</strong>
                  <span>tap deep link to respond</span>
                </div>
              </div>
              <p className={styles.diagramNote}>
                Only the notification title, response snippet, and session link
                leave the host. Point the plugin at a self-hosted ntfy server if
                that metadata must remain inside the tailnet.
              </p>
            </article>
          </div>

          <ol className={styles.sequence}>
            <li>
              <span>01</span>
              <p>
                <strong>Launch.</strong> <code>oc-remote web</code> resolves the
                tailnet IP and binds only there.
              </p>
            </li>
            <li>
              <span>02</span>
              <p>
                <strong>Control.</strong> The phone loads the official Web UI
                through the encrypted tailnet.
              </p>
            </li>
            <li>
              <span>03</span>
              <p>
                <strong>Observe.</strong> The plugin tracks every project
                instance and useful session event.
              </p>
            </li>
            <li>
              <span>04</span>
              <p>
                <strong>Return.</strong> Tapping a push opens the exact session
                that needs attention.
              </p>
            </li>
          </ol>
        </section>

        <section className={styles.builderSection} id="builder">
          <div className={styles.sectionKicker}>02 / INTERACTIVE BUILDER</div>
          <h2 className={styles.builderTitle}>How to Setup</h2>
          <div className={styles.workspace}>
            <section className={styles.controls}>
              <div className={styles.sectionHeading}>
                <span>01</span>
                <div>
                  <h2>Shape your setup</h2>
                  <p>Changes are saved only in this browser.</p>
                </div>
              </div>

              <label>
                <span>Project root</span>
                <input
                  value={settings.projectRoot}
                  onChange={(event) => update('projectRoot', event.target.value)}
                  spellCheck={false}
                />
              </label>

              <div className={styles.controlRow}>
                <label>
                  <span>Web port</span>
                  <input
                    inputMode="numeric"
                    value={settings.port}
                    onChange={(event) =>
                      update('port', event.target.value.replace(/\D/g, ''))
                    }
                  />
                </label>
                <label>
                  <span>ntfy server</span>
                  <input
                    type="url"
                    value={settings.ntfyServer}
                    onChange={(event) => update('ntfyServer', event.target.value)}
                    spellCheck={false}
                  />
                </label>
              </div>

              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.pickerWorkaround}
                  onChange={(event) =>
                    update('pickerWorkaround', event.target.checked)
                  }
                />
                <span>
                  <strong>Re-root the project picker</strong>
                  Work around OpenCode issue #41155 until the upstream fix ships.
                </span>
              </label>

              <button
                className={styles.reset}
                type="button"
                onClick={() => setSettings(defaults)}
              >
                Reset defaults
              </button>
            </section>

            <section className={styles.output} aria-live="polite">
              <div className={styles.sectionHeading}>
                <span>02</span>
                <div>
                  <h2>Run the plan</h2>
                  <p>Three local steps. No public tunnel.</p>
                </div>
              </div>
              <CommandBlock label="INSTALL" command={install} />
              <CommandBlock label="CONFIG.ENV" command={config} />
              <CommandBlock label="LAUNCH" command={launch} />
            </section>
          </div>
        </section>

        <hr className={styles.sectionDivider} />

        <section className={styles.contentSection} id="commands">
          <div className={styles.sectionKicker}>03 / DAILY COMMANDS</div>
          <h2>Start the server, then get out of the terminal.</h2>
          <CommandBlock label="SERVE" command={DAILY_COMMANDS} />
          <div className={styles.guideBody}>
            <p>
              Keep <code>oc-remote web</code> running in a terminal or tmux
              session, and keep the Mac awake. The process must stay up for
              remote access to work.
            </p>
          </div>
        </section>

        <hr className={styles.sectionDivider} />

        <section className={styles.contentSection} id="phone">
          <div className={styles.sectionKicker}>04 / PHONE ONBOARDING</div>
          <div className={styles.contentGrid}>
            <div>
              <h2>Subscribe, then scan.</h2>
              <p>
                Run <code>oc-remote topic --qr</code> to subscribe the ntfy app,
                then scan the QR printed by <code>oc-remote web</code> to open the
                control surface over your tailnet.
              </p>
              <p className={styles.guideCallout}>
                Want to change what lands on your lock screen?{' '}
                <a href="#notifications">Customize the notifications →</a>
              </p>
            </div>
            <ol className={styles.checklist}>
              <li><span>1</span> Connect the phone to the same Tailscale tailnet.</li>
              <li><span>2</span> Subscribe to the generated private ntfy topic.</li>
              <li><span>3</span> Scan the Web UI QR and bookmark the project.</li>
            </ol>
          </div>
        </section>

        <hr className={styles.sectionDivider} />

        <section className={styles.contentSection} id="notifications">
          <div className={styles.sectionKicker}>05 / CUSTOMIZE NOTIFICATIONS</div>
          <h2>Shape what reaches your lock screen.</h2>
          <div className={styles.guideBody}>
            <p>
              The plugin at <code>plugins/ntfy-notify.js</code> publishes to
              your private topic on three triggers. Bodies are sent as Markdown,
              which the ntfy web app renders and phones show as plain text.
            </p>
            <table className={styles.referenceTable}>
              <thead>
                <tr>
                  <th>Trigger</th>
                  <th>Priority</th>
                  <th>What arrives</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Session idle, meaning the turn finished</td>
                  <td>
                    <code>default</code>
                  </td>
                  <td>
                    ✅ <strong>Finished</strong> plus the session title, a
                    snippet of the final message, then{' '}
                    <code>project · worked &lt;duration&gt;</code>.
                  </td>
                </tr>
                <tr>
                  <td>Permission requested</td>
                  <td>
                    <code>high</code>
                  </td>
                  <td>
                    🔐 <strong>Approval needed</strong> with the command in a
                    code block, then the project name.
                  </td>
                </tr>
                <tr>
                  <td>Question asked</td>
                  <td>
                    <code>high</code>
                  </td>
                  <td>
                    ❓ <strong>Input needed</strong> with the question text and
                    any options as a bullet list, then the project name.
                  </td>
                </tr>
              </tbody>
            </table>

            <h3>What tapping a notification does</h3>
            <p>
              Every clickable push carries an ntfy <code>Click</code> action
              that opens the exact session in the web UI, plus a 👆 tag and
              inline action buttons. The session button is labelled{' '}
              <strong>Open session</strong>, <strong>Review request</strong>, or{' '}
              <strong>Answer in OpenCode</strong> depending on the trigger. When
              the project has a Git <code>origin</code> remote, an{' '}
              <strong>Open repo</strong> button is added as well, with SSH
              remotes converted to HTTPS.
            </p>
            <h3>Runtime knobs</h3>
            <table className={styles.referenceTable}>
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>OPENCODE_NTFY_TOPIC</code>
                  </td>
                  <td>
                    Publish to a different topic than the generated topic file.
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>OPENCODE_NTFY_SERVER</code>
                  </td>
                  <td>Publish to a self-hosted ntfy instance.</td>
                </tr>
                <tr>
                  <td>
                    <code>OPENCODE_NTFY_DISABLED=1</code>
                  </td>
                  <td>Kill switch that silences notifications entirely.</td>
                </tr>
              </tbody>
            </table>

            <h3>Editing the message text</h3>
            <p>
              Titles, emoji, priorities, snippet length, and action button
              labels all live in <code>plugins/ntfy-notify.js</code>. Edit that
              file and restart the server to see changes.
            </p>
            <p className={styles.securityNote}>
              One trap when editing the plugin:{' '}
              <code>opencode web</code> creates a separate plugin instance for
              every project directory, each with its own event bus. Adding a
              process-wide install-once guard looks like a sensible
              de-duplication fix, but it silently disables notifications for
              every project except the first. Shared state such as debounce
              timers and message tracking belongs on <code>globalThis</code>{' '}
              instead.
            </p>

            <h3>Rotating the topic</h3>
            <p>
              The topic name is generated with a random suffix, stored with
              owner-only permissions, and kept out of source control. Anyone who
              learns it can read your session titles and message snippets, and
              can send you convincing fakes. Rotate it by deleting the topic
              file and re-running the installer, then re-subscribing on the
              phone.
            </p>
          </div>
          <CommandBlock label="ROTATE TOPIC" command={ROTATE_TOPIC_COMMAND} />
          <div className={styles.guideBody}>
            <p>
              Notification bodies can quote fragments of agent output. If that
              is more than you want leaving the machine, point{' '}
              <code>NTFY_SERVER</code> at an ntfy instance running inside your
              tailnet.
            </p>
          </div>
        </section>

        <hr className={styles.sectionDivider} />

        <section className={styles.daySection} id="day-in-the-life">
          <div className={styles.sectionKicker}>06 / A DAY IN THE LIFE</div>
          <div className={styles.dayHeader}>
            <h2>Your laptop keeps the power. Your day gets the freedom.</h2>
          </div>

          <ol className={styles.timeline}>
            <li>
              <time>08:45</time>
              <div>
                <strong>Launch a real task.</strong>
                <p>Use the repo, Docker services, MCP tools, credentials, and local environment already on your laptop.</p>
              </div>
            </li>
            <li>
              <time>08:47</time>
              <div>
                <strong>Walk away.</strong>
                <p>Get coffee, commute, cook, or join a meeting while the agent keeps working in the same session.</p>
              </div>
            </li>
            <li>
              <time>09:02</time>
              <div>
                <strong>Answer from the notification.</strong>
                <p>Tap an ntfy question or approval and land directly in the exact OpenCode session on your phone.</p>
              </div>
            </li>
            <li>
              <time>09:18</time>
              <div>
                <strong>Review the result anywhere.</strong>
                <p>Read the final response and turn duration, then queue the next instruction without rebuilding context.</p>
              </div>
            </li>
          </ol>

          <div className={styles.benefitGrid}>
            <article>
              <span>FULL LOCAL POWER</span>
              <p>Private repositories, running containers, local databases, browser sessions, and MCP integrations stay available.</p>
            </article>
            <article>
              <span>ATTENTION ON DEMAND</span>
              <p>Rich pushes replace polling. You return for decisions and results, not progress bars.</p>
            </article>
            <article>
              <span>ZERO CONTEXT REBUILD</span>
              <p>The phone controls the same session on the same host, so tools, state, and conversation remain intact.</p>
            </article>
          </div>
        </section>

        <hr className={styles.sectionDivider} />

        <section className={styles.contentSection} id="security">
          <div className={styles.sectionKicker}>07 / SECURITY BOUNDARY</div>
          <div className={styles.contentGrid}>
            <div>
              <h2>Your tailnet is the lock.</h2>
              <p>
                The launcher binds only to the Tailscale IP and refuses to start
                without one. There is no public tunnel or LAN listener.
              </p>
            </div>
            <p className={styles.securityNote}>
              The ntfy topic is a password. Keep it out of logs, screenshots,
              and source control; self-host ntfy inside the tailnet when even
              notification metadata must remain private.
            </p>
          </div>
        </section>

        <hr className={styles.sectionDivider} />

        <section className={styles.contentSection} id="troubleshooting">
          <div className={styles.sectionKicker}>08 / TROUBLESHOOTING</div>
          <h2>Four failures worth recognising.</h2>
          <div className={styles.guideBody}>
            <table className={styles.referenceTable}>
              <thead>
                <tr>
                  <th>Symptom</th>
                  <th>What to do</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>No notifications at all</td>
                  <td>
                    Run <code>oc-remote notify-test</code> first. If the test
                    push arrives, restart <code>oc-remote web</code>, because
                    plugins load at server start, and confirm the topic file
                    exists.
                  </td>
                </tr>
                <tr>
                  <td>The phone cannot reach the URL</td>
                  <td>
                    Check that Tailscale is connected on the phone, run{' '}
                    <code>tailscale status</code> on the Mac, and confirm both
                    devices are in the same tailnet.
                  </td>
                </tr>
                <tr>
                  <td>The folder picker is empty</td>
                  <td>
                    Confirm <code>PROJECT_HOME_OVERRIDE=1</code> in{' '}
                    <code>config.env</code> and that you started the server via{' '}
                    <code>oc-remote web</code>. The picker is hard-rooted at{' '}
                    <code>$HOME</code> upstream; track progress on{' '}
                    <a href={PICKER_ISSUE_URL}>the picker issue ↗</a>.
                  </td>
                </tr>
                <tr>
                  <td>An idle push has no message snippet</td>
                  <td>
                    Expected when a turn ends with only tool calls and no text
                    output. The body falls back to the session title.
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              <strong>The homepage looks empty in a fresh browser.</strong> The
              project and session rail is per-browser state, so nothing appears
              until you add a project or open a deep link. Bookmark a project
              link from <code>oc-remote link</code> to skip the empty state.
            </p>
            <p className={styles.securityNote}>
              Never widen the bind. The web server has no password, which is
              safe only because it binds exclusively to the Tailscale interface
              and refuses to start when Tailscale is down. Do not re-bind it to{' '}
              <code>0.0.0.0</code> without setting{' '}
              <code>OPENCODE_SERVER_PASSWORD</code>.
            </p>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
