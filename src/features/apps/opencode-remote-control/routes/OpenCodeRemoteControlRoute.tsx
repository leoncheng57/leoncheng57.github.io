import { useEffect, useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import styles from '../opencode-remote-control.module.css'

const STORAGE_KEY = 'opencode-remote-control-settings-v1'
const REPOSITORY_URL =
  'https://github.com/leoncheng57/opencode-remote-control-and-notifications'

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

function CommandBlock({
  label,
  command,
}: {
  label: string
  command: string
}): ReactElement {
  const [copied, setCopied] = useState(false)

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className={styles.commandBlock}>
      <div className={styles.commandHeader}>
        <span>{label}</span>
        <button type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{command}</code>
      </pre>
    </section>
  )
}

export default function OpenCodeRemoteControlRoute(): ReactElement {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'OpenCode Remote Control'
    return () => {
      document.title = previousTitle
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
      <header className={styles.productNav}>
        <a className={styles.brand} href="#top" aria-label="OpenCode Remote Control home">
          <span className={styles.brandMark} aria-hidden="true">
            &gt;_
          </span>
          <span>OC REMOTE</span>
        </a>
        <nav className={styles.navLinks} aria-label="OpenCode Remote Control navigation">
          <a href="#builder">Setup</a>
          <a href="#phone">Phone</a>
          <a href={REPOSITORY_URL}>Source ↗</a>
          <Link to="/apps">LeonCheng.dev ↗</Link>
        </nav>
      </header>
      <main className={styles.main} id="top">

        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>LOCAL AGENT / REMOTE CONTROL</p>
            <h1>OpenCode, from anywhere.</h1>
            <p className={styles.lede}>
              Build a private phone-control setup for local OpenCode sessions.
              Tailscale carries the interface. ntfy tells you when to look.
            </p>
          </div>
          <div className={styles.signal} aria-label="System status">
            <span className={styles.signalDot} />
            TAILNET ONLY
          </div>
        </header>

        <section className={styles.flow} aria-label="Architecture">
          <span>PHONE</span>
          <b>→</b>
          <span>TAILSCALE</span>
          <b>→</b>
          <span>OPENCODE WEB</span>
          <b>→</b>
          <span>NTFY</span>
        </section>

        <section className={styles.architecture} id="builder">
          <div className={styles.architectureIntro}>
            <p className={styles.eyebrow}>SYSTEM ARCHITECTURE</p>
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

        <section className={styles.notes} id="phone">
          <article>
            <span>03 / PHONE</span>
            <h2>Subscribe, then scan.</h2>
            <p>
              Run <code>oc-remote topic --qr</code> to subscribe the ntfy app,
              then scan the QR printed by <code>oc-remote web</code> to open the
              control surface over your tailnet.
            </p>
          </article>
          <article>
            <span>SECURITY BOUNDARY</span>
            <h2>Your tailnet is the lock.</h2>
            <p>
              The launcher binds only to the Tailscale IP and refuses to start
              without one. The ntfy topic is a password: keep it out of logs,
              screenshots, and source control.
            </p>
          </article>
        </section>

        <footer className={styles.footer}>
          <a href={REPOSITORY_URL}>View source on GitHub ↗</a>
          <a href="https://github.com/anomalyco/opencode/issues/41155">
            OpenCode picker issue ↗
          </a>
        </footer>
      </main>
    </div>
  )
}
